import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  readonly languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' }
  ];

  private currentLangSubject = new BehaviorSubject<string>('en');
  currentLang$ = this.currentLangSubject.asObservable();

  private translations: { [lang: string]: { [key: string]: string } } = {
    en: {
      'nav.dashboard': 'Dashboard',
      'nav.cropRecommendation': 'Crop Recommendation',
      'nav.diseaseIdentification': 'Disease Identification',
      'nav.soilData': 'Soil Data',
      'nav.weatherData': 'Weather Data',
      'nav.waterData': 'Water Data',
      'nav.fertilizerData': 'Fertilizer Data',
      'nav.pestData': 'Pest Data',
      'nav.yieldData': 'Yield Data',
      'nav.history': 'History',
      'dashboard.title': 'IoT Agriculture Dashboard',
      'dashboard.totalSensors': 'Total Sensors',
      'dashboard.activeSensors': 'Active Sensors',
      'dashboard.latestCrop': 'Latest Crop Recommendation',
      'dashboard.latestDisease': 'Latest Disease Alert',
      'dashboard.soilOverview': 'Soil Overview',
      'dashboard.weatherOverview': 'Weather Overview',
      'dashboard.waterOverview': 'Water Overview',
      'dashboard.recentAlerts': 'Recent Alerts',
      'common.loading': 'Loading...',
      'common.noData': 'No data available',
      'common.refresh': 'Refresh',
      'common.date': 'Date',
      'common.location': 'Location',
      'common.severity': 'Severity',
      'common.status': 'Status',
      'common.actions': 'Actions',
      'common.viewDetails': 'View Details',
      'common.filter': 'Filter',
      'crop.name': 'Crop Name',
      'crop.confidence': 'Confidence',
      'crop.season': 'Season',
      'crop.waterReq': 'Water Requirement',
      'crop.expectedYield': 'Expected Yield',
      'crop.soilType': 'Soil Type',
      'disease.name': 'Disease Name',
      'disease.crop': 'Crop Affected',
      'disease.symptoms': 'Symptoms',
      'disease.remedy': 'Remedy',
      'disease.upload': 'Upload Image for Detection',
      'soil.moisture': 'Moisture',
      'soil.ph': 'pH Level',
      'soil.nitrogen': 'Nitrogen (N)',
      'soil.phosphorus': 'Phosphorus (P)',
      'soil.potassium': 'Potassium (K)',
      'soil.organicCarbon': 'Organic Carbon',
      'soil.temperature': 'Soil Temperature',
      'weather.temperature': 'Temperature',
      'weather.humidity': 'Humidity',
      'weather.rainfall': 'Rainfall',
      'weather.windSpeed': 'Wind Speed',
      'weather.uvIndex': 'UV Index',
      'weather.forecast': 'Forecast',
      'water.soilMoisture': 'Soil Moisture',
      'water.irrigationStatus': 'Irrigation Status',
      'water.waterLevel': 'Water Level',
      'water.waterQuality': 'Water Quality',
      'water.pumpStatus': 'Pump Status',
      'fertilizer.name': 'Fertilizer Name',
      'fertilizer.quantity': 'Recommended Quantity',
      'fertilizer.method': 'Application Method',
      'fertilizer.frequency': 'Frequency',
      'pest.name': 'Pest Name',
      'pest.detection': 'Detection Method',
      'pest.pesticide': 'Pesticide Recommended',
      'yield.expected': 'Expected Yield',
      'yield.actual': 'Actual Yield',
      'yield.season': 'Season',
      'yield.year': 'Year',
      'history.type': 'Record Type',
      'history.title': 'Historical Data',
      'history.filterBy': 'Filter by Type'
    },
    ta: {
      'nav.dashboard': 'டாஷ்போர்டு',
      'nav.cropRecommendation': 'பயிர் பரிந்துரை',
      'nav.diseaseIdentification': 'நோய் அடையாளம்',
      'nav.soilData': 'மண் தரவு',
      'nav.weatherData': 'வானிலை தரவு',
      'nav.waterData': 'நீர் தரவு',
      'nav.fertilizerData': 'உர தரவு',
      'nav.pestData': 'பூச்சி தரவு',
      'nav.yieldData': 'விளைச்சல் தரவு',
      'nav.history': 'வரலாறு',
      'dashboard.title': 'IoT வேளாண் டாஷ்போர்டு',
      'dashboard.totalSensors': 'மொத்த சென்சார்கள்',
      'dashboard.activeSensors': 'செயலில் உள்ள சென்சார்கள்',
      'dashboard.latestCrop': 'சமீபத்திய பயிர் பரிந்துரை',
      'dashboard.latestDisease': 'சமீபத்திய நோய் எச்சரிக்கை',
      'dashboard.soilOverview': 'மண் கண்ணோட்டம்',
      'dashboard.weatherOverview': 'வானிலை கண்ணோட்டம்',
      'dashboard.waterOverview': 'நீர் கண்ணோட்டம்',
      'dashboard.recentAlerts': 'சமீபத்திய எச்சரிக்கைகள்',
      'common.loading': 'ஏற்றுகிறது...',
      'common.noData': 'தரவு இல்லை',
      'common.refresh': 'புதுப்பி',
      'common.date': 'தேதி',
      'common.location': 'இடம்',
      'common.severity': 'தீவிரம்',
      'common.status': 'நிலை',
      'common.actions': 'செயல்கள்',
      'common.viewDetails': 'விவரங்களைப் பார்',
      'common.filter': 'வடிகட்டு',
      'crop.name': 'பயிர் பெயர்',
      'crop.confidence': 'நம்பகத்தன்மை',
      'crop.season': 'பருவம்',
      'crop.waterReq': 'நீர் தேவை',
      'crop.expectedYield': 'எதிர்பார்க்கப்படும் விளைச்சல்',
      'crop.soilType': 'மண் வகை',
      'disease.name': 'நோய் பெயர்',
      'disease.crop': 'பாதிக்கப்பட்ட பயிர்',
      'disease.symptoms': 'அறிகுறிகள்',
      'disease.remedy': 'தீர்வு',
      'disease.upload': 'கண்டறிய படத்தை பதிவேற்றவும்',
      'soil.moisture': 'ஈரப்பதம்',
      'soil.ph': 'pH அளவு',
      'soil.nitrogen': 'நைட்ரஜன் (N)',
      'soil.phosphorus': 'பாஸ்பரஸ் (P)',
      'soil.potassium': 'பொட்டாசியம் (K)',
      'soil.organicCarbon': 'கரிமக் கார்பன்',
      'soil.temperature': 'மண் வெப்பநிலை',
      'weather.temperature': 'வெப்பநிலை',
      'weather.humidity': 'ஈரப்பதம்',
      'weather.rainfall': 'மழைப்பொழிவு',
      'weather.windSpeed': 'காற்று வேகம்',
      'weather.uvIndex': 'UV குறியீடு',
      'weather.forecast': 'வானிலை முன்னறிவிப்பு',
      'water.soilMoisture': 'மண் ஈரப்பதம்',
      'water.irrigationStatus': 'நீர்ப்பாசன நிலை',
      'water.waterLevel': 'நீர் மட்டம்',
      'water.waterQuality': 'நீர் தரம்',
      'water.pumpStatus': 'பம்ப் நிலை',
      'fertilizer.name': 'உர பெயர்',
      'fertilizer.quantity': 'பரிந்துரைக்கப்பட்ட அளவு',
      'fertilizer.method': 'பயன்பாட்டு முறை',
      'fertilizer.frequency': 'அதிர்வெண்',
      'pest.name': 'பூச்சி பெயர்',
      'pest.detection': 'கண்டறிதல் முறை',
      'pest.pesticide': 'பரிந்துரைக்கப்பட்ட பூச்சிக்கொல்லி',
      'yield.expected': 'எதிர்பார்க்கப்படும் விளைச்சல்',
      'yield.actual': 'உண்மையான விளைச்சல்',
      'yield.season': 'பருவம்',
      'yield.year': 'ஆண்டு',
      'history.type': 'பதிவு வகை',
      'history.title': 'வரலாற்று தரவு',
      'history.filterBy': 'வகை மூலம் வடிகட்டு'
    },
    hi: {
      'nav.dashboard': 'डैशबोर्ड',
      'nav.cropRecommendation': 'फसल सिफारिश',
      'nav.diseaseIdentification': 'रोग पहचान',
      'nav.soilData': 'मिट्टी डेटा',
      'nav.weatherData': 'मौसम डेटा',
      'nav.waterData': 'पानी डेटा',
      'nav.fertilizerData': 'उर्वरक डेटा',
      'nav.pestData': 'कीट डेटा',
      'nav.yieldData': 'उपज डेटा',
      'nav.history': 'इतिहास',
      'dashboard.title': 'IoT कृषि डैशबोर्ड',
      'common.loading': 'लोड हो रहा है...',
      'common.noData': 'कोई डेटा उपलब्ध नहीं',
      'common.refresh': 'ताज़ा करें'
    },
    te: {
      'nav.dashboard': 'డాష్‌బోర్డ్',
      'nav.cropRecommendation': 'పంట సిఫార్సు',
      'nav.diseaseIdentification': 'వ్యాధి గుర్తింపు',
      'nav.soilData': 'నేల డేటా',
      'nav.weatherData': 'వాతావరణ డేటా',
      'nav.waterData': 'నీటి డేటా',
      'nav.fertilizerData': 'ఎరువుల డేటా',
      'nav.pestData': 'తెగులు డేటా',
      'nav.yieldData': 'దిగుబడి డేటా',
      'nav.history': 'చరిత్ర',
      'dashboard.title': 'IoT వ్యవసాయ డాష్‌బోర్డ్',
      'common.loading': 'లోడ్ అవుతోంది...',
      'common.noData': 'డేటా అందుబాటులో లేదు',
      'common.refresh': 'రిఫ్రెష్'
    }
  };

  constructor() {
    const saved = localStorage.getItem('agri-iot-lang');
    if (saved) {
      this.currentLangSubject.next(saved);
    }
  }

  get currentLang(): string {
    return this.currentLangSubject.value;
  }

  setLanguage(langCode: string): void {
    this.currentLangSubject.next(langCode);
    localStorage.setItem('agri-iot-lang', langCode);
  }

  translate(key: string): string {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    // Fallback to English
    if (this.translations['en'] && this.translations['en'][key]) {
      return this.translations['en'][key];
    }
    return key;
  }

  t(key: string): string {
    return this.translate(key);
  }
}
