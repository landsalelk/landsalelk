import base64
import os
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("DISCORD_TOKEN")
if token:
    try:
        id_part = token.split('.')[0]
        # Add padding just in case, though usually not needed for these
        id_part += '=' * (-len(id_part) % 4)
        client_id = base64.b64decode(id_part).decode('utf-8')
        print(f"CLIENT_ID={client_id}")
    except Exception as e:
        print(f"Error decoding: {e}")
else:
    print("No token found")
