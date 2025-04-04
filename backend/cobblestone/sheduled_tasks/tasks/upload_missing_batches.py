import os
from django.utils import timezone
from grower_portal.models import ProductionRuns, SizerReport
from grower_portal.sizer.parser import load_sizer_batch_file  # your parser function
from datetime import timedelta

SIZER_PATH = r"\\TOMRA-PC\Converter-Files"  # update as needed

def import_completed_sizer_batches():
    """
    Checks for completed ProductionRuns with a batch value and no SizerBatchData,
    then parses and imports the associated sizer .txt file.
    """
    runs = (
        ProductionRuns.objects
        .filter(run_status="Complete", batch_id__isnull=False)
    )

    print(runs)

    for run in runs:
        filename = f"Sizer{run.batch_id}.txt"
        filepath = os.path.join(SIZER_PATH, filename)

        if not os.path.exists(filepath):
            print(f"⚠️ No file found for batch: {run.batch_id}")
            continue

        try:
            parsed_data = load_sizer_batch_file(filepath)
            print(parsed_data)
            #parsed_data = str(parsed_data)
            SizerReport.objects.create(process_run_id=run.id, raw_JSON=parsed_data)
            print(f"✅ Imported Sizer file for batch: {run.batch_id}")
        except Exception as e:
            print(f"❌ Failed to import file for batch {run.batch_id}: {e}")