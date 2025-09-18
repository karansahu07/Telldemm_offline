import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

const STORAGE_KEY = 'settings.chats';

interface ChatsSettings {
  enterToSend: boolean;
  mediaVisibility: boolean;
  keepArchived: boolean;
  fontSize: 'small' | 'medium' | 'large';
  voiceTranscriptsEnabled: boolean;
}

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule],
})
export class ChatsPage implements OnInit {




 
  // UI-bound properties
  enterToSend = false;
  mediaVisibility = true;
  keepArchived = true;
  fontSize: 'small' | 'medium' | 'large' = 'medium';
  voiceTranscriptsEnabled = false;

  // small preview for wallpaper or font-size preview
  preview = 'assets/wallpaper-preview.jpg';
  lastBackup: string | null = null;

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadLastBackup();
  }

  /* ---------- Navigation / Open pages ---------- */
  openTheme() {
    // navigate to theme page (adjust route if different)
    this.router.navigate(['settings', 'chats', 'theme']);
  }

  openChatTheme() {
    this.router.navigate(['settings', 'chats', 'wallpaper']);
  }

  openFontSize() {
    this.router.navigate(['settings', 'chats', 'font-size']);
  }

  openChatBackup() {
    this.router.navigate(['settings', 'chats', 'backup']);
  }

  openTransferChats() {
    this.router.navigate(['settings', 'chats', 'transfer']);
  }

  openChatHistory() {
    this.router.navigate(['settings', 'chats', 'history']);
  }

  /* ---------- Toggle & action handlers ---------- */
  async toggleEnterToSend() {
    this.enterToSend = !this.enterToSend;
    this.saveSettings();
    await this.showToast(`Enter-to-send ${this.enterToSend ? 'enabled' : 'disabled'}`);
  }

  async toggleMediaVisibility() {
    this.mediaVisibility = !this.mediaVisibility;
    this.saveSettings();
    await this.showToast(`Media visibility ${this.mediaVisibility ? 'on' : 'off'}`);
  }

  async toggleKeepArchived() {
    this.keepArchived = !this.keepArchived;
    this.saveSettings();
    await this.showToast(`Keep archived ${this.keepArchived ? 'enabled' : 'disabled'}`);
  }

  async toggleVoiceMessageTranscripts() {
    // for a page-like control we open the page; if you want a toggle, flip boolean instead
    this.voiceTranscriptsEnabled = !this.voiceTranscriptsEnabled;
    this.saveSettings();
    await this.showToast(`Voice message transcripts ${this.voiceTranscriptsEnabled ? 'enabled' : 'disabled'}`);
  }

  /* ---------- Persistence ---------- */
  loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s: Partial<ChatsSettings> = JSON.parse(raw);
      if (typeof s.enterToSend === 'boolean') this.enterToSend = s.enterToSend;
      if (typeof s.mediaVisibility === 'boolean') this.mediaVisibility = s.mediaVisibility;
      if (typeof s.keepArchived === 'boolean') this.keepArchived = s.keepArchived;
      if (s.fontSize === 'small' || s.fontSize === 'medium' || s.fontSize === 'large') this.fontSize = s.fontSize;
      if (typeof s.voiceTranscriptsEnabled === 'boolean') this.voiceTranscriptsEnabled = s.voiceTranscriptsEnabled;
    } catch (e) {
      console.warn('Could not load chat settings', e);
    }
  }

  saveSettings() {
    const s: ChatsSettings = {
      enterToSend: this.enterToSend,
      mediaVisibility: this.mediaVisibility,
      keepArchived: this.keepArchived,
      fontSize: this.fontSize,
      voiceTranscriptsEnabled: this.voiceTranscriptsEnabled
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn('Could not save chat settings', e);
    }
  }

  /* ---------- Helpers ---------- */
  async showToast(message: string, duration = 1400) {
    const t = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom'
    });
    await t.present();
  }

  loadLastBackup() {
    // placeholder — replace with real backup metadata retrieval
    this.lastBackup = localStorage.getItem('chats.lastBackup') || null;
  }

  // Example method that simulates making a backup
  async startBackup() {
    // show a quick toast then set lastBackup
    await this.showToast('Starting backup…', 800);
    const now = new Date().toISOString();
    localStorage.setItem('chats.lastBackup', now);
    this.lastBackup = now;
    await this.showToast('Backup completed');
  }

}
