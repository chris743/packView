from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Max
from django.db.models.functions import Cast
from django.db.models.fields import IntegerField
from .models import BinInventory  # Update this with your actual model
import logging

logger = logging.getLogger(__name__)

from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from django.db.models.functions import Cast
from django.db.models import IntegerField
import logging

logger = logging.getLogger(__name__)

def process_size_id(df):
    """
    Process the size_id column in the DataFrame based on commodity_id.
    """
    def cast_size_id(row):
        # Perform the size_id cast only if the commodity_id is not 'Gold Nugget'
        if row['commodity_id'] != 'Gold Nugget':
            try:
                return int(row['size_id'])
            except (ValueError, TypeError):
                return None  # Return None if casting fails
        return row['size_id']  # Return the original size_id for 'Gold Nugget'

    df['size_id'] = df.apply(cast_size_id, axis=1)
    return df


class BinInventoryView(APIView):
    """
    View to fetch bin inventory data and associated records.
    """
    def get(self, request):
        """
        Fetch the table data grouped by commodity_id, region_id, grade_id, and size_id.
        """
        try:
            # Fetch and group data
            data = (
                BinInventory.objects
                .values('commodity_id', 'region_id', 'grade_id', 'size_id')
                .annotate(
                    total_quantity=Sum('on_hand_quantity')
                )
                .order_by('commodity_id', 'region_id', 'grade_id', 'size_id')
            )

            # Convert queryset to a DataFrame
            df = pd.DataFrame(list(data))

            if df.empty:
                return Response({"message": "No data available."}, status=status.HTTP_204_NO_CONTENT)

            # Process the size_id column
            df = process_size_id(df)

            # Replace NaN values with a JSON-compatible format (None for null in JSON)
            df = df.fillna(value={'size_id': '', 'commodity_id': '', 'region_id': '', 'grade_id': '', 'total_quantity': 0})

            # Convert the DataFrame back to a dictionary
            results = df.to_dict(orient='records')

            return Response(results, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching bin inventory data: {e}")
            return Response({"error": "Failed to fetch bin inventory data."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AssociatedBinsView(APIView):
    def get(self, request):
        # Get query parameters
        commodity = request.query_params.get('commodity')
        grade = request.query_params.get('grade')
        size = request.query_params.get('size')

        # Validate parameters
        if not (commodity and grade and size):
            return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)

        if len(size) < 3:
            size=size.zfill(3)
        try:
            # Fetch records based on filters
            print(commodity, grade, size)
            records = BinInventory.objects.filter(
                commodity_id=commodity,
                grade_id=grade,
                size_id=size.rstrip("/")
            ).values(
                'tag_id', 'commodity_id', 'size_id', 'grade_id', 
                'on_hand_quantity', 'warehouse_location', 'room_row_id'
            )

            # Check if any records were found
            if not records:
                return Response({"message": "No records found."}, status=status.HTTP_404_NOT_FOUND)

            return Response(list(records), status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
