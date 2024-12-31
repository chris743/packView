import os
import pandas as pd
import hashlib
from datetime import datetime, date
from shed_analysis.models import Orders  # Replace 'myapp' with the actual app name
from django.db.models import Max

# Hardcoded directory path
FILE_DIRECTORY = "C:/Users/chris/OneDrive - Cobblestone Fruit Company/order_data"  # Update this path

def process_newest_file():
    """Processes the newest file in the specified directory."""
    try:
        # Find the newest file
        files = [os.path.join(FILE_DIRECTORY, f) for f in os.listdir(FILE_DIRECTORY) if f.endswith('.csv')]
        if not files:
            print("No CSV files found in the directory.")
            return

        newest_file = max(files, key=os.path.getctime)
        print(f"Processing newest file: {newest_file}")

        # Load the newest file
        df = pd.read_csv(newest_file)
        now = datetime.now()

        # Transform headers to lowercase and replace spaces with underscores
        df.columns = df.columns.str.lower().str.replace(' ', '_')

        # Normalize `size_id` column to always have leading zeros
        if 'size_id' in df.columns:
            df['size_id'] = df['size_id'].astype(str).str.replace('.0$', '', regex=True).str.zfill(3)

        # Generate a unique line ID by hashing key fields
        def generate_line_id(row):
            unique_str = f"{row['sales_order_number']}_{row['commodity_id']}_{row['style_id']}_{row['order_quantity']}_{row['size_id']}_{row['grade_id']}"
            return hashlib.md5(unique_str.encode()).hexdigest()

        df['line_id'] = df.apply(generate_line_id, axis=1)
        df['uploaded_at'] = now

        # Filter out rows with duplicate line_id within the file
        duplicate_line_ids = df[df.duplicated(subset=['line_id'], keep=False)]
        if not duplicate_line_ids.empty:
            print("Duplicate line_ids found in the file. These rows will not be uploaded:")
            print(duplicate_line_ids)

        # Remove rows with duplicate line_ids
        df = df[~df['line_id'].isin(duplicate_line_ids['line_id'])]

        if df.empty:
            print("No valid rows to upload after removing duplicates.")
            return

        # Retrieve the latest import_id and increment it by 1
        latest_import_id = Orders.objects.aggregate(latest_import_id=Max('import_id'))['latest_import_id'] or 0
        new_import_id = latest_import_id + 1
        df['import_id'] = new_import_id

        # Delete rows with matching line_id and rows for today/future dates
        today_date = date.today()

        Orders.objects.filter(line_id__in=df['line_id'].tolist()).delete()
        Orders.objects.filter(uploaded_at__date__gte=today_date).delete()

        # Set the "flag" for current import rows
        df['flag'] = df.apply(
            lambda row: 'day_of_order' if row.get('sales_order_date') == row.get('ship_date') else '',
            axis=1
        )

        # Prepare orders for bulk_create
        print("Preparing orders for bulk_create...")
        orders = [
            Orders(
                line_id=row['line_id'],
                order_quantity=row.get('order_quantity'),
                uploaded_at=row['uploaded_at'],
                import_id=row['import_id'],
                sales_order_date=row.get('sales_order_date'),
                reserved=row.get('reserved'),
                ship_date=row.get('ship_date'),
                commodity_id=row.get('commodity_id'),
                style_id=row.get('style_id'),
                size_id=row.get('size_id'),
                grade_id=row.get('grade_id'),
                label_id=row.get('label_id'),
                region_id=row.get('region_id'),
                method_id=row.get('method_id'),
                storage_id=row.get('storage_id'),
                color_id=row.get('color_id'),
                flag=row['flag'],
                warehouse_location=row.get('warehouse_location'),
                shipped_status=row.get('shipped_status'),
                customer=row.get('customer'),
                ship_to_location=row.get('ship_to_location'),
                sales_order_number=row.get('sales_order_number'),
                salesperson=row.get('salesperson'),
                customer_po_number=row.get('customer_po_number'),
            )
            for _, row in df.iterrows()
        ]

        try:
            Orders.objects.bulk_create(orders)
            print(f"Inserted {len(orders)} orders successfully.")
        except Exception as e:
            print(f"Error during data insertion: {e}")

    except Exception as e:
        print(f"An error occurred while processing the file: {e}")
