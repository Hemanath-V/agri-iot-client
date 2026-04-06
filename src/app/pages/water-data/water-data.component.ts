import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { WaterData } from '../../models/interfaces';

@Component({
  selector: 'app-water-data',
  templateUrl: './water-data.component.html',
  styleUrls: ['./water-data.component.scss']
})
export class WaterDataComponent implements OnInit {

  loading: boolean = false;
  waterRecords: WaterData[] = [];

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getWaterData().subscribe({
      next: (data) => {
        this.waterRecords = data;
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
