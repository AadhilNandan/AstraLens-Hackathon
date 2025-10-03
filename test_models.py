import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from your .env file
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file.")
else:
    genai.configure(api_key=api_key)

    print("✅ Models available to your API key:")
    for m in genai.list_models():
        # Check if the model supports the 'generateContent' method
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")