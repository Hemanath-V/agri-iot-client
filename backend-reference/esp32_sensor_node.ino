/*
 * ESP32 Sensor Data Sender – Agri-IoT System
 * ============================================
 * Reads sensor values and sends them to the Flask backend
 * via HTTP POST every 30 seconds.
 *
 * Wiring (adjust pins as needed):
 *   - DHT22 (Temp + Humidity)  → GPIO 4
 *   - Soil Moisture (Analog)   → GPIO 34
 *   - pH Sensor (Analog)       → GPIO 35
 *   - Rain Sensor (Analog)     → GPIO 32
 *
 * Dependencies (install via Arduino Library Manager):
 *   - WiFi.h         (built-in)
 *   - HTTPClient.h   (built-in)
 *   - ArduinoJson.h  (by Benoît Blanchon)
 *   - DHT.h          (by Adafruit)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ═══════════════════════════════════════════════════════════
// CONFIGURATION – UPDATE THESE VALUES
// ═══════════════════════════════════════════════════════════

// Wi-Fi credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend URL (your Render deployment)
// For local testing: "http://192.168.x.x:5000/api/sensor-data"
// For production:    "https://your-app.onrender.com/api/sensor-data"
const char* BACKEND_URL = "https://your-app.onrender.com/api/sensor-data";

// Send interval (milliseconds)
const unsigned long SEND_INTERVAL = 30000; // 30 seconds

// ═══════════════════════════════════════════════════════════
// SENSOR PINS
// ═══════════════════════════════════════════════════════════

#define DHT_PIN    4
#define DHT_TYPE   DHT22
#define SOIL_PIN   34   // Analog
#define PH_PIN     35   // Analog

DHT dht(DHT_PIN, DHT_TYPE);

// ═══════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== Agri-IoT ESP32 Sensor Node ===");

  // Initialize sensors
  dht.begin();
  pinMode(SOIL_PIN, INPUT);
  pinMode(PH_PIN, INPUT);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("   IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed! Will retry in loop.");
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════

unsigned long lastSendTime = 0;

void loop() {
  unsigned long now = millis();

  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    // Reconnect Wi-Fi if disconnected
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("⚠ WiFi disconnected. Reconnecting...");
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      delay(5000);
      if (WiFi.status() != WL_CONNECTED) {
        Serial.println("❌ Still not connected. Skipping this cycle.");
        return;
      }
    }

    // Read sensors
    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();
    float soilRaw     = analogRead(SOIL_PIN);
    float phRaw       = analogRead(PH_PIN);

    // Validate DHT readings
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("⚠ DHT read failed. Using default values.");
      temperature = 25.0;
      humidity = 60.0;
    }

    // Convert analog readings to meaningful values
    // ── Soil Moisture: 0-4095 → 0-100% (inverted: wet = low reading)
    float soilMoisture = map(soilRaw, 4095, 0, 0, 100);
    soilMoisture = constrain(soilMoisture, 0, 100);

    // ── pH: 0-4095 → 0-14 (calibrate with your specific sensor)
    float ph = (phRaw / 4095.0) * 14.0;

    Serial.println("📊 Sensor Readings:");
    Serial.printf("   Temperature: %.1f°C\n", temperature);
    Serial.printf("   Humidity:    %.1f%%\n", humidity);
    Serial.printf("   Soil Moist.: %.1f%%\n", soilMoisture);
    Serial.printf("   pH:          %.2f\n", ph);

    // Build JSON payload
    // Only send sensors you actually have connected.
    // Backend accepts ANY subset — missing fields default to 0.
    StaticJsonDocument<256> doc;

    // ── These sensors are usually available (DHT22 + Soil + pH) ──
    doc["temp"]  = temperature;
    doc["hum"]   = humidity;
    doc["moist"] = soilMoisture;
    doc["pH"]    = ph;

    // ── Uncomment ONLY the sensors you physically have connected: ──
    // doc["N"] = nitrogenValue;    // ← Nitrogen sensor
    // doc["P"] = phosphorusValue;  // ← Phosphorus sensor
    // doc["K"] = potassiumValue;   // ← Potassium sensor

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // Send to backend
    sendToBackend(jsonPayload);
  }
}

// ═══════════════════════════════════════════════════════════
// HTTP POST
// ═══════════════════════════════════════════════════════════

void sendToBackend(String jsonPayload) {
  HTTPClient http;

  Serial.println("📡 Sending data to backend...");
  Serial.println("   URL: " + String(BACKEND_URL));
  Serial.println("   Payload: " + jsonPayload);

  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000); // 15 second timeout

  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Response [%d]: ", httpCode);
    Serial.println(response);
  } else {
    Serial.printf("❌ HTTP Error: %s\n", http.errorToString(httpCode).c_str());
    Serial.println("   The server might be in cold-start. Will retry next cycle.");
  }

  http.end();
}
