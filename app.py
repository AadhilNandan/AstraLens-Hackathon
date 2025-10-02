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
    key_file_name = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if key_file_name:
        full_key_path = os.path.join(os.getcwd(), key_file_name)
        
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = full_key_path
        
        print(f"Set GOOGLE_APPLICATION_CREDENTIALS to: {full_key_path}")

    credentials, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    print("Google credentials loaded successfully.")
    
except Exception as e:
    print(f"FATAL: Could not load Google credentials. Error: {e}")
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
        response = authed_session.post(GEMINI_API_URL, json=payload)
        response.raise_for_status() 
        
        gemini_response = response.json()
        
        if response.status_code == 429:
             print("Error: Gemini API returned 429 Too Many Requests.")
             return jsonify({"error": "Rate limit exceeded. Please wait a moment."}), 429


        ai_text = (
            gemini_response.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "Sorry, I couldn't generate a response.")
        )

        return jsonify({"answer": ai_text})
    except requests.exceptions.HTTPError as e:
        error_message = f"AI service returned an HTTP error: {e}"
        try:
            error_details = response.json().get('error', {}).get('message', '')
            error_message += f" ({error_details})"
        except:
            pass
        
        print(f"HTTP Error contacting Gemini: {error_message}")
        return jsonify({"error": error_message}), 500
    except Exception as e:
        print(f"General Error: {e}")
        return jsonify({"error": "Failed to contact Gemini"}), 500    
if __name__ == '__main__':
    print(f"Starting server. Current working directory: {os.getcwd()}")
    app.run(debug=True, port=5000)

