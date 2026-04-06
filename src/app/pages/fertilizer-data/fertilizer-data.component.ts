import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { FertilizerData } from '../../models/interfaces';

@Component({
  selector: 'app-fertilizer-data',
  templateUrl: './fertilizer-data.component.html',
  styleUrls: ['./fertilizer-data.component.scss']
})
export class FertilizerDataComponent implements OnInit {

  loading: boolean = false;
  fertilizerRecords: FertilizerData[] = [];

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getFertilizerData().subscribe({
      next: (data) => {
        this.fertilizerRecords = data;
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
