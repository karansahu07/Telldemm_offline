import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

const STORAGE_KEY = 'settings.appLanguage';

@Component({
  selector: 'app-app-language',
  templateUrl: './app-language.page.html',
  styleUrls: ['./app-language.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule],
})
export class AppLanguagePage implements OnInit {


  selectedLanguage = 'en-IN'; // default

  constructor(private toastCtrl: ToastController) {}

  ngOnInit(): void {
    this.loadLanguage();
  }

  async changeLanguage(event: any) {
    const lang = event.detail.value;
    this.selectedLanguage = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    const toast = await this.toastCtrl.create({
      message: `Language changed to ${this.getLanguageLabel(lang)}`,
      duration: 1500,
      position: 'bottom'
    });
    await toast.present();
  }

  private loadLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.selectedLanguage = saved;
    }
  }

  private getLanguageLabel(code: string): string {
    switch (code) {
      case 'en-IN': return 'English (India)';
      case 'hi': return 'Hindi';
      case 'es': return 'Spanish';
      case 'fr': return 'French';
      default: return code;
    }
  }

}
