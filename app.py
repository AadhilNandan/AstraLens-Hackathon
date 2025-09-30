from flask import Flask, send_file, abort
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/tiles/<string:z>/<int:y>/<int:x>.png")
def get_tile(z, y, x):

    try:
        z_int = int(z)
    except ValueError:
        abort(404) 

    if x < 0 or y < 0:
        abort(404)

    filepath = f"tiles/{z}/{y}/{x}.png"

    if os.path.exists(filepath):
        return send_file(filepath, mimetype="image/png")
    else:
        abort(404)

if __name__ == '__main__':
    app.run(debug=True, port=5000)