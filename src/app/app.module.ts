import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { HeaderComponent } from './components/layout/header/header.component';
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

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    CropRecommendationComponent,
    DiseaseIdentificationComponent,
    SoilDataComponent,
    WeatherDataComponent,
    WaterDataComponent,
    FertilizerDataComponent,
    PestDataComponent,
    YieldDataComponent,
    HistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
