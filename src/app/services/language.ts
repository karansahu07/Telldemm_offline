// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class Language {
  
// }


// src/app/services/language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';

// Optional (uncomment if you use Capacitor Preferences)
// import { Preferences } from '@capacitor/preferences';

const LANG_STORAGE_KEY = 'app_language';

@Injectable({
  providedIn: 'root'
})
export class Language {
  // default language (change as needed)
  defaultLang = 'en-GB';

// inside LanguageService
availableLanguages: Array<{ code: string; label: string }> = [
  { code: 'ar-EG', label: 'Arabic (Egypt)' },
  { code: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { code: 'bn-BD', label: 'Bengali (Bangladesh)' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'fr-FR', label: 'French (France)' },
  { code: 'de-DE', label: 'German (Germany)' },
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
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'ta-IN', label: 'Tamil (India)' },
  { code: 'te-IN', label: 'Telugu (India)' },
  { code: 'th-TH', label: 'Thai' },
  { code: 'tr-TR', label: 'Turkish' },
  { code: 'ur-PK', label: 'Urdu (Pakistan)' },
  { code: 'vi-VN', label: 'Vietnamese' }
];

  constructor(
    private translate: TranslateService,
    private platform: Platform
  ) {
    // set default/fallback language
    this.translate.setDefaultLang(this.defaultLang);

    // register available languages so tools like getBrowserLang work
    this.translate.addLangs(this.availableLanguages.map(l => l.code));
  }

  /**
   * Initialize language on app startup.
   * Call languageService.init() from AppComponent when platform.ready().
   */
  init(): void {
    const saved = this.getSavedLanguageSync(); // sync since localStorage is sync
    const toUse = saved || this.defaultLang || this.getBrowserLangFallback();
    this.useLanguage(toUse);
  }

  /**
   * Use a language (sets TranslateService, persists selection, toggles RTL).
   */
  async useLanguage(code: string): Promise<void> {
    if (!code) return;

    // Persist (localStorage synchronous)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, code);
      // If you prefer Capacitor:
      // await Preferences.set({ key: LANG_STORAGE_KEY, value: code });
    } catch (err) {
      console.warn('Could not persist language:', err);
    }

    // Ask ngx-translate to load & use the language file
    // (TranslateHttpLoader should be configured in app.module)
    this.translate.use(code).subscribe({
      next: () => {
        // Successfully loaded
      },
      error: () => {
        // Fallback to default if file missing
        this.translate.use(this.defaultLang);
      }
    });

    // Apply RTL/LTR and CSS class
    this.applyRtlIfNeeded(code);
  }

  /**
   * Get saved language (async, if using Preferences you'd await)
   */
  async getSavedLanguage(): Promise<string | null> {
    try {
      // If you use Preferences, uncomment:
      // const r = await Preferences.get({ key: LANG_STORAGE_KEY });
      // return r.value;
      return Promise.resolve(localStorage.getItem(LANG_STORAGE_KEY));
    } catch {
      return Promise.resolve(null);
    }
  }

  /**
   * Synchronous version (useful in init where you need a sync read)
   */
  getSavedLanguageSync(): string | null {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.getSavedLanguageSync() || this.defaultLang;
  }

  /**
   * Helper to detect browser language fallback
   */
  private getBrowserLangFallback(): string {
    const browser = this.translate.getBrowserLang() || '';
    // map 'en' -> 'en-GB' or choose mapping you prefer
    if (browser === 'en') return this.defaultLang;
    if (browser === 'ar') return 'ar';
    if (browser === 'hi') return 'hi-IN';
    return this.defaultLang;
  }

  /**
   * Toggle RTL and add/remove CSS class on <html>
   */
  private applyRtlIfNeeded(code: string) {
    const rtlPrefixes = ['ar', 'he', 'fa', 'ur'];
    const isRtl = rtlPrefixes.some(p => code.startsWith(p));

    const html = document.documentElement;
    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    if (isRtl) {
      html.classList.add('app-rtl');
    } else {
      html.classList.remove('app-rtl');
    }
  }

  /**
   * Convenience: list of supported language codes
   */
  getAvailableLanguageCodes(): string[] {
    return this.availableLanguages.map(l => l.code);
  }

  /**
   * Convenience: get label for a code
   */
  getLabelForCode(code: string): string {
    return this.availableLanguages.find(l => l.code === code)?.label || code;
  }
}
