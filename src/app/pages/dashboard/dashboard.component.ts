import { Component, OnInit } from '@angular/core';
import { DashboardSummary } from '../../models/interfaces';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  summary: DashboardSummary | null = null;
  loading = false;

  constructor(
    private apiService: ApiService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.loading = true;
    this.apiService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.summary = null;
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.fetchDashboard();
  }
}
