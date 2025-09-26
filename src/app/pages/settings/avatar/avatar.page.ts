import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionSheetController, IonicModule, ModalController } from '@ionic/angular';
import { Avatar } from 'src/app/services/avatar';


@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.page.html',
  styleUrls: ['./avatar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule],
})
export class AvatarPage implements OnInit {

options: any = {};
  avatarUrl!: string;

  // example user id — replace with your real user id when saving
  userId = 'current_user';

  isDownloading = false;

  constructor(public avatarService: Avatar) {}

  ngOnInit() {
    this.options = {
      topType: this.avatarService.topTypes[1],
      accessoriesType: this.avatarService.accessoriesTypes[0],
      hairColor: this.avatarService.hairColors[0],
      eyeType: this.avatarService.eyeTypes[0],
      mouthType: this.avatarService.mouthTypes[0],
      clotheType: this.avatarService.clotheTypes[0],
      skinColor: this.avatarService.skinColors[0]
    };

    // load saved options if present
    const saved = localStorage.getItem(`avatar_opts:${this.userId}`);
    if (saved) {
      try { this.options = JSON.parse(saved); } catch (_) {}
    }

    this.refresh();
  }

  refresh() {
    // preview size small enough for UI; download will request a larger size
    this.avatarUrl = this.avatarService.generateAvatarUrl(this.options, { size: 250 } as any);
  }



async downloadPng() {
  const url = this.avatarService.generateUrl(this.options, 512) + '&format=png';
  this.downloadFromUrl(url, 'avatar.png');
}


downloadFromUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// inside your AvatarPage component (TypeScript)
async downloadFromServerless() {
  try {
    const serverlessEndpoint = 'https://avatarserverlesstwo.vercel.app/api/avatar'; // <- replace

    // Use the same options object you use to generate preview
    const params = new URLSearchParams({
      avatarStyle: 'Circle',
      topType: this.options.topType || '',
      accessoriesType: this.options.accessoriesType || '',
      hairColor: this.options.hairColor || '',
      eyeType: this.options.eyeType || '',
      mouthType: this.options.mouthType || '',
      clotheType: this.options.clotheType || '',
      skinColor: this.options.skinColor || '',
      width: '1024', // requested PNG size
      height: '1024'
    });

    const url = `${serverlessEndpoint}?${params.toString()}`;

    // Fetch the PNG blob from your serverless function
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Download failed: ${resp.status}`);
    }
    const blob = await resp.blob();

    // Use anchor download to save file
    const a = document.createElement('a');
    const objUrl = URL.createObjectURL(blob);
    a.href = objUrl;
    a.download = `avatar-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
  } catch (err) {
    console.error('Download failed', err);
    alert('Download failed. Please try again.');
  }
}


// async downloadAvatar() {
//   const params = new URLSearchParams({
//     avatarStyle: 'Circle',
//     topType: this.options.topType || 'ShortHairShortFlat',
//     accessoriesType: this.options.accessoriesType || 'Blank',
//     hairColor: this.options.hairColor || 'BrownDark',
//     eyeType: this.options.eyeType || 'Default',
//     mouthType: this.options.mouthType || 'Smile',
//     clotheType: this.options.clotheType || 'ShirtCrewNeck',
//     skinColor: this.options.skinColor || 'Light',
//     width: '1024',
//     height: '1024'
//   });

//   const url = `https://avatarserverlesstwo.vercel.app/api/avatar?${params.toString()}`;

//   // ✅ Open the URL in a new browser tab/window → should trigger download
//   window.open(url, '_blank');
// }

async downloadAvatar() {
  this.isDownloading = true;

  const params = new URLSearchParams({
    avatarStyle: 'Circle',
    topType: this.options.topType || 'ShortHairShortFlat',
    accessoriesType: this.options.accessoriesType || 'Blank',
    hairColor: this.options.hairColor || 'BrownDark',
    eyeType: this.options.eyeType || 'Default',
    mouthType: this.options.mouthType || 'Smile',
    clotheType: this.options.clotheType || 'ShirtCrewNeck',
    skinColor: this.options.skinColor || 'Light',
    width: '1024',
    height: '1024'
  });

  const url = `https://avatarserverlesstwo.vercel.app/api/avatar?${params.toString()}`;

  // open in new tab
  window.open(url, '_blank');

  // reset loading state after 3s (enough time to start download)
  setTimeout(() => {
    this.isDownloading = false;
  }, 3000);
}
 
  saveOptions() {
    localStorage.setItem(`avatar_opts:${this.userId}`, JSON.stringify(this.options));
    // If you have an API, you could upload the PNG or options there.
    alert('Avatar choices saved locally.');
  }
}
