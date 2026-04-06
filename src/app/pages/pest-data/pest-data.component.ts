import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { PestData } from '../../models/interfaces';

@Component({
  selector: 'app-pest-data',
  templateUrl: './pest-data.component.html',
  styleUrls: ['./pest-data.component.scss']
})
export class PestDataComponent implements OnInit {

  loading: boolean = false;
  pestRecords: PestData[] = [];

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getPestData().subscribe({
      next: (data) => {
        this.pestRecords = data;
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
