from django.db.models import Sum, F, FloatField, ExpressionWrapper
from django.http import JsonResponse
from django.utils.dateparse import parse_date
from .models import packs_completed
from grower_portal.models import ProductionRuns
import json

def average_packout_report(request):
    start = request.GET.get("start_date")
    end = request.GET.get("end_date")
    pool = request.GET.get("pool")
    grower = request.GET.get("grower")
    block = request.GET.get("block")

    start = str(start) if start else None
    end = str(end) if end else None

    runs = ProductionRuns.objects.filter(run_date__range=(start, end))
    if pool:
        runs = runs.filter(pool__icontains=pool)
    if grower:
        runs = runs.filter(grower__icontains=grower)
    if block:
        runs = runs.filter(block_id__icontains=block)

    raw_packs = packs_completed.objects.using('scanner_db').filter(created__date__range=(start, end))

    result = {}

    for pack in raw_packs:
        try:
            payload = pack.payload if isinstance(pack.payload, dict) else json.loads(pack.payload)
            args = payload.get("EventArgs", {})
            block_id = args.get("UserData.Famous.GrowerBlockId")
            pool_id = args.get("UserData.Famous.LotID")
            size_id = args.get("UserData.Famous.Size")
            grade_id = args.get("UserData.Famous.Grade")
            grower_id = block_id[:4] if block_id else None

            # Apply filters
            if pool and str(pool_id).lower() != pool.lower():
                continue
            if grower and str(grower_id).lower() != grower.lower():
                continue
            if block and str(block_id).lower() != block.lower():
                continue

            key = (block_id, size_id, grade_id)

            if key not in result:
                result[key] = {
                    "block": block_id,
                    "grower": grower_id,
                    "pool": pool_id,
                    "size": size_id,
                    "grade": grade_id,
                    "total_weight_lb": 0,
                    "total_count": 0,
                }

            weight_raw = args.get("FruitWeightsDecigrams")
            if weight_raw:
                try:
                    weight = [float(w) for w in str(weight_raw).split(",")]
                    total_lb = round(sum(weight) / 4536)
                    result[key]["total_weight_lb"] += round(total_lb, 2)
                except Exception as e:
                    print(f"Error processing weight: {e}")

            result[key]["total_count"] += args.get("PieceCount") or 0


        except Exception as e:
            print(f"Skipping pack due to error: {e}")
            continue

    # Finalize and compute average
    output = []
    for row in result.values():
        count = row["total_count"]
        row["avg_weight_per_piece"] = round((row["total_weight_lb"]) / count, 2) if count else None
        output.append(row)

    return JsonResponse(output, safe=False)
