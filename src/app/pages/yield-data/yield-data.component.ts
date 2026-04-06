import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { YieldData } from '../../models/interfaces';

@Component({
  selector: 'app-yield-data',
  templateUrl: './yield-data.component.html',
  styleUrls: ['./yield-data.component.scss']
})
export class YieldDataComponent implements OnInit {

  loading: boolean = false;
  yieldRecords: YieldData[] = [];

  constructor(private apiService: ApiService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getYieldData().subscribe({
      next: (data) => {
        this.yieldRecords = data;
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
