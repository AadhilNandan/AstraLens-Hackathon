from flask import Flask, send_file, abort
from flask_cors import CORS
import os
from flask import request, jsonify
import requests
from dotenv import load_dotenv


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

@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    # Get the data your React app sent
    data = request.get_json()
    user_question = data.get('userQuestion')
    knowledge_base = data.get('knowledgeBase')

    # Get the secret API key from Render's environment variables
    gemini_api_key = os.getenv('GEMINI_API_KEY')

    if not gemini_api_key:
        return jsonify({"error": "Server configuration error: API key not found."}), 500

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}"

    prompt = f"""You are Astra, an AI assistant for a lunar reconnaissance application. Your knowledge base is the following JSON data containing information about lunar craters, missions, people, and general facts. Answer the user's question concisely based ONLY on this provided data. Do not mention that you are an AI. If the information is not in the data, say that you can only answer questions based on the provided lunar dataset.

    JSON KNOWLEDGE BASE:
    {knowledge_base}

    USER QUESTION:
    "{user_question}"
    """

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    try:
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error calling Google API: {e}")
        try:
            return jsonify(response.json()), response.status_code
        except:
            return jsonify({"error": "An internal server error occurred while contacting the AI."}), 500


if __name__ == '__main__':
    print(f"Starting server. Current working directory: {os.getcwd()}")
    app.run(debug=True, port=5000)

