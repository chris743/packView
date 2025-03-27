from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import CharField
from .models import Orders
from datetime import date
from django.db.models import Q, F, Value, Sum, Avg
from django.db.models.functions import Concat
from datetime import date, timedelta
import pandas as pd
import re
from zoneinfo import ZoneInfo
from datetime import datetime, time

class CapacityGaugeView(APIView):
    """
    API View to calculate and return capacities for giro, fox, vex, and bulk.
    """
    def split_count_size(self, df, style_col, order_quantity_col):
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

    def compute_capacity(self, row):
        capacities = []
        if row.get('grade_id') == 'CHOICE':
            capacities.append(0.7)
        if 'rpc' in str(row.get('method_id')).lower():
            capacities.append(0.85)
        if str(row.get('style_id')).upper() in ['5# CARTON', '10# CARTON']:
            capacities.append(0.2)
        else:
            capacities.append(1)
        return min(capacities) * row['remaining_quantity'] if capacities else None

    def get(self, request):
        pst_timezone = ZoneInfo("America/Los_Angeles")
        today = datetime.now(pst_timezone).date()

        # Fetch orders and convert to DataFrame
        orders_qs = Orders.objects.filter(ship_date=today).values()
        df = pd.DataFrame(orders_qs)

        df = df[~df['customer'].str.contains('CALIFORNIA ASSOC OF FOOD BANKS', case=False, na=False)]

        if df.empty:
            return Response({"error": "No orders found for today"}, status=status.HTTP_404_NOT_FOUND)
        
        df['remaining_quantity'] = df['order_quantity'] - df['filled_quantity']

        # Process the DataFrame using split_count_size
        df = self.split_count_size(df, style_col='style_id', order_quantity_col='remaining_quantity')


        # Define capacity limits
        capacity_limits = {
            "giro": 336000,
            "fox": 100000,
            "vex": 76000,
            "bulk": 20000
        }

        # Calculate capacities
        df['computed_capacity'] = df.apply(self.compute_capacity, axis=1)

        minutes_since_4am = (int((datetime.now() - datetime.combine(datetime.today(), time(4, 0))).total_seconds() / 60)) % 1440

        elapsed_modifier = 1 + (minutes_since_4am / 1440)

        # Filter and calculate totals for each category
        capacities = {
            "giro": (df[df['style_id'].str.contains(r'(?i)(giro|^TWB.*G$)', na=False)]['total_bags'].sum()) * elapsed_modifier,
            "fox": (df[df['style_id'].str.contains(r'(?i)(fox|^TWB.*F$)', case=False, na=False)]['total_bags'].sum() * elapsed_modifier),
            "vex": (df[df['style_id'].str.contains(r'(?i)(fox|^TWB.*F$)', case=False, na=False)]['total_bags'].sum() * elapsed_modifier),
            "bulk": (df[~df['style_id'].str.contains('giro|fox|vex|TWB', case=False, na=False)]['computed_capacity'].sum() * elapsed_modifier),
        }

        print((df[~df['style_id'].str.contains('giro|fox|vex|TWB', case=False, na=False)]['computed_capacity'].sum()))

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

class TopFiveThisWeek(APIView):

    """
    API View to return the top 5 products sold for each style (giro, fox, vex, bulk),
    sorted by the order_quantity column.
    """
    def get(self, request):
        pst_timezone = ZoneInfo("America/Los_Angeles")
        today = datetime.now(pst_timezone).date()
        # Calculate the start of the week (Sunday)
        start_of_week = today - timedelta(days=today.weekday() + 1 if today.weekday() != 6 else 0)
        end_of_week = start_of_week + timedelta(days=6)

        # Fetch orders for the week and annotate with concatenated product_name
        orders_qs = (
            Orders.objects.filter(ship_date__range=(start_of_week, end_of_week))
            .exclude(customer = 'CALIFORNIA ASSOC OF FOOD BANKS')
            .annotate(product_name=Concat(F('customer'), Value(' '), F('commodity_id'), Value(' '), F('style_id'), output_field=CharField()))
            .values('product_name', 'style_id')
            .annotate(total_order_quantity=Sum('order_quantity'))
        )
        df = pd.DataFrame(orders_qs)

        if df.empty:
            return Response({"error": f"No orders found for the week starting {start_of_week}"}, status=status.HTTP_404_NOT_FOUND)

        # Define filtering logic for bulk products
        def is_bulk(style):
            if style is None:
                return True  # Consider None as bulk
            style = style.lower()
            return not ("giro" in style or "fox" in style or "vex" in style)

        # Prepare results for each style
        styles = ['giro', 'fox', 'vex', 'bulk']
        result = {}
        for style in styles:
            if style == "bulk":
                # Apply bulk filtering logic
                filtered_df = df[df['style_id'].apply(is_bulk)]
            else:
                # Filter by other styles
                filtered_df = df[df['style_id'].str.contains(style, case=False, na=False)]

            # Sort by total_order_quantity and take the top 5
            top_products = (
                filtered_df.sort_values(by='total_order_quantity', ascending=False)
                .head(5)
                .to_dict(orient='records')
            )
            result[style] = top_products

        return Response(result, status=status.HTTP_200_OK)
    
class WeeklyStatsView(APIView):
    """
    API View to return statistics for each style (giro, fox, vex, bulk):
    - Total order quantity today.
    - Total order quantity this week.
    - Total order quantity last week.
    - Percentage of total for each time frame.
    """

    def get(self, request):
        pst_timezone = ZoneInfo("America/Los_Angeles")
        today = datetime.now(pst_timezone).date()

        start_of_week = today - timedelta(days=today.weekday())  # Start of the current week (Monday)
        end_of_week = start_of_week + timedelta(days=6)  # End of the current week (Sunday)
        start_of_last_week = start_of_week - timedelta(days=7)  # Start of the last week
        end_of_last_week = start_of_week - timedelta(days=1)  # End of the last week

        # Fetch total quantities for all styles
        total_today_all = Orders.objects.filter(ship_date=today).aggregate(total=Sum("order_quantity"))["total"] or 0
        total_this_week_all = Orders.objects.filter(ship_date__range=(start_of_week, end_of_week)).aggregate(total=Sum("order_quantity"))["total"] or 0
        total_last_week_all = Orders.objects.filter(ship_date__range=(start_of_last_week, end_of_last_week)).aggregate(total=Sum("order_quantity"))["total"] or 0

        # Fetch orders for today, this week, and last week
        orders_today = Orders.objects.filter(ship_date=today)
        orders_this_week = Orders.objects.filter(ship_date__range=(start_of_week, end_of_week))
        orders_last_week = Orders.objects.filter(ship_date__range=(start_of_last_week, end_of_last_week))

        # Helper function to calculate statistics for a style
        def calculate_stats(orders, style):
            if style == "bulk":
                # Bulk: Exclude giro, fox, vex
                today_bulk = orders_today.exclude(
                    style_id__icontains="giro"
                ).exclude(
                    style_id__icontains="fox"
                ).exclude(
                    style_id__icontains="vex"
                ).exclude(
                    style_id__icontains="V"
                ).exclude(
                    style_id__icontains="F"
                ).exclude(
                    style_id__icontains="G"
                ).aggregate(total=Sum("order_quantity"))["total"] or 0

                this_week_bulk = orders_this_week.exclude(
                    style_id__icontains="giro"
                ).exclude(
                    style_id__icontains="fox"
                ).exclude(
                    style_id__icontains="vex"
                ).exclude(
                    style_id__icontains="V"
                ).exclude(
                    style_id__icontains="F"
                ).exclude(
                    style_id__icontains="G"
                ).aggregate(total=Sum("order_quantity"))["total"] or 0

                last_week_bulk = orders_last_week.exclude(
                    style_id__icontains="giro"
                ).exclude(
                    style_id__icontains="fox"
                ).exclude(
                    style_id__icontains="vex"
                ).exclude(
                    style_id__icontains="V"
                ).exclude(
                    style_id__icontains="F"
                ).exclude(
                    style_id__icontains="G"
                ).aggregate(total=Sum("order_quantity"))["total"] or 0
                
                return {
                    "total_today": today_bulk,
                    "percent_today": round((today_bulk / total_today_all * 100),2) if total_today_all > 0 else 0,
                    "total_this_week": this_week_bulk,
                    "percent_this_week": round((this_week_bulk / total_this_week_all * 100)) if total_this_week_all > 0 else 0,
                    "total_last_week": last_week_bulk,
                    "percent_last_week": round((last_week_bulk / total_last_week_all * 100)) if total_last_week_all > 0 else 0,
                }
            else:
                # Other styles: Use simple filtering
                total_today = orders_today.filter(style_id__icontains=style).aggregate(total=Sum("order_quantity"))["total"] or 0
                total_this_week = orders_this_week.filter(style_id__icontains=style).aggregate(total=Sum("order_quantity"))["total"] or 0
                total_last_week = orders_last_week.filter(style_id__icontains=style).aggregate(total=Sum("order_quantity"))["total"] or 0

                return {
                    "total_today": total_today,
                    "percent_today": round((total_today / total_today_all * 100),2) if total_today_all > 0 else 0,
                    "total_this_week": total_this_week,
                    "percent_this_week": round((total_this_week / total_this_week_all * 100),2) if total_this_week_all > 0 else 0,
                    "total_last_week": total_last_week,
                    "percent_last_week": round((total_last_week / total_last_week_all * 100),2) if total_last_week_all > 0 else 0,
                }

        # Define styles
        styles = ["giro", "fox", "vex", "bulk"]

        # Prepare statistics for each style
        stats = {style: calculate_stats(Orders.objects, style) for style in styles}

        return Response(stats, status=status.HTTP_200_OK)
    
class ChartDataView(APIView):

    """
    API View to return bar chart data:
    - Total bags for each size for giro, fox, vex.
    - Total quantity for each method_id for bulk.
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

        # Combine with original DataFrame
        df = pd.concat([df.reset_index(drop=True), counts_and_sizes.reset_index(drop=True)], axis=1)
        return df

    def get(self, request):
        today = pd.Timestamp.now()

        # Fetch orders for the current week
        orders_qs = Orders.objects.filter(ship_date__week=today.week).values()
        df = pd.DataFrame(orders_qs)

        if df.empty:
            return Response({"error": "No data found for the current week"}, status=status.HTTP_404_NOT_FOUND)
        
        df['remaining_quantity'] = df['order_quantity'] - df['filled_quantity']


        # Split count and size for giro, fox, vex
        df = self.split_count_size(df, style_col='style_id', order_quantity_col='remaining_quantity')


        # Filter data for each style
        giro_data = df[df['style_id'].str.contains('giro', case=False, na=False)].groupby('size')['total_bags'].sum().to_dict()
        fox_data = df[df['style_id'].str.contains('fox', case=False, na=False)].groupby('size')['total_bags'].sum().to_dict()
        vex_data = df[df['style_id'].str.contains('vex', case=False, na=False)].groupby('size')['total_bags'].sum().to_dict()

        # Bulk data based on method_id
        bulk_data = (
            df[~df['style_id'].str.contains('giro|fox|vex|G|V|F', case=False, na=False)]
            .groupby('style_id')['remaining_quantity']
            .sum()
            .to_dict()
        )

        return Response(
            {
                "giro": giro_data,
                "fox": fox_data,
                "vex": vex_data,
                "bulk": bulk_data,
            },
            status=status.HTTP_200_OK,
        )
    
class OrdersDashboardAPIView(APIView):
    """
    APIView to provide data for the Orders Dashboard.
    """

    def get(self, request):
        try:
            # Fetch all orders with a positive order_quantity
            orders = Orders.objects.filter(order_quantity__gt=0)

            # Convert queryset to DataFrame for easier manipulation
            df = pd.DataFrame.from_records(orders.values())

            if df.empty:
                return Response({"error": "No data available"}, status=status.HTTP_404_NOT_FOUND)

            # Ensure ship_date is converted to datetime
            df['original_ship_date'] = pd.to_datetime(df['original_ship_date'])

            # Adjust order_quantity for specific styles
            df['order_quantity'] = df.apply(
                lambda row: row['order_quantity'] * 18 
                if 'tri-wall' in str(row.get('style_id', '')).lower() or 'twb' in str(row.get('style_id', '')).lower() 
                else row['order_quantity'],
                axis=1
            )

            # Today's date
            pst_timezone = ZoneInfo("America/Los_Angeles")
            today = datetime.now(pst_timezone).date()
            filtered_df = df[df['original_ship_date'] == pd.Timestamp(today)]

            # Pie chart data for commodity distribution
            commodity_sum = filtered_df.groupby('commodity_id')['order_quantity'].sum()
            commodity_pie_chart = {
                "labels": commodity_sum.index.tolist(),
                "datasets": [{
                    "data": commodity_sum.values.tolist(),
                    "backgroundColor": ["#0288d1", "#d32f2f", "#388e3c", "#fbc02d"]
                }]
            }

            # Bar chart data for size distribution
            size_bar_charts = []
            for commodity in filtered_df['commodity_id'].unique():
                commodity_data = filtered_df[filtered_df['commodity_id'] == commodity]
                size_sum = commodity_data.groupby('size_id')['order_quantity'].sum()

                size_bar_chart = {
                    "commodity": commodity,
                    "chart": {
                        "labels": size_sum.index.tolist(),
                        "datasets": [{
                            "data": size_sum.values.tolist(),
                            "backgroundColor": "#0288d1"
                        }]
                    }
                }
                size_bar_charts.append(size_bar_chart)

            # Line chart data for total order quantity over time
            daily_order_quantity = df.groupby('original_ship_date')['order_quantity'].sum().reset_index()
            order_quantity_line_chart = {
                "labels": daily_order_quantity['original_ship_date'].dt.strftime('%Y-%m-%d').tolist(),
                "datasets": [{
                    "data": daily_order_quantity['order_quantity'].tolist(),
                    "backgroundColor": "#0288d1"
                }]
            }

            # Metrics for cards
            total_shipping_today = filtered_df['order_quantity'].sum()
            total_shipping_season = df['order_quantity'].sum()
            total_day_of = filtered_df[filtered_df['flag'] == 'day_of_order']['order_quantity'].sum()
            total_assigned_day_of = filtered_df[filtered_df['flag'].isin(['assigned_day_of', 'day_of_order'])]['order_quantity'].sum()
            total_bag = filtered_df[filtered_df['style_id'].str.contains("giro|fox|vex|TWB", case=False, na=False)]['order_quantity'].sum()
            total_bulk = total_shipping_today - total_bag
            avg_order_qty = df.groupby('sales_order_number')['order_quantity'].mean().mean()
            avg_line_qty = filtered_df['order_quantity'].mean() if not filtered_df.empty else 0
            total_export_sales = df[df['salesperson'].str.contains("JIM LAMB", case=False, na=False)]['order_quantity'].sum()
            largest_single_day = df.groupby('ship_date')['order_quantity'].sum().max()

            # Prepare response data
            response_data = {
                "commodityPieChart": commodity_pie_chart,
                "sizeBarCharts": size_bar_charts,
                "orderQuantityLineChart": order_quantity_line_chart,
                "totalShippingToday": total_shipping_today,
                "totalShippingSeason": total_shipping_season,
                "totalDayOf": total_day_of,
                "totalAssignedDayOf": total_assigned_day_of,
                "totalBag": total_bag,
                "totalBulk": total_bulk,
                "avgOrderQty": round(avg_order_qty),
                "avgLineQty": round(avg_line_qty),
                "totalExportSales": total_export_sales,
                "largestSingleDay": largest_single_day,
            }

            return Response(response_data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
