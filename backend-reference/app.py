"""
Flask ML Backend – Agri-IoT Decision Support System
====================================================
Based on your friend's original app.py with these fixes & additions:
  ✔ BUG FIX: crop_model was never loaded (joblib.load was missing)
  ✔ REST API endpoints (so Angular frontend can call it via HTTP)
  ✔ CORS for Vercel frontend
  ✔ PORT binding for Render deployment
  ✔ ESP32 sensor data ingestion endpoints

Models (YOUR files):
  - crop_random_forest_model.pkl  (Random Forest – 7 features)
  - resnet18_disease_model.pth    (ResNet18 – 8 disease classes)

Feature order for crop model:  [N, P, K, pH, temp, hum, moist]
Disease classes: 8

Endpoints:
  GET  /                         → health check
  POST /predict_crop             → crop recommendation from sensor data
  POST /predict_disease          → disease identification from plant image
  POST /api/sensor-data          → receive sensor data from ESP32
  GET  /api/sensor-data/latest   → get latest stored sensor readings
  GET  /api/sensor-data/history  → get sensor history

Deployment (Render):
  Build command:  pip install -r requirements.txt
  Start command:  gunicorn app:app  (or: python app.py)
"""

import os
import io
import json
import base64
import logging
import numpy as np
from datetime import datetime

import torch
import torch.nn as nn
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from torchvision import transforms, models

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ══════════════════════════════════════════════════════════════
# CORS – Allow your frontend origins
# ══════════════════════════════════════════════════════════════
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:4200",                    # Angular dev server
    "https://your-frontend.vercel.app",         # ← REPLACE with your Vercel URL
    "https://*.vercel.app",                     # Wildcard for Vercel preview deploys
]}})

# ══════════════════════════════════════════════════════════════
# TRAINING-DATA MEANS (for imputing missing sensor values)
# These should match the mean of your training dataset.
# Using reasonable agricultural defaults – UPDATE these with
# your actual training data means for best accuracy:
#   df[['N','P','K','pH','temp','hum','moist']].mean()
# ══════════════════════════════════════════════════════════════
TRAINING_MEANS = {
    "N":     50.55,   # Nitrogen (kg/ha)
    "P":     53.36,   # Phosphorus (kg/ha)
    "K":     48.15,   # Potassium (kg/ha)
    "pH":    6.47,    # Soil pH
    "temp":  25.62,   # Temperature (°C)
    "hum":   71.48,   # Humidity (%)
    "moist": 64.00,   # Soil Moisture (%)
}

# ══════════════════════════════════════════════════════════════
# IN-MEMORY SENSOR STORE (for ESP32 data)
# Replace with MongoDB/PostgreSQL in production
# ══════════════════════════════════════════════════════════════
sensor_store = {
    "latest": None,
    "history": [],
}
MAX_HISTORY = 100


# ══════════════════════════════════════════════════════════════
# 1. LOAD ML MODELS
# ══════════════════════════════════════════════════════════════

# --- Crop model (Random Forest via joblib) --------------------
# ⚠ BUG FIX: Your friend's code called crop_model.predict() but
#   never loaded the model! This line was missing.
crop_model = None
CROP_MODEL_PATH = os.environ.get("CROP_MODEL_PATH", "crop_random_forest_model.pkl")
try:
    crop_model = joblib.load(CROP_MODEL_PATH)
    logger.info("✅ Crop model loaded from %s", CROP_MODEL_PATH)
except Exception as e:
    logger.warning("⚠ Could not load crop model: %s", e)

# --- Disease model (ResNet18 – 8 classes) ---------------------
disease_model = None
DISEASE_MODEL_PATH = os.environ.get("DISEASE_MODEL_PATH", "resnet18_disease_model.pth")
NUM_DISEASE_CLASSES = int(os.environ.get("NUM_DISEASE_CLASSES", "8"))

try:
    disease_model = models.resnet18(weights=None)
    num_ftrs = disease_model.fc.in_features
    disease_model.fc = nn.Linear(num_ftrs, NUM_DISEASE_CLASSES)

    state_dict = torch.load(DISEASE_MODEL_PATH, map_location="cpu")
    disease_model.load_state_dict(state_dict)
    disease_model.eval()
    logger.info("✅ Disease model loaded from %s (%d classes)", DISEASE_MODEL_PATH, NUM_DISEASE_CLASSES)
except Exception as e:
    logger.warning("⚠ Could not load disease model: %s", e)

# Disease class names – update to match YOUR 8 classes
CLASS_NAMES_PATH = os.environ.get("CLASS_NAMES_PATH", "class_names.json")
if os.path.exists(CLASS_NAMES_PATH):
    with open(CLASS_NAMES_PATH) as f:
        DISEASE_CLASSES = json.load(f)
    logger.info("✅ Disease class names loaded from %s", CLASS_NAMES_PATH)
else:
    # Default – REPLACE with your actual class names
    DISEASE_CLASSES = [
        "Healthy",
        "Bacterial Leaf Blight",
        "Brown Spot",
        "Leaf Smut",
        "Blast",
        "Tungro",
        "Sheath Blight",
        "False Smut",
    ]
    logger.info("ℹ Using default disease class names (create class_names.json for accuracy)")

# Image preprocessing (matches your friend's original transform)
disease_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


# ══════════════════════════════════════════════════════════════
# MQTT (optional – from your friend's original code)
# ══════════════════════════════════════════════════════════════
# Uncomment if you also want MQTT alongside REST.
# For Render deployment, REST-only is simpler and recommended.
#
# import paho.mqtt.client as mqtt
#
# def on_message(client, userdata, message):
#     data = json.loads(message.payload.decode("utf-8"))
#     sensor_features = [[data['N'], data['P'], data['K'], data['pH'],
#                         data['temp'], data['hum'], data['moist']]]
#     recommended_crop = crop_model.predict(sensor_features)[0]
#
#     if 'image_base64' in data:
#         image_data = base64.b64decode(data['image_base64'])
#         image = Image.open(io.BytesIO(image_data)).convert('RGB')
#         input_tensor = disease_transform(image).unsqueeze(0)
#         with torch.no_grad():
#             output = disease_model(input_tensor)
#             disease_idx = torch.argmax(output, dim=1).item()
#         disease_name = DISEASE_CLASSES[disease_idx]
#     else:
#         disease_name = None
#
#     client.publish("agri/decision", json.dumps({
#         "recommended_crop": str(recommended_crop),
#         "detected_disease": disease_name,
#         "status": "Success",
#     }))
#
# mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
# mqtt_client.on_message = on_message
# mqtt_client.connect("broker.hivemq.com", 1883, 60)
# mqtt_client.subscribe("agri/sensors")
# mqtt_client.loop_start()


# ══════════════════════════════════════════════════════════════
# REST API ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "message": "Agritech Cloud API is Running!",
        "crop_model_loaded": crop_model is not None,
        "disease_model_loaded": disease_model is not None,
        "latest_sensor_data": sensor_store["latest"] is not None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


# ──────────────────────────────────────────────────────────────
# ESP32 SENSOR DATA INGESTION
# ──────────────────────────────────────────────────────────────

@app.route("/api/sensor-data", methods=["POST"])
def receive_sensor_data():
    """
    Receive sensor data from ESP32 via HTTP POST.

    ALL fields are OPTIONAL. Send only what sensors you have.
    Missing fields default to 0.

    Example (partial – only temp and humidity available):
    { "temp": 28.5, "hum": 78.0 }

    Example (full):
    { "N": 280, "P": 22, "K": 195, "pH": 6.5, "temp": 28.5, "hum": 78.0, "moist": 68.0 }
    """
    data = request.get_json(force=True)

    if not data:
        return jsonify({"error": "Empty request body"}), 400

    # Store ONLY the sensor values that were actually sent.
    # Do NOT fill in zeros or defaults — that's the predict endpoint's job.
    all_keys = ["N", "P", "K", "pH", "temp", "hum", "moist"]
    available_sensors = [k for k in all_keys if k in data and data[k] is not None]

    reading = {"timestamp": datetime.utcnow().isoformat() + "Z"}
    for k in available_sensors:
        reading[k] = float(data[k])
    reading["available_sensors"] = available_sensors

    sensor_store["latest"] = reading
    sensor_store["history"].append(reading)
    if len(sensor_store["history"]) > MAX_HISTORY:
        sensor_store["history"] = sensor_store["history"][-MAX_HISTORY:]

    logger.info("📡 Sensor data received (%d/%d sensors): %s",
                len(available_sensors), 7, ", ".join(available_sensors))

    return jsonify({"status": "ok", "received": reading, "sensors_count": len(available_sensors)}), 201


@app.route("/api/sensor-data/latest", methods=["GET"])
def get_latest_sensor_data():
    """Return latest sensor reading. Frontend auto-fills the crop form with this."""
    if sensor_store["latest"] is None:
        return jsonify({"error": "No sensor data available yet"}), 404
    return jsonify(sensor_store["latest"])


@app.route("/api/sensor-data/history", methods=["GET"])
def get_sensor_history():
    """Return sensor reading history."""
    limit = request.args.get("limit", 50, type=int)
    return jsonify(sensor_store["history"][-limit:])


# ──────────────────────────────────────────────────────────────
# CROP PREDICTION (Random Forest)
# Feature order: [N, P, K, pH, temp, hum, moist]
# ──────────────────────────────────────────────────────────────

@app.route("/predict_crop", methods=["POST"])
def predict_crop():
    """
    Predict the best crop based on available sensor data.

    ALL fields are OPTIONAL. Send only what sensors you have.
    Missing fields are imputed with training-data means (not 0),
    so the prediction is based on the sensors you actually have.

    Examples:
      Full:    { "N": 280, "P": 22, "K": 195, "pH": 6.5, "temp": 28, "hum": 78, "moist": 68 }
      Partial: { "temp": 28, "hum": 78, "pH": 6.5 }
      Empty:   {} → uses latest ESP32 sensor data automatically
    """
    if crop_model is None:
        return jsonify({"error": "Crop model not loaded"}), 503

    data = request.get_json(force=True) if request.is_json else {}

    # Fallback to stored ESP32 data if no input provided
    if not data:
        if sensor_store["latest"]:
            data = sensor_store["latest"]
            logger.info("Using latest stored sensor data for crop prediction")
        else:
            return jsonify({"error": "No sensor data provided and no stored data available"}), 400

    all_keys = ["N", "P", "K", "pH", "temp", "hum", "moist"]

    # Determine which sensors were actually provided
    provided = [k for k in all_keys if k in data and data[k] is not None]
    missing  = [k for k in all_keys if k not in provided]

    # Build feature vector: use real value if provided, training mean if missing
    # Feature order MUST match training: [N, P, K, pH, temp, hum, moist]
    try:
        features = []
        imputed_values = {}
        for k in all_keys:
            if k in provided:
                features.append(float(data[k]))
            else:
                mean_val = TRAINING_MEANS[k]
                features.append(mean_val)
                imputed_values[k] = mean_val
        features = [features]
    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

    logger.info("Crop prediction – provided: %s | imputed: %s",
                provided, list(imputed_values.keys()))

    prediction = crop_model.predict(features)[0]

    confidence = None
    if hasattr(crop_model, "predict_proba"):
        proba = crop_model.predict_proba(features)[0]
        confidence = round(float(np.max(proba)) * 100, 2)

    result = {
        "recommended_crop": str(prediction),
        "confidence": confidence,
        "sensors_used": provided,
    }
    if missing:
        result["warning"] = (
            f"Missing sensors ({', '.join(missing)}) were filled with "
            f"training-data averages. Prediction is based on {len(provided)}/7 real sensors."
        )
        result["imputed"] = imputed_values

    return jsonify(result)


# ──────────────────────────────────────────────────────────────
# DISEASE PREDICTION (ResNet18 – 8 classes)
# ──────────────────────────────────────────────────────────────

@app.route("/predict_disease", methods=["POST"])
def predict_disease():
    """
    Predict plant disease from an uploaded image.
    Expects multipart/form-data with field "file" containing the image.
    """
    if disease_model is None:
        return jsonify({"error": "Disease model not loaded"}), 503

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send image as 'file' field."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
    except Exception:
        return jsonify({"error": "Invalid image file"}), 400

    input_tensor = disease_transform(image).unsqueeze(0)

    with torch.no_grad():
        output = disease_model(input_tensor)
        probabilities = torch.nn.functional.softmax(output, dim=1)[0]
        confidence, disease_idx = torch.max(probabilities, 0)

    idx = disease_idx.item()
    disease_name = DISEASE_CLASSES[idx] if idx < len(DISEASE_CLASSES) else f"Class {idx}"

    return jsonify({
        "predicted_disease": disease_name,
        "confidence": round(confidence.item() * 100, 2),
    })


# ══════════════════════════════════════════════════════════════
# RUN – Render injects PORT env variable automatically
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info("Starting Flask server on port %d", port)
    app.run(host="0.0.0.0", port=port, debug=False)
