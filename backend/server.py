import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from solver import ScheduleSolver

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR)

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)

@app.route("/generate", methods=["POST"])
def generate_schedule():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Geçersiz veri biçimi."}), 400

    solver = ScheduleSolver(data)
    result = solver.solve()
    
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)