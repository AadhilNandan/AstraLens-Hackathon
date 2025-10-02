from flask import Flask, send_file, abort
from flask_cors import CORS
import os
from flask import request, jsonify
import requests
import json
import google.auth
from google.auth.transport.requests import AuthorizedSession
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)

try:
    credentials, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    print("Google credentials loaded successfully.")
except Exception as e:
    print(f"FATAL: Could not load Google credentials. Please check GOOGLE_APPLICATION_CREDENTIALS. Error: {e}")
    credentials = None
    project = None
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent"


@app.route("/tiles/<string:z>/<int:y>/<int:x>.png") 
def get_tile(z, y, x): 
    
    if x < 0 or y < 0:
        abort(404)    
    filepath = f"tiles/moon/{z}/{y}/{x}.png"
    
    if os.path.exists(filepath):
        return send_file(filepath, mimetype="image/png")
    else:
        abort(404)

with open("lunar_database.json", "r") as f:
    LUNAR_DATA = json.load(f)



@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    global credentials

    if not credentials:
        return jsonify({"error": "Google credentials not configured"}), 500
    data = request.get_json()
    user_question = data.get('user_question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    authed_session = AuthorizedSession(credentials)

    prompt = f"""
    You are Astra, an assistant for lunar reconnaissance. 
    Use ONLY the following dataset to answer questions:

    JSON KNOWLEDGE BASE:
    {json.dumps(LUNAR_DATA, indent=2)}

    USER QUESTION:
    "{user_question}"
    """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(GEMINI_API_URL, json=payload)
        response.raise_for_status()
        gemini_response = response.json()
        ai_text = (
            gemini_response.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "Sorry, I couldn't generate a response.")
        )

        return jsonify({"answer": ai_text})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to contact Gemini"}), 500
    
if __name__ == '__main__':
    print(f"Starting server. Current working directory: {os.getcwd()}")
    app.run(debug=True, port=5000)

