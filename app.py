from flask import Flask, send_file, abort, request, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv

# --- Official Google Generative AI SDK Imports ---
import google.generativeai as genai
from google.api_core import exceptions
# -------------------------------------------------

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Gemini API Key Auth Only ---
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    client = genai.GenerativeModel("models/gemini-pro-latest")
    print("Gemini client initialized successfully with API key.")
else:
    print("FATAL: GEMINI_API_KEY not found in environment variables.")
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

    --- LUNAR KNOWLEDGE BASE ---
    {json.dumps(LUNAR_DATA, indent=2)}
    --- END KNOWLEDGE BASE ---

    Based ONLY on the data above, answer the following question.
    IMPORTANT FORMATTING RULES:
    - Present the information in a clear, conversational, and easy-to-read summary. Do not just dump the raw data.
    - Use markdown formatting like bolding (`**text**`) for titles and bullet points (`-`) for lists.
    - For features with many satellite features, you can summarize them or list just a few examples.
    - If the data does not contain the answer, respond with "I cannot answer that based on the provided data."
    User Question: "{user_question}"

    Astra's Answer:
    """
    # --- END PROMPT LOGIC ---

    try:
        response = client.generate_content(prompt)

        ai_text = getattr(response, "text", "").strip()
        if not ai_text:
            ai_text = "I cannot answer that based on the provided data."
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

