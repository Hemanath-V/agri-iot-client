import { Component, Input } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;

  navItems = [
    { route: '/dashboard', icon: '📊', labelKey: 'nav.dashboard' },
    { route: '/crop-recommendation', icon: '🌾', labelKey: 'nav.cropRecommendation' },
    { route: '/disease-identification', icon: '🔬', labelKey: 'nav.diseaseIdentification' },
    { route: '/soil-data', icon: '🏔', labelKey: 'nav.soilData' },
    { route: '/weather-data', icon: '🌤', labelKey: 'nav.weatherData' },
    { route: '/water-data', icon: '💧', labelKey: 'nav.waterData' },
    { route: '/fertilizer-data', icon: '🧪', labelKey: 'nav.fertilizerData' },
    { route: '/pest-data', icon: '🐛', labelKey: 'nav.pestData' },
    { route: '/yield-data', icon: '📈', labelKey: 'nav.yieldData' },
    { route: '/history', icon: '📜', labelKey: 'nav.history' }
  ];

  constructor(public lang: LanguageService) {}
}
