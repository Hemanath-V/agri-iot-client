import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { SoilData } from '../../models/interfaces';

@Component({
  selector: 'app-soil-data',
  templateUrl: './soil-data.component.html',
  styleUrls: ['./soil-data.component.scss']
})
export class SoilDataComponent implements OnInit {

  loading: boolean = false;
  soilRecords: SoilData[] = [];

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getSoilData().subscribe({
      next: (data) => {
        this.soilRecords = data;
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
