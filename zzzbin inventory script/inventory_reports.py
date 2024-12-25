import imaplib
import email
from email.header import decode_header
import pandas as pd
import time
import os
from push_to_db import push_to_db

# Email connection credentials
EMAIL = 'cobblestonedata@gmail.com'
PASSWORD = 'jgld fvhx fvfo cdpo'
IMAP_SERVER = 'imap.gmail.com'

# Folder to store downloaded reports
REPORT_DIR = './reports'
OUTPUT_DIR = './output'
os.makedirs(REPORT_DIR, exist_ok=True)

# Connect to the email account
def connect_to_email():
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL, PASSWORD)
        mail.select('inbox')
        return mail
    except:
        return None

# Search, download attachments, and delete the processed email
def download_reports(mail):
    reports = []
    status, messages = mail.search(None, 'UNSEEN')  # Search for unread messages
    for msg_id in messages[0].split():
        _, msg_data = mail.fetch(msg_id, '(RFC822)')
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                subject, encoding = decode_header(msg['Subject'])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding or 'utf-8')
                
                # Check for emails with reports (could match based on subject keywords)
                if 'Bin' in subject:
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
    
    # Permanently delete marked emails
    mail.expunge()
    return reports

# Combine the reports into a single CSV
def combine_reports():
    all_dataframes = []
    print("Files in report directory:", os.listdir(REPORT_DIR))  # Check directory contents
    for report in os.listdir(REPORT_DIR):
        filepath = os.path.join(REPORT_DIR, report)
        if filepath.endswith('.csv'):
            print(f"Processing file: {filepath}")  # Log each file being processed
            try:
                df = pd.read_csv(filepath)
                all_dataframes.append(df)
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
    
    if all_dataframes:
        combined_df = pd.concat(all_dataframes, ignore_index=True)
        combined_csv_path = os.path.join(OUTPUT_DIR, 'combined_report.csv')
        try:
            combined_df.to_csv(combined_csv_path, index=False)
            print(f'Combined report saved to {combined_csv_path}')
        except Exception as e:
            print(f"Error saving combined report: {e}")
        push_to_db(combined_csv_path)
        return combined_csv_path
        
    else:
        print("No CSV files found for combining.")

# Main loop to constantly check for emails and combine reports
def main():
    mail = connect_to_email()
    while True:
        reports = download_reports(mail)
        
        # Check if 3 reports are downloaded
        if len(os.listdir(REPORT_DIR)) >= 4:
            combine_reports()
            # Clear reports after combining
            for report in os.listdir(REPORT_DIR):
                os.remove(os.path.join(REPORT_DIR, report))
            print("Reports processed and combined.")
        
        time.sleep(5)  # Wait before checking again
        print("checking")

if __name__ == "__main__":
    main()
