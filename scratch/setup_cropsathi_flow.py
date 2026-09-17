import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()
load_dotenv("backend/.env")

api_key = os.getenv("LANGFLOW_API_KEY", "")
headers = {"x-api-key": api_key} if api_key else {}
client = httpx.Client(base_url="http://localhost:7860", headers=headers, timeout=20.0)

SYSTEM_PROMPT = """You are CropSathi AI, an intelligent digital farming assistant for the CropKart application.

Your job is to help farmers and buyers with agricultural questions.

You can answer questions about:
- crop cultivation
- soil
- irrigation
- fertilizers
- pests and diseases
- harvesting
- crop information
- basic market and farming guidance

Support:
- English
- Hindi
- Marathi

Answer in the same language used by the user whenever possible.

Keep answers simple, practical and easy for farmers to understand.

IMPORTANT:
At this stage, you do NOT have access to:
- PostgreSQL
- farmer database
- buyer database
- live crop inventory
- live mandi prices
- orders
- payments
- logistics
- notifications

Do not invent live database information.

If the user asks for live availability, seller information, current inventory, exact mandi prices, orders, payments, or logistics, clearly say that the required live tool/data connection has not been connected yet.

For normal farming questions, provide a useful answer.

Do not claim that an action was completed unless a connected tool actually performed it."""

# 1. Fetch current flow
flow = client.get("/api/v1/flows/7ee6cd01-deec-4f9c-8cfc-66e16d94ca10").json()

# 2. Get Google component template from all components
all_comps = client.get("/api/v1/all").json()
google_comp_data = all_comps.get("google", {}).get("ext:google:GoogleGenerativeAIComponent@official")

# Update Google component template
google_node_id = "GoogleGenerativeAIModel-cropsathi"
google_tmpl = dict(google_comp_data["template"])
google_tmpl["model_name"]["value"] = "gemini-2.5-flash"
google_tmpl["api_key"]["value"] = "GOOGLE_API_KEY"
google_tmpl["api_key"]["load_from_db"] = True
google_tmpl["temperature"]["value"] = 0.2

google_node = {
    "id": google_node_id,
    "type": "genericNode",
    "position": {"x": 100, "y": 450},
    "data": {
        "id": google_node_id,
        "type": "GoogleGenerativeAIModel",
        "node": {
            "template": google_tmpl,
            "description": google_comp_data.get("description", ""),
            "display_name": "Google Generative AI",
            "base_classes": google_comp_data.get("base_classes", []),
            "outputs": google_comp_data.get("outputs", [])
        }
    }
}

# 3. Update Agent node in flow
nodes = flow["data"]["nodes"]
# Remove any previous google node if present
nodes = [n for n in nodes if n["id"] != google_node_id]
nodes.append(google_node)

for node in nodes:
    if node["data"]["type"] == "Agent":
        tmpl = node["data"]["node"]["template"]
        tmpl["system_prompt"]["value"] = SYSTEM_PROMPT
        tmpl["api_key"]["value"] = "GOOGLE_API_KEY"
        tmpl["api_key"]["load_from_db"] = True

flow["data"]["nodes"] = nodes

# 4. Configure edges:
# ChatInput -> Agent
# GoogleGenerativeAI -> Agent (model)
# Agent -> ChatOutput
edge_llm = {
    "id": f"reactflow__edge-{google_node_id}-Agent-pgSfi-model",
    "source": google_node_id,
    "target": "Agent-pgSfi",
    "sourceHandle": '{"dataType":"GoogleGenerativeAIModel","id":"' + google_node_id + '","name":"model_output","output_types":["LanguageModel"]}',
    "targetHandle": '{"fieldName":"model","id":"Agent-pgSfi","inputTypes":["LanguageModel"],"type":"model"}',
    "data": {
        "sourceHandle": {
            "dataType": "GoogleGenerativeAIModel",
            "id": google_node_id,
            "name": "model_output",
            "output_types": ["LanguageModel"]
        },
        "targetHandle": {
            "fieldName": "model",
            "id": "Agent-pgSfi",
            "inputTypes": ["LanguageModel"],
            "type": "model"
        }
    }
}

clean_edges = []
for e in flow["data"]["edges"]:
    if "ChatInput" in e["source"] and "Agent" in e["target"]:
        clean_edges.append(e)
    elif "Agent" in e["source"] and "ChatOutput" in e["target"]:
        clean_edges.append(e)

clean_edges.append(edge_llm)
flow["data"]["edges"] = clean_edges
flow["data"]["edges"] = clean_edges

# 5. Patch the flow in LangFlow
patch_resp = client.patch("/api/v1/flows/7ee6cd01-deec-4f9c-8cfc-66e16d94ca10", json=flow)
print("Flow update status:", patch_resp.status_code)

# 6. Test run with query
print("Running test query on updated flow...")
test_payload = {
    "output_type": "chat",
    "input_type": "chat",
    "input_value": "What is the best soil for tomato?"
}
run_resp = client.post("/api/v1/run/7ee6cd01-deec-4f9c-8cfc-66e16d94ca10", json=test_payload)
print("Run status code:", run_resp.status_code)
if run_resp.status_code == 200:
    res_data = run_resp.json()
    msg = res_data["outputs"][0]["outputs"][0]["results"]["message"]["data"]["text"]
    print("\n--- TEST RESPONSE ---")
    print(msg[:300])
else:
    print("Run error:", run_resp.text[:500])
