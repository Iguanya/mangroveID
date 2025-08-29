import os
import requests

# Backend scan endpoint
SCAN_URL = "http://localhost:5000/scan"

# Path to frontend uploaded images
UPLOADS_DIR = "../public/uploads"  # adjust if your backend is in a separate folder

# Loop through all images
for filename in os.listdir(UPLOADS_DIR):
    if filename.endswith(".png") or filename.endswith(".jpg"):
        filepath = os.path.join(UPLOADS_DIR, filename)
        with open(filepath, "rb") as f:
            files = {"file": (filename, f, "image/jpeg")}
            response = requests.post(SCAN_URL, files=files)
            if response.ok:
                print("✅", response.json())
            else:
                print("❌ Error for", filename, response.text)
