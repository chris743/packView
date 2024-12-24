import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
import hashlib
import tkinter as tk
from tkinter import filedialog

# Database connection details
DATABASE_TYPE = 'postgresql'
DBAPI = 'psycopg2'
USER = 'chrism'
PASSWORD = '!Cncamrts1'
HOST = '192.168.128.30'
PORT = '5432'
DATABASE = 'applications'
SCHEMA = 'public'
TABLE_NAME = 'shed_analysis_orders'

# Create database engine
engine = create_engine(f"{DATABASE_TYPE}+{DBAPI}://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}")

# Open a file picker dialog to select the file
root = tk.Tk()
root.withdraw()  # Hide the root window
file_path = filedialog.askopenfilename(title="Select Report File", filetypes=[("CSV files", "*.csv")])

if not file_path:
    print("No file selected. Exiting program.")
else:
    # Load the report file
    df = pd.read_csv(file_path)
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

    # Step 1: Filter out rows with duplicate line_id within the file
    duplicate_line_ids = df[df.duplicated(subset=['line_id'], keep=False)]
    if not duplicate_line_ids.empty:
        print("Duplicate line_ids found in the file. These rows will not be uploaded:")
        print(duplicate_line_ids)
    
    # Remove rows with duplicate line_ids
    df = df[~df['line_id'].isin(duplicate_line_ids['line_id'])]

    if df.empty:
        print("No valid rows to upload after removing duplicates.")
    else:
        # Retrieve the latest import_id and increment it by 1
        with engine.connect() as connection:
            result = connection.execute(text(f"SELECT COALESCE(MAX(import_id), 0) FROM {SCHEMA}.{TABLE_NAME}"))
            latest_import_id = result.scalar()
            new_import_id = latest_import_id + 1

        df['import_id'] = new_import_id

        # Step 2: Delete rows with matching line_id in the database and rows for today/future dates
        today_date = date.today()

        with engine.begin() as connection:
            # Delete rows with matching line_id
            line_ids_to_replace = df['line_id'].tolist()
            connection.execute(
                text(f"""
                    DELETE FROM {SCHEMA}.{TABLE_NAME}
                    WHERE line_id = ANY(:line_ids)
                """),
                {'line_ids': line_ids_to_replace}
            )

            # Delete rows for today and future dates
            connection.execute(
                text(f"""
                    DELETE FROM {SCHEMA}.{TABLE_NAME}
                    WHERE uploaded_at::date >= :today_date
                """),
                {'today_date': today_date}
            )

        # Step 3: Set the "flag" for current import rows
        df['flag'] = df.apply(
            lambda row: 'day_of_order' if row['sales_order_date'] == row['ship_date'] else '',
            axis=1
        )

        # Step 4: Insert the filtered data into the database
        try:
            with engine.begin() as connection:
                df.to_sql(TABLE_NAME, connection, schema=SCHEMA, if_exists='append', index=False)
            print("Data uploaded successfully with import tracking.")
        except IntegrityError as e:
            print("Error uploading data:", e)
