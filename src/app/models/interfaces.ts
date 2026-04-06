// ============================================================
// Data Models for Agri-IoT Decision Support System
// ============================================================

export interface CropRecommendation {
  id: string;
  cropName: string;
  confidence: number; // percentage 0-100
  season: string;
  waterRequirement: string;
  expectedYield: string;
  soilType: string;
  remarks: string;
  recommendedDate: string;
}

export interface DiseaseIdentification {
  id: string;
  diseaseName: string;
  cropAffected: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  symptoms: string[];
  remedy: string;
  imageUrl?: string;
  detectedDate: string;
}

export interface SoilData {
  id: string;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon: number;
  temperature: number;
  timestamp: string;
  location: string;
}

export interface WeatherData {
  id: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  forecast: string;
  timestamp: string;
  location: string;
}

export interface WaterData {
  id: string;
  soilMoisture: number;
  irrigationStatus: string;
  waterLevel: number;
  waterQuality: number;
  pumpStatus: 'ON' | 'OFF';
  lastIrrigated: string;
  timestamp: string;
  location: string;
}

export interface FertilizerData {
  id: string;
  fertilizerName: string;
  recommendedQuantity: number;
  unit: string;
  applicationMethod: string;
  frequency: string;
  cropName: string;
  timestamp: string;
}

export interface PestData {
  id: string;
  pestName: string;
  cropAffected: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  detectionMethod: string;
  remedy: string;
  pesticideRecommended: string;
  detectedDate: string;
  imageUrl?: string;
}

export interface YieldData {
  id: string;
  cropName: string;
  expectedYield: number;
  actualYield?: number;
  unit: string;
  season: string;
  year: number;
  location: string;
  timestamp: string;
}

export interface HistoryRecord {
  id: string;
  type: 'crop' | 'disease' | 'soil' | 'weather' | 'water' | 'fertilizer' | 'pest' | 'yield';
  title: string;
  description: string;
  timestamp: string;
  data: any;
}

export interface DashboardSummary {
  totalSensors: number;
  activeSensors: number;
  lastCropRecommendation: CropRecommendation | null;
  lastDiseaseAlert: DiseaseIdentification | null;
  currentSoil: SoilData | null;
  currentWeather: WeatherData | null;
  currentWater: WaterData | null;
  recentAlerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// ============================================================
// ML Backend API – Request / Response Models
// ============================================================

/**
 * Payload sent to POST /predict_crop
 * ALL fields are OPTIONAL — send only what sensors you have.
 * Missing fields default to 0 on the backend.
 * Feature order in model: [N, P, K, pH, temp, hum, moist]
 */
export interface CropPredictionRequest {
  N?: number;      // Nitrogen
  P?: number;      // Phosphorus
  K?: number;      // Potassium
  pH?: number;     // Soil pH
  temp?: number;   // Temperature (°C)
  hum?: number;    // Humidity (%)
  moist?: number;  // Soil Moisture (%)
}

/** Response from POST /predict_crop */
export interface CropPredictionResponse {
  recommended_crop: string;
  confidence?: number;
  message?: string;
  warning?: string;              // set when some sensors were missing
  sensors_used?: string[];       // which sensors had actual data
  imputed?: { [key: string]: number }; // missing sensors filled with training means
}

/** Response from POST /predict_disease */
export interface DiseasePredictionResponse {
  predicted_disease: string;
  confidence?: number;
  message?: string;
}
