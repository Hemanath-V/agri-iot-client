import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { DiseaseIdentification, DiseasePredictionResponse } from '../../models/interfaces';

@Component({
  selector: 'app-disease-identification',
  templateUrl: './disease-identification.component.html',
  styleUrls: ['./disease-identification.component.scss']
})
export class DiseaseIdentificationComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  diseases: DiseaseIdentification[] = [];
  selectedFile: File | null = null;
  uploadResult: DiseaseIdentification | null = null;

  // ── ML Prediction ──────────────────────────────────────────
  predicting: boolean = false;
  mlFile: File | null = null;
  mlImagePreview: string | null = null;
  mlResult: DiseasePredictionResponse | null = null;
  mlError: string | null = null;

  // ── Polling-based auto-detection ───────────────────────────
  autoDetectEnabled: boolean = false;
  autoDetectIntervalMs: number = 10 * 60 * 1000; // 10 minutes
  autoDetectCountdown: number = 0;
  lastAutoDetectTime: string | null = null;
  private pollingSub: Subscription | null = null;
  private countdownSub: Subscription | null = null;

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.stopAutoDetect();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getDiseaseIdentifications().subscribe({
      next: (data) => {
        this.diseases = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ── Legacy upload (existing DB-backed endpoint) ────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    this.loading = true;
    this.apiService.uploadDiseaseImage(formData).subscribe({
      next: (result) => {
        this.uploadResult = result;
        this.loading = false;
        this.loadData();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ── ML Disease Prediction (manual upload) ──────────────────
  onMlFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.mlFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.mlImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.mlFile);
      this.mlResult = null;
      this.mlError = null;
    }
  }

  predictDisease(): void {
    if (!this.mlFile) return;
    this.predicting = true;
    this.mlResult = null;
    this.mlError = null;

    const formData = new FormData();
    formData.append('file', this.mlFile);

    this.apiService.predictDisease(formData).subscribe({
      next: (result) => {
        this.mlResult = result;
        this.predicting = false;
        this.lastAutoDetectTime = new Date().toLocaleTimeString();
      },
      error: (err) => {
        this.mlError = err.message || 'Disease prediction failed. Please try again.';
        this.predicting = false;
      }
    });
  }

  // ── Polling-based auto-detection ───────────────────────────

  toggleAutoDetect(): void {
    if (this.autoDetectEnabled) {
      this.stopAutoDetect();
    } else {
      this.startAutoDetect();
    }
  }

  startAutoDetect(): void {
    if (!this.mlFile) {
      this.mlError = 'Please select an image first before enabling auto-detection.';
      return;
    }
    this.autoDetectEnabled = true;
    this.autoDetectCountdown = this.autoDetectIntervalMs / 1000;

    // Countdown timer (updates every second)
    this.countdownSub = interval(1000).subscribe(() => {
      if (this.autoDetectCountdown > 0) {
        this.autoDetectCountdown--;
      }
    });

    // Actual polling interval
    this.pollingSub = interval(this.autoDetectIntervalMs).subscribe(() => {
      this.autoDetectCountdown = this.autoDetectIntervalMs / 1000;
      this.predictDisease(); // re-analyze the current image
    });
  }

  stopAutoDetect(): void {
    this.autoDetectEnabled = false;
    this.autoDetectCountdown = 0;
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = null;
    }
  }

  formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' + s : s}s`;
  }

  refresh(): void {
    this.loadData();
  }
}
