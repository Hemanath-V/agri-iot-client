import { Injectable } from '@angular/core';
import {
  CropRecommendation,
  DiseaseIdentification,
  SoilData,
  WeatherData,
  WaterData,
  FertilizerData,
  PestData,
  YieldData,
  HistoryRecord,
  DashboardSummary
} from '../models/interfaces';

/**
 * Mock data for local development.
 * When useMock is true in environment, the ApiService returns this data
 * instead of making real HTTP calls.
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  getDashboardSummary(): DashboardSummary {
    return {
      totalSensors: 12,
      activeSensors: 10,
      lastCropRecommendation: {
        id: 'cr-001',
        cropName: 'Rice (Paddy)',
        confidence: 92,
        season: 'Kharif',
        waterRequirement: 'High',
        expectedYield: '4.5 tonnes/hectare',
        soilType: 'Clay Loam',
        remarks: 'Ideal conditions detected for paddy cultivation',
        recommendedDate: '2026-03-06T10:30:00Z'
      },
      lastDiseaseAlert: {
        id: 'di-001',
        diseaseName: 'Bacterial Leaf Blight',
        cropAffected: 'Rice',
        confidence: 87,
        severity: 'Medium',
        symptoms: ['Yellow lesions on leaves', 'Wilting of leaf tips'],
        remedy: 'Apply copper-based bactericide. Ensure proper drainage.',
        detectedDate: '2026-03-05T14:20:00Z'
      },
      currentSoil: {
        id: 'sd-001',
        moisture: 68,
        ph: 6.5,
        nitrogen: 280,
        phosphorus: 22,
        potassium: 195,
        organicCarbon: 0.72,
        temperature: 28,
        timestamp: '2026-03-07T08:00:00Z',
        location: 'Field A – Block 1'
      },
      currentWeather: {
        id: 'wd-001',
        temperature: 32,
        humidity: 78,
        rainfall: 2.5,
        windSpeed: 12,
        windDirection: 'SW',
        uvIndex: 7,
        forecast: 'Partly cloudy with chance of light showers',
        timestamp: '2026-03-07T08:00:00Z',
        location: 'Farm Station'
      },
      currentWater: {
        id: 'wt-001',
        soilMoisture: 68,
        irrigationStatus: 'Scheduled',
        waterLevel: 75,
        waterQuality: 88,
        pumpStatus: 'OFF',
        lastIrrigated: '2026-03-06T06:00:00Z',
        timestamp: '2026-03-07T08:00:00Z',
        location: 'Field A'
      },
      recentAlerts: [
        {
          id: 'a-001',
          type: 'warning',
          title: 'Low Soil Moisture in Field B',
          message: 'Soil moisture dropped below 40%. Consider irrigation.',
          timestamp: '2026-03-07T07:30:00Z',
          isRead: false
        },
        {
          id: 'a-002',
          type: 'danger',
          title: 'Disease Detected – Bacterial Leaf Blight',
          message: 'ML model detected signs of leaf blight in Field A with 87% confidence.',
          timestamp: '2026-03-05T14:20:00Z',
          isRead: false
        },
        {
          id: 'a-003',
          type: 'success',
          title: 'Irrigation Completed',
          message: 'Scheduled irrigation for Field A completed successfully.',
          timestamp: '2026-03-06T06:45:00Z',
          isRead: true
        },
        {
          id: 'a-004',
          type: 'info',
          title: 'New Crop Recommendation Available',
          message: 'Based on current soil and weather data, Rice is recommended for Kharif season.',
          timestamp: '2026-03-06T10:30:00Z',
          isRead: true
        }
      ]
    };
  }

  getCropRecommendations(): CropRecommendation[] {
    return [
      {
        id: 'cr-001',
        cropName: 'Rice (Paddy)',
        confidence: 92,
        season: 'Kharif',
        waterRequirement: 'High',
        expectedYield: '4.5 tonnes/hectare',
        soilType: 'Clay Loam',
        remarks: 'Ideal conditions – high moisture, suitable pH',
        recommendedDate: '2026-03-06T10:30:00Z'
      },
      {
        id: 'cr-002',
        cropName: 'Groundnut',
        confidence: 78,
        season: 'Kharif',
        waterRequirement: 'Medium',
        expectedYield: '2.0 tonnes/hectare',
        soilType: 'Sandy Loam',
        remarks: 'Good option for well-drained areas',
        recommendedDate: '2026-03-06T10:30:00Z'
      },
      {
        id: 'cr-003',
        cropName: 'Sugarcane',
        confidence: 85,
        season: 'Annual',
        waterRequirement: 'Very High',
        expectedYield: '70 tonnes/hectare',
        soilType: 'Loamy',
        remarks: 'Suitable if water supply is consistent',
        recommendedDate: '2026-03-05T09:00:00Z'
      },
      {
        id: 'cr-004',
        cropName: 'Black Gram',
        confidence: 65,
        season: 'Rabi',
        waterRequirement: 'Low',
        expectedYield: '1.2 tonnes/hectare',
        soilType: 'Red Soil',
        remarks: 'Nitrogen-fixing crop. Shorter growing period.',
        recommendedDate: '2026-03-04T11:00:00Z'
      },
      {
        id: 'cr-005',
        cropName: 'Maize',
        confidence: 71,
        season: 'Kharif',
        waterRequirement: 'Medium',
        expectedYield: '6.0 tonnes/hectare',
        soilType: 'Alluvial',
        remarks: 'High yield potential in current NPK levels',
        recommendedDate: '2026-03-04T11:00:00Z'
      }
    ];
  }

  getDiseaseIdentifications(): DiseaseIdentification[] {
    return [
      {
        id: 'di-001',
        diseaseName: 'Bacterial Leaf Blight',
        cropAffected: 'Rice',
        confidence: 87,
        severity: 'Medium',
        symptoms: ['Yellow lesions on leaf margins', 'Wilting of tips', 'Grayish-white leaf surfaces'],
        remedy: 'Apply copper-based bactericide. Improve field drainage. Remove infected plants.',
        detectedDate: '2026-03-05T14:20:00Z'
      },
      {
        id: 'di-002',
        diseaseName: 'Late Blight',
        cropAffected: 'Tomato',
        confidence: 93,
        severity: 'High',
        symptoms: ['Dark brown spots on leaves', 'White mold under leaves', 'Fruit rot'],
        remedy: 'Apply Mancozeb fungicide. Remove affected leaves immediately. Improve air circulation.',
        detectedDate: '2026-03-04T09:15:00Z'
      },
      {
        id: 'di-003',
        diseaseName: 'Powdery Mildew',
        cropAffected: 'Groundnut',
        confidence: 76,
        severity: 'Low',
        symptoms: ['White powdery coating on leaves', 'Curling leaves'],
        remedy: 'Apply sulfur-based fungicide. Ensure adequate spacing between plants.',
        detectedDate: '2026-03-03T16:00:00Z'
      },
      {
        id: 'di-004',
        diseaseName: 'Brown Spot',
        cropAffected: 'Rice',
        confidence: 81,
        severity: 'Medium',
        symptoms: ['Oval brown spots on leaves', 'Spots with gray center', 'Reduced grain quality'],
        remedy: 'Apply Tricyclazole. Maintain balanced fertilization, especially potassium.',
        detectedDate: '2026-03-02T12:00:00Z'
      }
    ];
  }

  getSoilData(): SoilData[] {
    return [
      {
        id: 'sd-001', moisture: 68, ph: 6.5, nitrogen: 280, phosphorus: 22,
        potassium: 195, organicCarbon: 0.72, temperature: 28,
        timestamp: '2026-03-07T08:00:00Z', location: 'Field A – Block 1'
      },
      {
        id: 'sd-002', moisture: 42, ph: 7.1, nitrogen: 210, phosphorus: 18,
        potassium: 165, organicCarbon: 0.58, temperature: 30,
        timestamp: '2026-03-07T08:00:00Z', location: 'Field B – Block 2'
      },
      {
        id: 'sd-003', moisture: 55, ph: 6.8, nitrogen: 245, phosphorus: 20,
        potassium: 180, organicCarbon: 0.65, temperature: 29,
        timestamp: '2026-03-06T08:00:00Z', location: 'Field A – Block 1'
      },
      {
        id: 'sd-004', moisture: 38, ph: 7.3, nitrogen: 190, phosphorus: 15,
        potassium: 150, organicCarbon: 0.50, temperature: 31,
        timestamp: '2026-03-06T08:00:00Z', location: 'Field C'
      }
    ];
  }

  getWeatherData(): WeatherData[] {
    return [
      {
        id: 'wd-001', temperature: 32, humidity: 78, rainfall: 2.5,
        windSpeed: 12, windDirection: 'SW', uvIndex: 7,
        forecast: 'Partly cloudy with chance of light showers',
        timestamp: '2026-03-07T08:00:00Z', location: 'Farm Station'
      },
      {
        id: 'wd-002', temperature: 30, humidity: 82, rainfall: 8.2,
        windSpeed: 15, windDirection: 'W', uvIndex: 5,
        forecast: 'Moderate rain expected in the afternoon',
        timestamp: '2026-03-06T08:00:00Z', location: 'Farm Station'
      },
      {
        id: 'wd-003', temperature: 34, humidity: 65, rainfall: 0,
        windSpeed: 8, windDirection: 'NE', uvIndex: 9,
        forecast: 'Clear sky, hot and dry conditions',
        timestamp: '2026-03-05T08:00:00Z', location: 'Farm Station'
      }
    ];
  }

  getWaterData(): WaterData[] {
    return [
      {
        id: 'wt-001', soilMoisture: 68, irrigationStatus: 'Scheduled',
        waterLevel: 75, waterQuality: 88, pumpStatus: 'OFF',
        lastIrrigated: '2026-03-06T06:00:00Z',
        timestamp: '2026-03-07T08:00:00Z', location: 'Field A'
      },
      {
        id: 'wt-002', soilMoisture: 42, irrigationStatus: 'Urgent',
        waterLevel: 60, waterQuality: 82, pumpStatus: 'ON',
        lastIrrigated: '2026-03-05T06:00:00Z',
        timestamp: '2026-03-07T08:00:00Z', location: 'Field B'
      },
      {
        id: 'wt-003', soilMoisture: 55, irrigationStatus: 'Normal',
        waterLevel: 80, waterQuality: 91, pumpStatus: 'OFF',
        lastIrrigated: '2026-03-06T17:00:00Z',
        timestamp: '2026-03-07T08:00:00Z', location: 'Field C'
      }
    ];
  }

  getFertilizerData(): FertilizerData[] {
    return [
      {
        id: 'fd-001', fertilizerName: 'Urea (N-46)',
        recommendedQuantity: 120, unit: 'kg/hectare',
        applicationMethod: 'Broadcasting', frequency: 'Two splits – at transplanting and 30 DAT',
        cropName: 'Rice', timestamp: '2026-03-06T10:00:00Z'
      },
      {
        id: 'fd-002', fertilizerName: 'DAP (N-18, P-46)',
        recommendedQuantity: 60, unit: 'kg/hectare',
        applicationMethod: 'Basal application', frequency: 'Once at sowing',
        cropName: 'Rice', timestamp: '2026-03-06T10:00:00Z'
      },
      {
        id: 'fd-003', fertilizerName: 'MOP (K-60)',
        recommendedQuantity: 40, unit: 'kg/hectare',
        applicationMethod: 'Basal application', frequency: 'Once at sowing',
        cropName: 'Rice', timestamp: '2026-03-06T10:00:00Z'
      },
      {
        id: 'fd-004', fertilizerName: 'Zinc Sulphate',
        recommendedQuantity: 25, unit: 'kg/hectare',
        applicationMethod: 'Soil application', frequency: 'Once before transplanting',
        cropName: 'Rice', timestamp: '2026-03-06T10:00:00Z'
      },
      {
        id: 'fd-005', fertilizerName: 'Gypsum',
        recommendedQuantity: 200, unit: 'kg/hectare',
        applicationMethod: 'Soil application at pegging', frequency: 'Once',
        cropName: 'Groundnut', timestamp: '2026-03-05T09:00:00Z'
      }
    ];
  }

  getPestData(): PestData[] {
    return [
      {
        id: 'pd-001', pestName: 'Brown Plant Hopper',
        cropAffected: 'Rice', severity: 'High',
        detectionMethod: 'Sensor anomaly (sudden moisture drop) + visual confirmation',
        remedy: 'Drain water from field. Apply neem-based pesticide.',
        pesticideRecommended: 'Imidacloprid 17.8% SL',
        detectedDate: '2026-03-06T11:00:00Z'
      },
      {
        id: 'pd-002', pestName: 'Stem Borer',
        cropAffected: 'Rice', severity: 'Medium',
        detectionMethod: 'Dead heart symptom observed via image analysis',
        remedy: 'Apply Cartap Hydrochloride granules in standing water.',
        pesticideRecommended: 'Cartap Hydrochloride 4G',
        detectedDate: '2026-03-05T09:30:00Z'
      },
      {
        id: 'pd-003', pestName: 'Aphids',
        cropAffected: 'Groundnut', severity: 'Low',
        detectionMethod: 'Visual inspection during field survey',
        remedy: 'Spray Dimethoate. Encourage natural predators (ladybugs).',
        pesticideRecommended: 'Dimethoate 30% EC',
        detectedDate: '2026-03-04T14:00:00Z'
      }
    ];
  }

  getYieldData(): YieldData[] {
    return [
      {
        id: 'yd-001', cropName: 'Rice', expectedYield: 4.5, actualYield: undefined,
        unit: 'tonnes/hectare', season: 'Kharif', year: 2026,
        location: 'Field A', timestamp: '2026-03-07T00:00:00Z'
      },
      {
        id: 'yd-002', cropName: 'Rice', expectedYield: 4.2, actualYield: 4.0,
        unit: 'tonnes/hectare', season: 'Kharif', year: 2025,
        location: 'Field A', timestamp: '2025-10-15T00:00:00Z'
      },
      {
        id: 'yd-003', cropName: 'Groundnut', expectedYield: 2.0, actualYield: 1.8,
        unit: 'tonnes/hectare', season: 'Kharif', year: 2025,
        location: 'Field B', timestamp: '2025-10-20T00:00:00Z'
      },
      {
        id: 'yd-004', cropName: 'Black Gram', expectedYield: 1.2, actualYield: 1.1,
        unit: 'tonnes/hectare', season: 'Rabi', year: 2025,
        location: 'Field C', timestamp: '2025-03-10T00:00:00Z'
      },
      {
        id: 'yd-005', cropName: 'Sugarcane', expectedYield: 70, actualYield: 65,
        unit: 'tonnes/hectare', season: 'Annual', year: 2025,
        location: 'Field D', timestamp: '2025-12-01T00:00:00Z'
      }
    ];
  }

  getHistory(type?: string): HistoryRecord[] {
    const records: HistoryRecord[] = [
      {
        id: 'h-001', type: 'crop', title: 'Crop Recommendation: Rice',
        description: 'ML model recommended Rice for Kharif season with 92% confidence.',
        timestamp: '2026-03-06T10:30:00Z', data: null
      },
      {
        id: 'h-002', type: 'disease', title: 'Disease: Bacterial Leaf Blight',
        description: 'Detected on Rice in Field A. Severity: Medium (87% confidence).',
        timestamp: '2026-03-05T14:20:00Z', data: null
      },
      {
        id: 'h-003', type: 'soil', title: 'Soil Reading – Field A',
        description: 'Moisture: 68%, pH: 6.5, N: 280, P: 22, K: 195',
        timestamp: '2026-03-07T08:00:00Z', data: null
      },
      {
        id: 'h-004', type: 'weather', title: 'Weather Update',
        description: '32°C, 78% humidity, 2.5mm rainfall. Partly cloudy.',
        timestamp: '2026-03-07T08:00:00Z', data: null
      },
      {
        id: 'h-005', type: 'water', title: 'Irrigation – Field B (Urgent)',
        description: 'Soil moisture at 42%. Pump activated for emergency irrigation.',
        timestamp: '2026-03-07T08:00:00Z', data: null
      },
      {
        id: 'h-006', type: 'fertilizer', title: 'Fertilizer: Urea applied',
        description: '120 kg/hectare Urea broadcasting for Rice in Field A.',
        timestamp: '2026-03-06T10:00:00Z', data: null
      },
      {
        id: 'h-007', type: 'pest', title: 'Pest: Brown Plant Hopper',
        description: 'High severity pest detected in Rice field. Imidacloprid recommended.',
        timestamp: '2026-03-06T11:00:00Z', data: null
      },
      {
        id: 'h-008', type: 'yield', title: 'Yield Record: Rice 2025',
        description: 'Expected: 4.2 t/ha, Actual: 4.0 t/ha. Kharif 2025.',
        timestamp: '2025-10-15T00:00:00Z', data: null
      },
      {
        id: 'h-009', type: 'disease', title: 'Disease: Late Blight on Tomato',
        description: 'Detected with 93% confidence. High severity. Mancozeb recommended.',
        timestamp: '2026-03-04T09:15:00Z', data: null
      },
      {
        id: 'h-010', type: 'crop', title: 'Crop Recommendation: Groundnut',
        description: 'ML model recommended Groundnut with 78% confidence for sandy loam soil.',
        timestamp: '2026-03-06T10:30:00Z', data: null
      }
    ];

    if (type) {
      return records.filter(r => r.type === type);
    }
    return records;
  }
}
