import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, catchError, retry, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';
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
  DashboardSummary,
  CropPredictionRequest,
  CropPredictionResponse,
  DiseasePredictionResponse
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiBaseUrl;
  private mlBaseUrl = environment.mlApiBaseUrl;
  private useMock = environment.useMock;

  constructor(private http: HttpClient, private mock: MockDataService) {}

  // ============================================================
  // DASHBOARD
  // ============================================================

  /** TODO: API_CALL – GET /dashboard/summary */
  getDashboardSummary(): Observable<DashboardSummary> {
    if (this.useMock) return of(this.mock.getDashboardSummary()).pipe(delay(500));
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  // ============================================================
  // CROP RECOMMENDATION
  // ============================================================

  /** TODO: API_CALL – GET /crop-recommendation */
  getCropRecommendations(): Observable<CropRecommendation[]> {
    if (this.useMock) return of(this.mock.getCropRecommendations()).pipe(delay(500));
    return this.http.get<CropRecommendation[]>(`${this.baseUrl}/crop-recommendation`);
  }

  /** TODO: API_CALL – GET /crop-recommendation/:id */
  getCropRecommendationById(id: string): Observable<CropRecommendation> {
    return this.http.get<CropRecommendation>(`${this.baseUrl}/crop-recommendation/${id}`);
  }

  // ============================================================
  // DISEASE IDENTIFICATION
  // ============================================================

  /** TODO: API_CALL – GET /disease-identification */
  getDiseaseIdentifications(): Observable<DiseaseIdentification[]> {
    if (this.useMock) return of(this.mock.getDiseaseIdentifications()).pipe(delay(500));
    return this.http.get<DiseaseIdentification[]>(`${this.baseUrl}/disease-identification`);
  }

  /** TODO: API_CALL – POST /disease-identification/upload – Upload image for disease detection */
  uploadDiseaseImage(formData: FormData): Observable<DiseaseIdentification> {
    if (this.useMock) return of(this.mock.getDiseaseIdentifications()[0]).pipe(delay(1000));
    return this.http.post<DiseaseIdentification>(`${this.baseUrl}/disease-identification/upload`, formData);
  }

  // ============================================================
  // SOIL DATA
  // ============================================================

  /** TODO: API_CALL – GET /soil-data */
  getSoilData(): Observable<SoilData[]> {
    if (this.useMock) return of(this.mock.getSoilData()).pipe(delay(500));
    return this.http.get<SoilData[]>(`${this.baseUrl}/soil-data`);
  }

  /** TODO: API_CALL – GET /soil-data/latest */
  getLatestSoilData(): Observable<SoilData> {
    return this.http.get<SoilData>(`${this.baseUrl}/soil-data/latest`);
  }

  // ============================================================
  // WEATHER DATA
  // ============================================================

  /** TODO: API_CALL – GET /weather-data */
  getWeatherData(): Observable<WeatherData[]> {
    if (this.useMock) return of(this.mock.getWeatherData()).pipe(delay(500));
    return this.http.get<WeatherData[]>(`${this.baseUrl}/weather-data`);
  }

  /** TODO: API_CALL – GET /weather-data/current */
  getCurrentWeather(): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.baseUrl}/weather-data/current`);
  }

  // ============================================================
  // WATER DATA
  // ============================================================

  /** TODO: API_CALL – GET /water-data */
  getWaterData(): Observable<WaterData[]> {
    if (this.useMock) return of(this.mock.getWaterData()).pipe(delay(500));
    return this.http.get<WaterData[]>(`${this.baseUrl}/water-data`);
  }

  /** TODO: API_CALL – GET /water-data/latest */
  getLatestWaterData(): Observable<WaterData> {
    return this.http.get<WaterData>(`${this.baseUrl}/water-data/latest`);
  }

  // ============================================================
  // FERTILIZER DATA
  // ============================================================

  /** TODO: API_CALL – GET /fertilizer-data */
  getFertilizerData(): Observable<FertilizerData[]> {
    if (this.useMock) return of(this.mock.getFertilizerData()).pipe(delay(500));
    return this.http.get<FertilizerData[]>(`${this.baseUrl}/fertilizer-data`);
  }

  // ============================================================
  // PEST DATA
  // ============================================================

  /** TODO: API_CALL – GET /pest-data */
  getPestData(): Observable<PestData[]> {
    if (this.useMock) return of(this.mock.getPestData()).pipe(delay(500));
    return this.http.get<PestData[]>(`${this.baseUrl}/pest-data`);
  }

  // ============================================================
  // YIELD DATA
  // ============================================================

  /** TODO: API_CALL – GET /yield-data */
  getYieldData(): Observable<YieldData[]> {
    if (this.useMock) return of(this.mock.getYieldData()).pipe(delay(500));
    return this.http.get<YieldData[]>(`${this.baseUrl}/yield-data`);
  }

  // ============================================================
  // HISTORY
  // ============================================================

  /** TODO: API_CALL – GET /history?type=:type */
  getHistory(type?: string): Observable<HistoryRecord[]> {
    if (this.useMock) return of(this.mock.getHistory(type)).pipe(delay(500));
    const url = type
      ? `${this.baseUrl}/history?type=${type}`
      : `${this.baseUrl}/history`;
    return this.http.get<HistoryRecord[]>(url);
  }

  // ============================================================
  // ML BACKEND – Health Check & Sensor Data
  // ============================================================

  /** Ping the ML backend to check if it's awake */
  checkMlHealth(): Observable<any> {
    if (this.useMock) {
      return of({ status: 'ok', crop_model_loaded: true, disease_model_loaded: true }).pipe(delay(300));
    }
    return this.http.get<any>(`${this.mlBaseUrl}/`).pipe(
      catchError(() => of({ status: 'unreachable' }))
    );
  }

  /**
   * Warmup the ML backend — calls /warmup to load the model.
   * Handles Render cold start (can take 30-60s on free tier).
   */
  warmupMlBackend(): Observable<any> {
    if (this.useMock) {
      return of({ status: 'ready', crop_model_loaded: true }).pipe(delay(1000));
    }
    return this.http.get<any>(`${this.mlBaseUrl}/warmup`).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => timer(retryCount * 5000) // 5s, 10s backoff
      }),
      catchError(() => of({ status: 'warmup_failed' }))
    );
  }

  /** Fetch the latest sensor reading stored on the ML backend (from ESP32) */
  getLatestSensorDataFromML(): Observable<CropPredictionRequest | null> {
    if (this.useMock) {
      return of({
        N: 280, P: 22, K: 195, pH: 6.5, temp: 28, hum: 78, moist: 68
      }).pipe(delay(400));
    }
    return this.http.get<CropPredictionRequest>(`${this.mlBaseUrl}/api/sensor-data/latest`).pipe(
      catchError(() => of(null))
    );
  }

  // ============================================================
  // ML BACKEND – Crop Prediction (POST /predict_crop)
  // ============================================================

  /**
   * Send sensor data to the Flask ML backend for crop recommendation.
   * Retries once with exponential backoff (handles Render cold-start).
   */
  predictCrop(sensorData: CropPredictionRequest): Observable<CropPredictionResponse> {
    if (this.useMock) {
      const allKeys = ['N', 'P', 'K', 'pH', 'temp', 'hum', 'moist'];
      const provided = Object.keys(sensorData).filter(k => (sensorData as any)[k] !== undefined);
      const missing = allKeys.filter(k => !provided.includes(k));
      const trainingMeans: any = { N: 50.55, P: 53.36, K: 48.15, pH: 6.47, temp: 25.62, hum: 71.48, moist: 64.0 };
      const imputed: any = {};
      missing.forEach(k => imputed[k] = trainingMeans[k]);
      return of({
        recommended_crop: 'Rice',
        confidence: 92,
        message: 'Mock prediction – connect real ML backend to get live results',
        sensors_used: provided,
        warning: missing.length ? `Missing sensors (${missing.join(', ')}) filled with training averages. Based on ${provided.length}/7 real sensors.` : undefined,
        imputed: missing.length ? imputed : undefined,
      }).pipe(delay(1000));
    }
    return this.http
      .post<CropPredictionResponse>(`${this.mlBaseUrl}/predict_crop`, sensorData)
      .pipe(
        retry({
          count: 1,
          delay: (error, retryCount) => timer(retryCount * 3000) // 3s backoff for cold start
        }),
        catchError(this.handleMlError)
      );
  }

  // ============================================================
  // ML BACKEND – Disease Prediction (POST /predict_disease)
  // ============================================================

  /**
   * Upload a plant image to the Flask ML backend for disease classification.
   * The FormData must contain a field named "file" (or "image") matching
   * whatever the Flask endpoint expects.
   */
  predictDisease(formData: FormData): Observable<DiseasePredictionResponse> {
    if (this.useMock) {
      return of({
        predicted_disease: 'Bacterial Leaf Blight',
        confidence: 87,
        message: 'Mock prediction – connect real ML backend to get live results'
      }).pipe(delay(1500));
    }
    return this.http
      .post<DiseasePredictionResponse>(`${this.mlBaseUrl}/predict_disease`, formData)
      .pipe(
        retry({
          count: 1,
          delay: (error, retryCount) => timer(retryCount * 3000)
        }),
        catchError(this.handleMlError)
      );
  }

  // ============================================================
  // ML Error Handler
  // ============================================================

  private handleMlError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred while contacting the ML server.';
    if (error.status === 0) {
      message = 'Cannot reach the ML server. It may be starting up (cold start) – please try again in 30–60 seconds.';
    } else if (error.status === 413) {
      message = 'The uploaded file is too large. Please use a smaller image.';
    } else if (error.status === 422 || error.status === 400) {
      message = error.error?.message || 'Invalid input data. Please check your sensor values.';
    } else if (error.status >= 500) {
      message = 'The ML server encountered an internal error. Please try again later.';
    }
    return throwError(() => ({ status: error.status, message }));
  }
}
