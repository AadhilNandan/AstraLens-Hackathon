from flask import Flask, send_file, abort
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# CRITICAL FIX: Z is string, order is Z/Y/X
@app.route("/tiles/<string:z>/<int:y>/<int:x>.png") 
def get_tile(z, y, x):
    
    if x < 0 or y < 0:
        abort(404)
        
    # Construct the file path: tiles/moon/{z}/{y}/{x}.png
    filepath = f"tiles/moon/{z}/{y}/{x}.png"
    
    if os.path.exists(filepath):
        return send_file(filepath, mimetype="image/png")
    else:
        abort(404)

if __name__ == '__main__':
    print(f"Starting server. Current working directory: {os.getcwd()}")
    app.run(debug=True, port=5000)

