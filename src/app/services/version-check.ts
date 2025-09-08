// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class VersionCheck {
  
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { App } from '@capacitor/app';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class VersionCheck {
  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {}

  package_name:string="";

  async checkVersion() {
    const appInfo = await App.getInfo();
    const currentVersion = appInfo.version;
    const packageName = appInfo.id;

    console.log('📱 Installed Version:', currentVersion);
//  debug   📱 Installed Version: 6.0

    console.log('📦 Package Name:', packageName);
    this.package_name = packageName;

    

    let latestVersion: string | null = null;

    if (this.platform.is('android')) {
      // ⚠️ Needs backend proxy or API scraper because Play Store has no free JSON API
      latestVersion = await this.getLatestFromPlayStore(packageName);
      console.log("latestVersion",latestVersion);
      //Debug latestVersion 8 (8.0)
    } else if (this.platform.is('ios')) {
      latestVersion = await this.getLatestFromAppStore(packageName);
    }

    if (latestVersion && this.isUpdateAvailable(currentVersion, latestVersion)) {
      this.showUpdateAlert();
    }
  }

  private async getLatestFromAppStore(bundleId: string): Promise<string | null> {
    try {
      const url = `https://itunes.apple.com/lookup?bundleId=${bundleId}`;
      const data: any = await this.http.get(url).toPromise();
      if (data?.resultCount > 0) {
        return data.results[0].version;
      }

      
      return null;
    } catch (err) {
      console.error('App Store fetch failed:', err);
      return null;
    }
  }

  private async getLatestFromPlayStore(packageName: string): Promise<string | null> {
    try {
      // ✅ You should call your own backend API that uses google-play-scraper
      // Example: GET https://your-api.com/check-version?package=com.your.app
      const url = `https://apps.ekarigar.com/backend/check-version?package=${packageName}`;
      const data: any = await this.http.get(url).toPromise();

          // 🧹 Clean up version string (e.g. "8 (8.0)" → "8.0")
    const match = data.latestVersion.match(/\d+(\.\d+)*/);
    return match ? match[0] : data.latestVersion;
      // return data.latestVersion;
    } catch (err) {
      console.error('Play Store fetch failed:', err);
      return null;
    }
  }

  private isUpdateAvailable(current: string, latest: string): boolean {
    const currParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < latestParts.length; i++) {
      if ((currParts[i] || 0) < latestParts[i]) {
        return true;
      } else if ((currParts[i] || 0) > latestParts[i]) {
        return false;
      }
    }
    return false;
  }

  private async showUpdateAlert() {
  const packageName = this.package_name;
  const alert = await this.alertCtrl.create({
    header: 'Update Available',
    message: 'A new version of the app is available. Please update.',
    buttons: [
      {
        text: 'Update',
        handler: () => {
          if (this.platform.is('android')) {
            window.open(`https://play.google.com/store/apps/details?id=${packageName}`, '_system');
          } else if (this.platform.is('ios')) {
            window.open(`itms-apps://itunes.apple.com/app/id=${packageName}`, '_system');
          }
        },
      },
      {
        text: 'Later',
        role: 'cancel'
      }
    ],
    backdropDismiss: false,
  });
  await alert.present();
}

}
