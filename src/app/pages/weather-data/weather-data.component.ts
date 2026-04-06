import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { WeatherData } from '../../models/interfaces';

@Component({
  selector: 'app-weather-data',
  templateUrl: './weather-data.component.html',
  styleUrls: ['./weather-data.component.scss']
})
export class WeatherDataComponent implements OnInit {

  loading: boolean = false;
  weatherRecords: WeatherData[] = [];

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getWeatherData().subscribe({
      next: (data) => {
        this.weatherRecords = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadData();
  }
}
