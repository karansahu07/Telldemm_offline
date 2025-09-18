import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

const STORAGE_KEY = 'settings.appUpdates';

@Component({
  selector: 'app-app-updates',
  templateUrl: './app-updates.page.html',
  styleUrls: ['./app-updates.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule],
})
export class AppUpdatesPage implements OnInit {

  // constructor() { }

  // ngOnInit() {
  // }

   version = '2.24.17.76'; // ideally pulled from package.json or AppVersion plugin
  autoUpdate = true;

  constructor(private toastCtrl: ToastController) {}

  ngOnInit() {
    this.loadSettings();
  }

  async checkForUpdates() {
    // Stub logic - replace with real update service call
    const toast = await this.toastCtrl.create({
      message: 'You are using the latest version.',
      duration: 1500,
      position: 'bottom'
    });
    await toast.present();
  }

  private loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.autoUpdate = JSON.parse(saved).autoUpdate;
    }
  }

  ionViewWillLeave() {
    this.saveSettings();
  }

  private saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ autoUpdate: this.autoUpdate }));
  }

}
