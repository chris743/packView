import os
import requests
import pandas as pd
from msal import ConfidentialClientApplication

def download_from_onedrive():
    # Azure AD credentials
    CLIENT_ID = "c72ddf80-f0a3-43c5-ac7c-07dd09a8867e"
    CLIENT_SECRET = "QuJ8Q~NWxLs6y9TRIqiPlFSUaKuDiVBTOZHpBcd7"
    TENANT_ID = "b79f57a1-8aba-4596-bbaa-a566eede506d"

    # MS Graph settings
    AUTHORITY = f"https://login.microsoftonline.com/b79f57a1-8aba-4596-bbaa-a566eede506d"
    SCOPE = ["https://graph.microsoft.com/.default"]

    # OneDrive info
    DRIVE_ID = "0c2b118b-ef0a-44aa-b7ec-a9d9941481e8"  # or user ID
    FOLDER_PATH = "/orders"  # Path in OneDrive

    # Authenticate
    app = ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )
    token_response = app.acquire_token_for_client(scopes=SCOPE)

    if "access_token" not in token_response:
        print("Auth failed:", token_response)
        raise Exception("Failed to authenticate")


    access_token = token_response['access_token']
    headers = {"Authorization": f"Bearer {access_token}"}

    user_email = "order.data@cobblestonefruit.com"
    url = f"https://graph.microsoft.com/v1.0/users/{user_email}/drive"
    response = requests.get(url, headers=headers)
    #drive_id = response.json()['id']
    #print("Drive ID for user:", drive_id)
    print(response.json())


    # List files in OneDrive folder
    url = f"https://graph.microsoft.com/v1.0/users/{DRIVE_ID}/drive/root:{FOLDER_PATH}:/children"
    response = requests.get(url, headers=headers)
    files = response.json().get("value", [])

    # Filter for CSVs and get the latest one
    csv_files = [f for f in files if f['name'].endswith('.csv')]
    newest_file = max(csv_files, key=lambda f: f['lastModifiedDateTime'])

    # Download the file
    download_url = newest_file["@microsoft.graph.downloadUrl"]
    df = pd.read_csv(download_url)
    print(f"Downloaded and loaded: {newest_file['name']}")

    return df
