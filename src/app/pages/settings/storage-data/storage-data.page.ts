import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

const STORAGE_KEY = 'settings.storageData';

@Component({
  selector: 'app-storage-data',
  templateUrl: './storage-data.page.html',
  styleUrls: ['./storage-data.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class StorageDataPage implements OnInit {


  // storage numbers (mocked as example). Replace with real values from native FS if available.
  usedMB = 612;        // MB used by app data
  totalMB = 1024;      // Total quota shown
  dataSent = '1.2 GB';
  dataReceived = '3.4 GB';

  constructor(
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSavedStats();
  }

  get storageFraction(): number {
    return Math.min(1, this.usedMB / (this.totalMB || 1));
  }

  get totalUsedHuman(): string {
    return `${this.usedMB} MB of ${this.totalMB} MB`;
  }

  get dataSentHuman(): string {
    return this.dataSent;
  }

  get dataReceivedHuman(): string {
    return this.dataReceived;
  }

  /* ---------- Actions ---------- */
  async clearCache() {
    // Replace this stub with actual cache clearing (filesystem, caches, indexedDB, etc.)
    // Here we simulate clearing 100 MB
    const freed = 100;
    this.usedMB = Math.max(0, this.usedMB - freed);
    this.saveStats();

    const t = await this.toastCtrl.create({ message: `Cleared ${freed} MB cache`, duration: 1400, position: 'bottom' });
    await t.present();
  }

  analyzeStorage() {
    // Navigate to a detailed manage-storage page (implement details there)
    this.router.navigateByUrl('storage-data/manage-storage');
  }

  openManageStorage() {
    this.router.navigateByUrl('storage-data/manage-storage');
  }

  openMediaAutoDownload() {
    this.router.navigateByUrl('storage-data/media-auto-download');
  }

  resetNetworkStats() {
    // reset stats (demo)
    this.dataSent = '0 B';
    this.dataReceived = '0 B';
    this.saveStats();
    this.toast('Network statistics reset');
  }

  /* ---------- Persistence ---------- */
  private saveStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        usedMB: this.usedMB,
        totalMB: this.totalMB,
        dataSent: this.dataSent,
        dataReceived: this.dataReceived
      }));
    } catch (e) {
      console.warn('Could not save storage stats', e);
    }
  }

  private loadSavedStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.usedMB === 'number') this.usedMB = s.usedMB;
      if (typeof s.totalMB === 'number') this.totalMB = s.totalMB;
      if (typeof s.dataSent === 'string') this.dataSent = s.dataSent;
      if (typeof s.dataReceived === 'string') this.dataReceived = s.dataReceived;
    } catch (e) {
      console.warn('Could not load storage stats', e);
    }
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1400, position: 'bottom' });
    await t.present();
  }

}
