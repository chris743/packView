from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from .models import Orders
from datetime import date

class GiroCapacityView(APIView):
    """
    API View to calculate and return Giro capacity.
    """
    def get(self, request):
        today = date.today()
        capacity_limit = 336000  # Set the Giro capacity limit

        # Filter data for today
        today_orders = Orders.objects.filter(
            ship_date=today,
            style_id__iregex=r'giro|G'
        )

        # Sum up total bags
        current_value = today_orders.aggregate(total_bags=Sum('order_quantity'))['total_bags'] or 0

        # Response with current value and capacity limit
        data = {
            "currentValue": current_value,
            "capacityLimit": capacity_limit,
        }
        return Response(data, status=status.HTTP_200_OK)


class GiroBarDataView(APIView):
    """
    API View to provide Giro bar chart data.
    """
    def get(self, request):
        today = date.today()

        # Filter orders for Giro style and today's date
        today_orders = Orders.objects.filter(
            ship_date=today,
            style_id__iregex=r'giro|G'
        )

        # Group by size and calculate total quantity
        size_data = today_orders.values('size_id').annotate(
            total_quantity=Sum('order_quantity')
        )

        # Format response
        data = [
            {
                "size": f"{item['size_id']} lb",
                "total_quantity": item['total_quantity']
            }
            for item in size_data
        ]

        return Response(data, status=status.HTTP_200_OK)
