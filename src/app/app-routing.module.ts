import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CropRecommendationComponent } from './pages/crop-recommendation/crop-recommendation.component';
import { DiseaseIdentificationComponent } from './pages/disease-identification/disease-identification.component';
import { SoilDataComponent } from './pages/soil-data/soil-data.component';
import { WeatherDataComponent } from './pages/weather-data/weather-data.component';
import { WaterDataComponent } from './pages/water-data/water-data.component';
import { FertilizerDataComponent } from './pages/fertilizer-data/fertilizer-data.component';
import { PestDataComponent } from './pages/pest-data/pest-data.component';
import { YieldDataComponent } from './pages/yield-data/yield-data.component';
import { HistoryComponent } from './pages/history/history.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'crop-recommendation', component: CropRecommendationComponent },
  { path: 'disease-identification', component: DiseaseIdentificationComponent },
  { path: 'soil-data', component: SoilDataComponent },
  { path: 'weather-data', component: WeatherDataComponent },
  { path: 'water-data', component: WaterDataComponent },
  { path: 'fertilizer-data', component: FertilizerDataComponent },
  { path: 'pest-data', component: PestDataComponent },
  { path: 'yield-data', component: YieldDataComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
