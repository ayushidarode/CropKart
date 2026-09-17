import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()
load_dotenv("backend/.env")

api_key = os.getenv("LANGFLOW_API_KEY", "")
headers = {"x-api-key": api_key} if api_key else {}
client = httpx.Client(base_url="http://localhost:7860", headers=headers, timeout=10.0)

all_comps = client.get("/api/v1/all").json()
google_data = all_comps.get("google", {}).get("ext:google:GoogleGenerativeAIComponent@official")
flow = client.get("/api/v1/flows/7ee6cd01-deec-4f9c-8cfc-66e16d94ca10").json()

print("Google component outputs:")
for out in google_data.get("outputs", []):
    print("  Output:", out)
