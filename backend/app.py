import os
import cv2
import time
import mysql.connector
from flask import Flask, request, jsonify

app = Flask(__name__)

# Directory to save scans
UPLOAD_FOLDER = "scans"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database connection
db = mysql.connector.connect(
    host="localhost",      # change if using remote MySQL
    user="root",
    password="root_root",
    database="scans_db"
)
cursor = db.cursor()

@app.route("/scan", methods=["POST"])
def scan_and_save():
    # Here we simulate capturing with OpenCV (for now assume POST has image input later)
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        return jsonify({"error": "Failed to capture image"}), 500

    # Save with timestamp
    timestamp = int(time.time())
    filename = f"scan_{timestamp}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    cv2.imwrite(filepath, frame)

    # Save record in MySQL
    sql = "INSERT INTO scans (filename) VALUES (%s)"
    cursor.execute(sql, (filename,))
    db.commit()

    return jsonify({
        "message": "Scan saved",
        "filename": filename,
        "filepath": filepath
    })

@app.route("/scans", methods=["GET"])
def list_scans():
    cursor.execute("SELECT id, filename, timestamp, created_at, updated_at FROM scans ORDER BY id DESC")
    rows = cursor.fetchall()
    scans = [
        {
            "id": r[0],
            "filename": r[1],
            "timestamp": r[2].strftime("%Y-%m-%d %H:%M:%S"),
            "created_at": r[3].strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": r[4].strftime("%Y-%m-%d %H:%M:%S"),
        }
        for r in rows
    ]
    return jsonify(scans)

if __name__ == "__main__":
    app.run(debug=True)
