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

  // ── Loading state tracking ─────────────────────────────────
  elapsedSeconds: number = 0;
  loadingMessage: string = '';
  private timerInterval: any = null;
  warmingUp: boolean = false;

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
   * First warms up the backend (Render cold start), then predicts.
   */
  predictCrop(): void {
    this.predicting = true;
    this.predictionResult = null;
    this.predictionError = null;
    this.startTimer();

    // Step 1: Warmup the backend first (handles Render cold start)
    this.warmingUp = true;
    this.loadingMessage = 'Waking up ML server...';

    this.apiService.warmupMlBackend().subscribe({
      next: () => {
        this.warmingUp = false;
        this.loadingMessage = 'ML server ready. Running prediction...';
        this.runPrediction();
      },
      error: () => {
        // Even if warmup fails, try prediction anyway
        this.warmingUp = false;
        this.loadingMessage = 'Attempting prediction...';
        this.runPrediction();
      }
    });
  }

  private runPrediction(): void {
    // Build a payload with ONLY the sensors that have real values
    const payload: CropPredictionRequest = {};
    const allKeys: (keyof CropPredictionRequest)[] = ['N', 'P', 'K', 'pH', 'temp', 'hum', 'moist'];
    for (const key of allKeys) {
      const val = this.sensorInput[key];
      if (val !== undefined && val !== null && val !== 0) {
        payload[key] = val;
      }
    }

    this.loadingMessage = 'Waiting for ML model prediction...';

    this.apiService.predictCrop(payload).subscribe({
      next: (result) => {
        this.predictionResult = result;
        this.predicting = false;
        this.stopTimer();
        this.loadingMessage = '';
      },
      error: (err) => {
        this.predictionError = err.message || 'Prediction failed. Please try again.';
        this.predicting = false;
        this.stopTimer();
        this.loadingMessage = '';
      }
    });
  }

  private startTimer(): void {
    this.elapsedSeconds = 0;
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      // Update message based on elapsed time
      if (this.warmingUp) {
        if (this.elapsedSeconds > 30) {
          this.loadingMessage = 'Still waking up server... Render free tier can take up to 60s.';
        } else if (this.elapsedSeconds > 10) {
          this.loadingMessage = 'Server is starting up (cold start)... Please wait.';
        }
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  refresh(): void {
    this.loadData();
    this.fetchLiveSensorData();
  }
}
