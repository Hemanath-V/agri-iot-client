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

# import torch
# import torch.nn as nn
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
# from torchvision import transforms, models

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

def load_crop_model():
    global crop_model
    if crop_model is None:
        import joblib
        crop_model = joblib.load(CROP_MODEL_PATH)
        logger.info("✅ Crop model loaded lazily")
    return crop_model

@app.route("/warmup", methods=["GET"])
def warmup():
    try:
        load_crop_model()
        return jsonify({
            "status": "ready",
            "crop_model_loaded": crop_model is not None
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
  
# try:
    # crop_model = joblib.load(CROP_MODEL_PATH)
    # logger.info("✅ Crop model loaded from %s", CROP_MODEL_PATH)
# except Exception as e:
    # logger.warning("⚠ Could not load crop model: %s", e)

# --- Disease model (ResNet18 – 8 classes) ---------------------
disease_model = None
DISEASE_MODEL_PATH = os.environ.get("DISEASE_MODEL_PATH", "resnet18_disease_model.pth")
NUM_DISEASE_CLASSES = int(os.environ.get("NUM_DISEASE_CLASSES", "8"))

try:
    # disease_model = models.resnet18(weights=None)
    # num_ftrs = disease_model.fc.in_features
    # disease_model.fc = nn.Linear(num_ftrs, NUM_DISEASE_CLASSES)

    # state_dict = torch.load(DISEASE_MODEL_PATH, map_location="cpu")
    # disease_model.load_state_dict(state_dict)
    # disease_model.eval()
    # logger.info("✅ Disease model loaded from %s (%d classes)", DISEASE_MODEL_PATH, NUM_DISEASE_CLASSES)
    disease_model = None
    logger.info("⚠ Disease model disabled for deployment (memory optimization)")
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
# disease_transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
# ])


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

    Expects JSON (field names match your friend's MQTT format):
    {
      "N": 280, "P": 22, "K": 195,
      "pH": 6.5, "temp": 28.5, "hum": 78.0, "moist": 68.0
    }
    """
    data = request.get_json(force=True)

    required = ["N", "P", "K", "pH", "temp", "hum", "moist"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    reading = {
        "N": float(data["N"]),
        "P": float(data["P"]),
        "K": float(data["K"]),
        "pH": float(data["pH"]),
        "temp": float(data["temp"]),
        "hum": float(data["hum"]),
        "moist": float(data["moist"]),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

    sensor_store["latest"] = reading
    sensor_store["history"].append(reading)
    if len(sensor_store["history"]) > MAX_HISTORY:
        sensor_store["history"] = sensor_store["history"][-MAX_HISTORY:]

    logger.info("📡 Sensor: N=%s P=%s K=%s pH=%.1f temp=%.1f hum=%.1f moist=%.1f",
                reading["N"], reading["P"], reading["K"],
                reading["pH"], reading["temp"], reading["hum"], reading["moist"])

    return jsonify({"status": "ok", "received": reading}), 201


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
    Predict the best crop based on sensor data.

    Expects JSON:
    { "N": 280, "P": 22, "K": 195, "pH": 6.5, "temp": 28, "hum": 78, "moist": 68 }

    OR send empty body {} → uses latest ESP32 sensor data automatically.
    """
    try:
        # Step 1: Load model
        try:
            model = load_crop_model()
        except Exception as e:
            logger.error("❌ Failed to load crop model: %s", str(e))
            return jsonify({
                "error": "Failed to load crop model",
                "detail": str(e),
                "step": "model_loading"
            }), 503

        if model is None:
            return jsonify({"error": "Crop model is None after loading"}), 503

        # Step 2: Parse input data
        try:
            data = request.get_json(force=True) if request.is_json else {}
        except Exception as e:
            logger.error("❌ Failed to parse JSON: %s", str(e))
            return jsonify({
                "error": "Failed to parse request JSON",
                "detail": str(e),
                "step": "json_parsing"
            }), 400

        # Fallback to stored ESP32 data if no input provided
        if not data or "temp" not in data:
            if sensor_store["latest"]:
                data = sensor_store["latest"]
                logger.info("Using latest stored sensor data for crop prediction")
            else:
                return jsonify({"error": "No sensor data provided and no stored data available"}), 400

        # Step 3: Build features array
        try:
            features = [[
                float(data["N"]),
                float(data["P"]),
                float(data["K"]),
                float(data["pH"]),
                float(data["temp"]),
                float(data["hum"]),
                float(data["moist"]),
            ]]
            logger.info("📊 Features built: %s", features)
        except (KeyError, TypeError, ValueError) as e:
            logger.error("❌ Failed to build features: %s", str(e))
            return jsonify({
                "error": "Invalid input data",
                "detail": str(e),
                "step": "feature_building",
                "received_data": str(data)
            }), 400

        # Step 4: Predict
        try:
            prediction = model.predict(features)[0]
            logger.info("✅ Prediction: %s", prediction)
        except Exception as e:
            logger.error("❌ Prediction failed: %s", str(e))
            return jsonify({
                "error": "Model prediction failed",
                "detail": str(e),
                "step": "prediction",
                "model_type": str(type(model)),
                "features_shape": str(np.array(features).shape),
                "features": str(features)
            }), 500

        # Step 5: Confidence
        confidence = None
        try:
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(features)[0]
                confidence = round(float(np.max(proba)) * 100, 2)
                logger.info("📈 Confidence: %s%%", confidence)
        except Exception as e:
            logger.warning("⚠ Could not compute confidence: %s", str(e))

        return jsonify({
            "recommended_crop": str(prediction),
            "confidence": confidence,
        })

    except Exception as e:
        logger.error("❌ Unexpected error in predict_crop: %s", str(e))
        return jsonify({
            "error": "Unexpected server error",
            "detail": str(e),
            "step": "unknown"
        }), 500


# ──────────────────────────────────────────────────────────────
# DISEASE PREDICTION (ResNet18 – 8 classes)
# ──────────────────────────────────────────────────────────────


@app.route("/predict_disease", methods=["POST"])
def predict_disease():
    return jsonify({
        "error": "Disease model temporarily disabled for cloud deployment"
    }), 503

# @app.route("/predict_disease", methods=["POST"])
# def predict_disease():
#     """
#     Predict plant disease from an uploaded image.
#     Expects multipart/form-data with field "file" containing the image.
#     """
#     if disease_model is None:
#         return jsonify({"error": "Disease model not loaded"}), 503

#     if "file" not in request.files:
#         return jsonify({"error": "No file uploaded. Send image as 'file' field."}), 400

#     file = request.files["file"]
#     if file.filename == "":
#         return jsonify({"error": "Empty filename"}), 400

#     try:
#         image = Image.open(io.BytesIO(file.read())).convert("RGB")
#     except Exception:
#         return jsonify({"error": "Invalid image file"}), 400

#     input_tensor = disease_transform(image).unsqueeze(0)

#     with torch.no_grad():
#         output = disease_model(input_tensor)
#         probabilities = torch.nn.functional.softmax(output, dim=1)[0]
#         confidence, disease_idx = torch.max(probabilities, 0)

#     idx = disease_idx.item()
#     disease_name = DISEASE_CLASSES[idx] if idx < len(DISEASE_CLASSES) else f"Class {idx}"

#     return jsonify({
#         "predicted_disease": disease_name,
#         "confidence": round(confidence.item() * 100, 2),
#     })


# ══════════════════════════════════════════════════════════════
# RUN – Render injects PORT env variable automatically
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info("Starting Flask server on port %d", port)
    app.run(host="0.0.0.0", port=port, debug=False)