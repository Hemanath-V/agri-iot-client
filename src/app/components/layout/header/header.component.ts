import { Component, EventEmitter, Output } from '@angular/core';
import { LanguageService, Language } from '../../../services/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  languages: Language[];

  constructor(public lang: LanguageService) {
    this.languages = lang.languages;
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.lang.setLanguage(target.value);
  }
}
