from flask import Flask, send_file, abort
from flask_cors import CORS
import os
from flask import request, jsonify
import json
from dotenv import load_dotenv

# --- Official Google Generative AI SDK Imports ---
import google.auth
from google import genai
from google.generativeai.errors import APIError
# -------------------------------------------------

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- GLOBAL AUTHENTICATION SETUP: Reading JSON content securely ---
try:
    credentials = None
    client = None

    # Get the JSON content from the new secure environment variable
    service_account_json_content = os.getenv('SERVICE_ACCOUNT_JSON')
    
    if service_account_json_content:
        # Load credentials directly from the JSON string content (secure method)
        credentials, _ = google.auth.load_credentials_from_dict(
            json.loads(service_account_json_content),
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        
        # Initialize the official Gemini Client using the loaded credentials
        client = genai.Client(credentials=credentials)
        print("Google credentials and Gemini Client loaded successfully from SERVICE_ACCOUNT_JSON.")
    else:
        # Fallback if the environment variable is missing (for local dev environments that use ADC)
        print("SERVICE_ACCOUNT_JSON not found. Attempting to load via default method.")
        client = genai.Client()

except Exception as e:
    # This FATAL error block only runs if the JSON is malformed or the key is revoked.
    print(f"FATAL: Could not initialize Gemini Client. Check SERVICE_ACCOUNT_JSON content. Error: {e}")
    client = None

# We use the SDK, so the base URL is not needed, but keeping the model name handy
GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-09-2025"
# -----------------------------------------------------------------


@app.route("/tiles/<string:z>/<int:y>/<int:x>.png") 
def get_tile(z, y, x): 
    # Tile serving logic
    if x < 0 or y < 0:
        abort(404)     
    filepath = f"tiles/moon/{z}/{y}/{x}.png"
    
    if os.path.exists(filepath):
        return send_file(filepath, mimetype="image/png")
    else:
        abort(404)

# Load local knowledge base data
with open("lunar_database.json", "r") as f:
    LUNAR_DATA = json.load(f)


@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    global client # Access the globally loaded client instance

    if not client:
        return jsonify({"error": "AI Service not configured: Missing Google credentials."}), 500

    data = request.get_json()
    user_question = data.get('user_question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400
    
    # --- PROMPT LOGIC (Minimal for testing connectivity) ---
    prompt = f"You are Astra, an assistant for lunar reconnaissance. Please answer this simple question: {user_question}"
    # --- END PROMPT LOGIC ---
    
    try:
        # Use the official SDK to generate content
        response = client.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=[prompt]
        )

        # The SDK response object gives the text directly
        ai_text = response.text
        
        return jsonify({"answer": ai_text})
    
    except APIError as e:
        # Catch specific SDK API errors (e.g., 400 Bad Request, 429 Rate Limit)
        error_message = f"Gemini API Error: {e}"
        print(f"API Error contacting Gemini: {error_message}")
        
        # Check for rate limit specifically, though the SDK may handle this internally
        if "rate limit" in str(e).lower() or "429" in str(e):
            return jsonify({"error": "Rate limit exceeded. Please wait a moment and try again."}), 429
            
        return jsonify({"error": error_message}), 500
        
    except Exception as e:
        print(f"General Error during API call: {e}")
        return jsonify({"error": "Failed to contact Gemini (General Error)."}), 500
    
if __name__ == '__main__':
    print(f"Starting server. Current working directory: {os.getcwd()}")
    app.run(debug=True, port=5000)
