from flask import Flask, send_file, abort, request, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv

# --- Official Google Generative AI SDK Imports ---
import google.auth
import google.generativeai as genai
from google.api_core import exceptions
# -------------------------------------------------

load_dotenv()

app = Flask(__name__)
CORS(app)

try:
    client = None
    service_account_json_content = os.getenv('SERVICE_ACCOUNT_JSON')

    if service_account_json_content:
        credentials, _ = google.auth.load_credentials_from_dict(
            json.loads(service_account_json_content),
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        genai.configure(credentials=credentials)
        client = genai.GenerativeModel('gemini-pro')
        print("Gemini Client initialized successfully from SERVICE_ACCOUNT_JSON.")
    else:
        print("SERVICE_ACCOUNT_JSON not found. Attempting to load via API Key.")
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            client = genai.GenerativeModel('gemini-pro')
            print("Gemini Client initialized successfully using API_KEY.")
        else:
            print("FATAL: No SERVICE_ACCOUNT_JSON or GEMINI_API_KEY found.")
            client = None

except Exception as e:
    print(f"FATAL: Could not initialize Gemini Client. Check credentials. Error: {e}")
    client = None
# --------------------------------------------------------------------


# --- Tile Server Logic ---
@app.route("/tiles/<string:z>/<int:y>/<int:x>.png") 
def get_tile(z, y, x): 
    if x < 0 or y < 0:
        abort(404)     
    filepath = f"tiles/moon/{z}/{y}/{x}.png"
    
    if os.path.exists(filepath):
        return send_file(filepath, mimetype="image/png")
    else:
        abort(404)
# -------------------------


# --- Load Local Knowledge Base Data ---
try:
    with open("lunar_database.json", "r") as f:
        LUNAR_DATA = json.load(f)
    print("Lunar knowledge base loaded successfully.")
except FileNotFoundError:
    print("FATAL: lunar_database.json not found. AI will have no context.")
    LUNAR_DATA = {}
# ------------------------------------


@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    global client

    if not client:
        return jsonify({"error": "AI Service not configured: Missing Google credentials."}), 500

    data = request.get_json()
    user_question = data.get('user_question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    # --- KNOWLEDGE BASE INJECTION PROMPT ---
    prompt = f"""
    You are Astra, an expert AI assistant for the AstraLens lunar reconnaissance application.
    Your knowledge is strictly limited to the information provided in the following Lunar Knowledge Base JSON data.
    You must not use any external knowledge or make up information.
    If the answer to the user's question cannot be found in the provided data, you must state: "I cannot answer that based on the provided data."

    --- LUNAR KNOWLEDGE BASE ---
    {json.dumps(LUNAR_DATA, indent=2)}
    --- END KNOWLEDGE BASE ---

    Based ONLY on the data above, answer the following question.

    User Question: "{user_question}"

    Answer:
    """
    # --- END PROMPT LOGIC ---

    try:
        response = client.generate_content(prompt)
        ai_text = response.text
        return jsonify({"answer": ai_text})

    except exceptions.ResourceExhausted as e:
        print(f"API Error: Rate limit exceeded. {e}")
        return jsonify({"error": "Rate limit exceeded. Please wait and try again."}), 429

    except exceptions.PermissionDenied as e:
        print(f"API Error: Permission denied. Check API key. {e}")
        return jsonify({"error": "Authentication error. Please check your API key."}), 403

    except exceptions.GoogleAPICallError as e:
        print(f"A Google API call error occurred: {e}")
        return jsonify({"error": "An error occurred while communicating with the AI service."}), 500
    
    except Exception as e:
        print(f"General Error during API call: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

if __name__ == '__main__':
    print(f"Starting server. Current working directory: {os.getcwd()}")
    app.run(debug=True, port=5000)

