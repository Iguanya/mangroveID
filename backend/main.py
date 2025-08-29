import os
import time
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image, ImageOps
from crud import insert_scan, list_scans
from keras.models import load_model
from keras.layers import TFSMLayer
import tensorflow as tf
from flask_cors import CORS

import hashlib
import logging


app = Flask(__name__)
CORS(app)  # <-- enable CORS for all routes


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ----------------------
# Directories
# ----------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ----------------------
# Load ML Model
# ----------------------

model = tf.keras.Sequential([
    TFSMLayer("ml_model/", call_endpoint="serving_default")
])
class_names = [c.strip() for c in open("ml_model/labels.txt").readlines()]

# ----------------------
# Routes
# ----------------------

@app.route("/scan", methods=["POST"])
def scan_and_predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    # Compute file hash to detect duplicates
    file_content = file.read()
    file_hash = hashlib.md5(file_content).hexdigest()
    file.seek(0)  # Reset file pointer after reading

    # Check for duplicates in DB
    existing_scans = list_scans()
    for scan in existing_scans:
        if 'file_hash' in scan and scan['file_hash'] == file_hash:
            logger.info(f"Duplicate file detected: {file.filename} (hash: {file_hash})")
            return jsonify({
                "message": "Duplicate file upload detected",
                "existing_scan": scan
            }), 200

    # Save locally
    timestamp = int(time.time())
    filename = f"scan_{timestamp}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    logger.info(f"Saved file: {filename} at {filepath}")

    # Preprocess for ML
    image = Image.open(filepath).convert("RGB")
    image = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1
    data = np.expand_dims(normalized_image_array, axis=0)

    # Predict
    prediction = model.predict(data)
    prediction_array = list(prediction.values())[0]  # first (and only) output
    logger.info(f"Prediction array shape: {prediction_array.shape}")

    top_index = int(np.argmax(prediction_array))
    class_name = class_names[top_index]
    confidence = float(prediction_array[0][top_index])
    logger.info(f"Predicted: {class_name}, Confidence: {confidence:.4f}")

    # Save in DB
    scan_id = insert_scan(filename, f"/{UPLOAD_FOLDER}/{filename}", class_name, confidence)
    logger.info(f"Scan inserted into DB with ID: {scan_id}, file hash: {file_hash}")

    return jsonify({
        "filename": filename,
        "file_path": f"/{UPLOAD_FOLDER}/{filename}",
        "predicted_class": class_name,
        "confidence": confidence,
        "file_hash": file_hash,
        "scan_id": scan_id
    })


@app.route("/scans", methods=["GET"])
def get_scans():
    return jsonify(list_scans())

# ----------------------
# Run server
# ----------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

