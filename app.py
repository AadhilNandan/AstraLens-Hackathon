from flask import Flask, send_file, abort
from flask_cors import CORS
import os
from flask import request, jsonify
import requests
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

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
    data = request.get_json()
    user_question = data.get('user_question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        return jsonify({"error": "API key missing"}), 500

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}"

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
        response = requests.post(api_url, json=payload)
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

