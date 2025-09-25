import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

const LANG_STORAGE_KEY = 'app_language';

@Component({
  selector: 'app-app-language',
  templateUrl: './app-language.page.html',
  styleUrls: ['./app-language.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule],
})
export class AppLanguagePage implements OnInit {

 selectedLanguage = 'en-US';
  searchTerm = '';

  // Alphabetically sorted list of languages (label ascending)
  languages = [
    { code: 'ar-EG', label: 'Arabic (Egypt)' },
    { code: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
    { code: 'bn-BD', label: 'Bengali (Bangladesh)' },
    { code: 'de-DE', label: 'German (Germany)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'en-IN', label: 'English (India)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'es-ES', label: 'Spanish (Spain)' },
    { code: 'es-MX', label: 'Spanish (Mexico)' },
    { code: 'fa-IR', label: 'Persian (Iran)' },
    { code: 'fr-FR', label: 'French (France)' },
    { code: 'gu-IN', label: 'Gujarati (India)' },
    { code: 'hi-IN', label: 'Hindi (India)' },
    { code: 'it-IT', label: 'Italian (Italy)' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'ko-KR', label: 'Korean' },
    { code: 'mr-IN', label: 'Marathi (India)' },
    { code: 'pa-IN', label: 'Punjabi (India)' },
    { code: 'pt-BR', label: 'Portuguese (Brazil)' },
    { code: 'pt-PT', label: 'Portuguese (Portugal)' },
    { code: 'ru-RU', label: 'Russian' },
    { code: 'ta-IN', label: 'Tamil (India)' },
    { code: 'te-IN', label: 'Telugu (India)' },
    { code: 'th-TH', label: 'Thai' },
    { code: 'tr-TR', label: 'Turkish' },
    { code: 'ur-PK', label: 'Urdu (Pakistan)' },
    { code: 'vi-VN', label: 'Vietnamese' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'zh-TW', label: 'Chinese (Traditional)' },
  ];

  // filteredLanguages is shown in the radio list; initially same as languages
  filteredLanguages = [...this.languages];

  constructor(private toastCtrl: ToastController) {}

  ngOnInit() {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved) {
      this.selectedLanguage = saved;
    }
    // ensure languages array is sorted (defensive)
    this.languages.sort((a, b) => a.label.localeCompare(b.label));
    this.filteredLanguages = [...this.languages];
  }

  // Called when user picks language using search-filtered radio list
  async changeLanguage(event: any) {
    const lang = event?.detail?.value ?? this.selectedLanguage;
    this.setLanguage(lang);
  }

  // Called when user picks language from select dropdown
  onSelectChange(event: any) {
    const lang = event?.detail?.value ?? this.selectedLanguage;
    this.setLanguage(lang);
  }

  // central setter
  async setLanguage(langCode: string) {
    if (!langCode) { return; }
    localStorage.setItem(LANG_STORAGE_KEY, langCode);
    this.selectedLanguage = langCode;

    const t = await this.toastCtrl.create({
      message: `Language set to ${this.getLabel(langCode)} (${langCode})`,
      duration: 1200,
      position: 'bottom'
    });
    await t.present();

    this.applyRtlIfNeeded(langCode);
  }

  getLabel(code: string) {
    return this.languages.find(l => l.code === code)?.label || code;
  }

  applyRtlIfNeeded(code: string) {
    const rtlLangs = ['ar', 'ur', 'fa', 'he'];
    if (rtlLangs.some(rtl => code.startsWith(rtl))) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }

  // filter function called on ionInput of searchbar
  filterLanguages() {
    const q = (this.searchTerm || '').trim().toLowerCase();
    if (!q) {
      this.filteredLanguages = [...this.languages];
      return;
    }

    this.filteredLanguages = this.languages.filter(l => {
      const label = l.label.toLowerCase();
      const code = l.code.toLowerCase();
      return label.includes(q) || code.includes(q);
    });
  }
}
