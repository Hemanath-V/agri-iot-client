import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { CropRecommendation, CropPredictionRequest, CropPredictionResponse } from '../../models/interfaces';

@Component({
  selector: 'app-crop-recommendation',
  templateUrl: './crop-recommendation.component.html',
  styleUrls: ['./crop-recommendation.component.scss']
})
export class CropRecommendationComponent implements OnInit {

  loading: boolean = false;
  recommendations: CropRecommendation[] = [];

  // ── ML Prediction ──────────────────────────────────────────
  predicting: boolean = false;
  predictionResult: CropPredictionResponse | null = null;
  predictionError: string | null = null;
  sensorDataSource: string = 'manual'; // 'manual' | 'live' | 'fallback'
  fetchingSensor: boolean = false;

  sensorInput: CropPredictionRequest = {
    N: 0,
    P: 0,
    K: 0,
    pH: 0,
    temp: 0,
    hum: 0,
    moist: 0
  };

  // Track which sensors have real data vs default zeros
  availableSensors: string[] = [];

  // Helper for template to iterate object keys
  objectKeys = Object.keys;

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
    this.fetchLiveSensorData(); // auto-fill from ESP32 data
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getCropRecommendations().subscribe({
      next: (data) => {
        this.recommendations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Fetch latest sensor data from the ML backend (ESP32 → Backend → Frontend).
   * If unavailable, keep the current (manual/default) values as fallback.
   */
  fetchLiveSensorData(): void {
    this.fetchingSensor = true;
    this.apiService.getLatestSensorDataFromML().subscribe({
      next: (data) => {
        if (data) {
          // Merge live values into the form (only override fields that exist in the response)
          const merged: CropPredictionRequest = { ...this.sensorInput };
          const available: string[] = [];
          for (const key of ['N', 'P', 'K', 'pH', 'temp', 'hum', 'moist'] as const) {
            if (data[key] !== undefined && data[key] !== null) {
              (merged as any)[key] = data[key];
              available.push(key);
            }
          }
          this.sensorInput = merged;
          this.availableSensors = available;
          this.sensorDataSource = available.length > 0 ? 'live' : 'fallback';
        } else {
          this.sensorDataSource = 'fallback';
        }
        this.fetchingSensor = false;
      },
      error: () => {
        this.sensorDataSource = 'fallback';
        this.fetchingSensor = false;
      }
    });
  }

  /**
   * Call the ML backend to get a crop prediction.
   * Only sends fields that have real data (non-zero, non-null).
   * The backend imputes missing fields with training-data means.
   */
  predictCrop(): void {
    this.predicting = true;
    this.predictionResult = null;
    this.predictionError = null;

    // Build a payload with ONLY the sensors that have real values
    const payload: CropPredictionRequest = {};
    const allKeys: (keyof CropPredictionRequest)[] = ['N', 'P', 'K', 'pH', 'temp', 'hum', 'moist'];
    for (const key of allKeys) {
      const val = this.sensorInput[key];
      if (val !== undefined && val !== null && val !== 0) {
        payload[key] = val;
      }
    }

    this.apiService.predictCrop(payload).subscribe({
      next: (result) => {
        this.predictionResult = result;
        this.predicting = false;
      },
      error: (err) => {
        this.predictionError = err.message || 'Prediction failed. Please try again.';
        this.predicting = false;
      }
    });
  }

  refresh(): void {
    this.loadData();
    this.fetchLiveSensorData();
  }
}
