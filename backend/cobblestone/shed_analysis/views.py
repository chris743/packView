from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from .models import Orders
from datetime import date
from django.db.models import Q
import pandas as pd
import re

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

        today_orders_list = today_orders.values()

        df = pd.DataFrame(today_orders_list)

        print(type(df))

        # Sum up total bags
        current_value = today_orders.aggregate(total_bags=Sum('order_quantity'))['total_bags'] or 0

        # Response with current value and capacity limit
        data = {
            "currentValue": current_value,
            "capacityLimit": capacity_limit,
        }
        return Response(data, status=status.HTTP_200_OK)

class FoxCapacityView(APIView):
    """
    API View to calculate and return Giro capacity.
    """
    def get(self, request):
        today = date.today()
        capacity_limit = 336000  # Set the Giro capacity limit

        # Filter data for today
        today_orders = Orders.objects.filter(
            ship_date=today,
            style_id__iregex=r'fox|F'
        )

        # Sum up total bags
        current_value = today_orders.aggregate(total_bags=Sum('order_quantity'))['total_bags'] or 0

        # Response with current value and capacity limit
        data = {
            "currentValue": current_value,
            "capacityLimit": capacity_limit,
        }
        return Response(data, status=status.HTTP_200_OK)
    
class VexarCapacityView(APIView):
    """
    API View to calculate and return Giro capacity.
    """
    def get(self, request):
        today = date.today()
        capacity_limit = 336000  # Set the Giro capacity limit

        # Filter data for today
        today_orders = Orders.objects.filter(
            ship_date=today,
            style_id__iregex=r'vex|V'
        )

        # Sum up total bags
        current_value = today_orders.aggregate(total_bags=Sum('order_quantity'))['total_bags'] or 0

        # Response with current value and capacity limit
        data = {
            "currentValue": current_value,
            "capacityLimit": capacity_limit,
        }
        return Response(data, status=status.HTTP_200_OK)
    
class BulkCapacityView(APIView):
    """
    API View to calculate and return Bulk capacity,
    excluding giro, fox, and vex styles.
    """
    def get(self, request):
        today = date.today()
        capacity_limit = 336000  # Set the Bulk capacity limit

        # Exclude orders with styles containing 'giro', 'fox', or 'vex'
        today_orders = Orders.objects.filter(
            ship_date=today
        ).exclude(
            Q(style_id__icontains='giro') |
            Q(style_id__icontains='fox') |
            Q(style_id__icontains='vex') |
            Q(style_id__icontains='G') |
            Q(style_id__icontains='F') |
            Q(style_id__icontains='V') 
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

class CapacityGaugeView(APIView):
    """
    API View to calculate and return capacities for giro, fox, vex, and bulk.
    """
    def split_count_size(self, df, style_col, order_quantity_col):
        """
        Splits count and size from the style column and calculates total bags.
        """
        def extract_count_size(style):
            if not isinstance(style, str):
                return None, None
            match = re.search(r'(\d+)[/-](\d+)', style)
            if match:
                return int(match.group(1)), int(match.group(2))
            return None, None

        # Extract count and size
        counts_and_sizes = df[style_col].apply(lambda x: pd.Series(extract_count_size(x)))
        counts_and_sizes.columns = ['count', 'size']

        # Calculate total bags
        counts_and_sizes = counts_and_sizes.assign(
            total_bags=counts_and_sizes['count'] * df[order_quantity_col]
        )

        # Adjust for 'TWB' styles
        counts_and_sizes['total_bags'] = counts_and_sizes.apply(
            lambda row: row['total_bags'] / 18 if 'TWB' in str(df.loc[row.name, style_col]) else row['total_bags'],
            axis=1
        )

        # Combine with original DataFrame
        df = pd.concat([df.reset_index(drop=True), counts_and_sizes.reset_index(drop=True)], axis=1)
        return df

    def compute_capacity(row):
            capacities = []
            if row.get('grade_id') == 'CHOICE':
                capacities.append(0.7)
            if 'rpc' in str(row.get('method_id')).lower():
                capacities.append(0.85)
            if str(row.get('style_id')).upper() in ['5# CARTON', '10# CARTON']:
                capacities.append(0.2)
            else:
                capacities.append(1)
            return min(capacities) * row['order_quantity'] if capacities else None

    def get(self, request):
        today = date.today()

        # Fetch orders and convert to DataFrame
        orders_qs = Orders.objects.filter(ship_date=today).values()
        df = pd.DataFrame(orders_qs)

        if df.empty:
            return Response({"error": "No orders found for today"}, status=status.HTTP_404_NOT_FOUND)

        # Process the DataFrame using split_count_size
        df = self.split_count_size(df, style_col='style_id', order_quantity_col='order_quantity')

        # Define capacity limits
        capacity_limits = {
            "giro": 336000,
            "fox": 60000,
            "vex": 76000,
            "bulk": 20000
        }


        # Filter and calculate totals for each category
        capacities = {
            "giro": df[df['style_id'].str.contains('giro', case=False, na=False)]['total_bags'].sum(),
            "fox": df[df['style_id'].str.contains('fox', case=False, na=False)]['total_bags'].sum(),
            "vex": df[df['style_id'].str.contains('vex', case=False, na=False)]['total_bags'].sum(),
            "bulk": df[~df['style_id'].str.contains('giro|fox|vex', case=False, na=False)]['total_bags'].sum(),
        }
    

        # Build response data
        data = {
            "capacities": {
                "giro": {
                    "currentValue": capacities["giro"],
                    "capacityLimit": capacity_limits["giro"],
                },
                "fox": {
                    "currentValue": capacities["fox"],
                    "capacityLimit": capacity_limits["fox"],
                },
                "vex": {
                    "currentValue": capacities["vex"],
                    "capacityLimit": capacity_limits["vex"],
                },
                "bulk": {
                    "currentValue": capacities["bulk"],
                    "capacityLimit": capacity_limits["bulk"],
                },
            }
        }

        return Response(data, status=status.HTTP_200_OK)