import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { VersionCheck } from 'src/app/services/version-check';
// import { VersionCheck } from '../services/version-check.service'; // <- adjust path

const STORAGE_KEY = 'settings.appUpdates';
const CURRENT_VERSION_KEY = 'app_current_version';
const LATEST_VERSION_KEY = 'app_latest_version';
const UPDATE_AVAILABLE_KEY = 'app_update_available';

@Component({
  selector: 'app-app-updates',
  templateUrl: './app-updates.page.html',
  styleUrls: ['./app-updates.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AppUpdatesPage implements OnInit {
  version = '2.24.17.76'; // fallback
  latestVersion: string | null = null;
  updateAvailable = false;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private versionCheck: VersionCheck
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  private loadSettings() {
    const storedCurrent = localStorage.getItem(CURRENT_VERSION_KEY);
    const storedLatest = localStorage.getItem(LATEST_VERSION_KEY);
    const storedUpdateAvail = localStorage.getItem(UPDATE_AVAILABLE_KEY);

    this.version = storedCurrent || this.version; // fallback stays if null
    this.latestVersion = storedLatest || null;
    this.updateAvailable = storedUpdateAvail === 'true';
  }

  ionViewWillEnter() {
    // refresh from localStorage when page re-enters
    this.loadSettings();
  }

  ionViewWillLeave() {
    this.saveSettings();
  }

  private saveSettings() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: this.version,
        latestVersion: this.latestVersion,
        updateAvailable: this.updateAvailable,
      })
    );
  }

  async checkForUpdates() {
    const loading = await this.loadingCtrl.create({ message: 'Checking…' });
    await loading.present();

    try {
      const result = await this.versionCheck.checkAndNotify();

      // Update UI
      this.version = result.currentVersion || this.version;
      this.latestVersion = result.latestVersion;
      this.updateAvailable = result.updateAvailable;

      const toast = await this.toastCtrl.create({
        message: result.updateAvailable
          ? `Update available: ${result.latestVersion}`
          : 'You are using the latest version.',
        duration: 1600,
        position: 'bottom',
      });
      await toast.present();
    } catch (e) {
      const toast = await this.toastCtrl.create({
        message: 'Could not check updates. Please try again later.',
        duration: 1600,
        position: 'bottom',
      });
      await toast.present();
    } finally {
      loading.dismiss();
    }
  }
}
