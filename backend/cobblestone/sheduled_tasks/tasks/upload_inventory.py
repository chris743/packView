import os
import imaplib
import email
from email.header import decode_header
import pandas as pd
from datetime import datetime
from django.db import transaction
from shed_analysis.models import BinInventory  # Replace 'myapp' with the name of your Django app

# Email connection credentials
EMAIL = 'cobblestonedata@gmail.com'
PASSWORD = 'jgld fvhx fvfo cdpo'
IMAP_SERVER = 'imap.gmail.com'

# Folder to store downloaded reports
REPORT_DIR = './reports'
os.makedirs(REPORT_DIR, exist_ok=True)

# Connect to the email account
def connect_to_email():
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL, PASSWORD)
        mail.select('inbox')
        return mail
    except Exception as e:
        print(f"Failed to connect to email: {e}")
        return None

# Search, download attachments, and delete processed emails
def download_reports(mail):
    reports = []
    try:
        status, messages = mail.search(None, 'UNSEEN')  # Search for unread messages
        for msg_id in messages[0].split():
            _, msg_data = mail.fetch(msg_id, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject, encoding = decode_header(msg['Subject'])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding or 'utf-8')
                    
                    if 'Bin' in subject:  # Check for emails with reports
                        for part in msg.walk():
                            if part.get_content_disposition() == 'attachment':
                                filename = part.get_filename()
                                filepath = os.path.join(REPORT_DIR, filename)
                                with open(filepath, 'wb') as f:
                                    f.write(part.get_payload(decode=True))
                                reports.append(filepath)
                                print(f'Downloaded {filename}')
                        
                        # Mark email for deletion
                        mail.store(msg_id, '+FLAGS', '\\Deleted')
                        print(f"Email with subject '{subject}' marked for deletion.")
        
        mail.expunge()  # Permanently delete marked emails
    except Exception as e:
        print(f"Failed to download reports: {e}")
    return reports

# Combine reports and push data to BinInventory model
def combine_and_import_reports():
    all_dataframes = []
    for report in os.listdir(REPORT_DIR):
        filepath = os.path.join(REPORT_DIR, report)
        if filepath.endswith('.csv'):
            try:
                df = pd.read_csv(filepath)

                # Adjust headers: lowercase and replace spaces with underscores
                df.columns = df.columns.str.lower().str.replace(' ', '_')
                
                all_dataframes.append(df)
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

    if all_dataframes:
        combined_df = pd.concat(all_dataframes, ignore_index=True)

        # Debug: Print column names
        print("Combined DataFrame columns:", combined_df.columns)

        # Check for 'tag_id' column
        if 'tag_id' not in combined_df.columns:
            print("Error: 'tag_id' column is missing in the combined data.")
            return  # Exit the function if 'tag_id' is missing

        # Generate a new import_id
        new_import_id = int(datetime.utcnow().timestamp())  # Use a timestamp as a unique import ID
        combined_df['import_id'] = new_import_id

        # Clear the existing data in BinInventory
        try:
            BinInventory.objects.all().delete()
            print("Cleared existing data in BinInventory.")
        except Exception as e:
            print(f"Error clearing BinInventory data: {e}")
            return

        # Insert the new data into BinInventory
        try:
            with transaction.atomic():
                inventory_objects = [
                    BinInventory(
                        size_id=row.get('size_id'),
                        on_hand_quantity=row.get('on_hand_quantity'),
                        import_id=row['import_id'],
                        grade_id=row.get('grade_id'),
                        variety_id=row.get('variety_id'),
                        commodity_id=row.get('commodity_id'),
                        first_receive_date=row.get('first_receive_date'),
                        warehouse_location=row.get('warehouse_location'),
                        company=row.get('company'),
                        commodity_id_1=row.get('commodity_id.1'),
                        grade_id_1=row.get('grade_id.1'),
                        style_id=row.get('style_id'),
                        method_id=row.get('method_id'),
                        room_row_id=row.get('room_row_id'),
                        tag_id=row['tag_id'],  # Primary key
                        region_id=row.get('region_id')
                    )
                    for _, row in combined_df.iterrows()
                ]
                BinInventory.objects.bulk_create(inventory_objects)
                print(f"Imported {len(inventory_objects)} records into BinInventory.")
        except Exception as e:
            print(f"Failed to import data into BinInventory: {e}")

        # Clear processed reports
        for report in os.listdir(REPORT_DIR):
            os.remove(os.path.join(REPORT_DIR, report))
        print("Reports processed and directory cleared.")
    else:
        print("No valid reports found for combining.")