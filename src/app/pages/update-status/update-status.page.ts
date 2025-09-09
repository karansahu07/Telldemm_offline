import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.page.html',
  styleUrls: ['./update-status.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class UpdateStatusPage implements OnInit {

 status: string = '';
  userId: number | null = null;
  isSaving = false;

  // Predefined common statuses (you can change or localize)
  commonStatuses: string[] = [
    'Available',
    'Busy',
    "At school",
    "At the movies",
    "At work",
    "Battery about to die",
    "Can\'t talk, WhatsApp only",
    "In a meeting",
    "At the gym",
    "Sleeping",
    "Urgent calls only"
  ];

  constructor(
    private service: ApiService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get current userId and prefill current status if available
    const id = this.authService.authData?.userId;
    this.userId = id ? Number(id) : null;
    const existing = (this.authService.authData as any)?.status;
    if (existing) {
      this.status = existing;
    }
  }

  fillCommon(s: string) {
    this.status = s;
  }

  async saveStatus() {
    if (!this.status || this.status.trim().length === 0) {
      const t = await this.toastCtrl.create({
        message: 'Please enter or select a status.',
        duration: 1500,
        color: 'danger'
      });
      await t.present();
      return;
    }

    if (!this.userId) {
      const t = await this.toastCtrl.create({
        message: 'User not found.',
        duration: 1500,
        color: 'danger'
      });
      await t.present();
      return;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    const loading = await this.loadingCtrl.create({
      message: 'Updating status...',
      backdropDismiss: false
    });
    await loading.present();

    try {
      // call API (ApiService.updateUserStatus should exist)
      await firstValueFrom(this.service.updateUserStatus(this.userId, this.status));

      // update local authData so other pages reflect change immediately
      if (this.authService.authData) {
        (this.authService.authData as any).status = this.status;
      }

      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: 'Status updated successfully!',
        duration: 1500,
        color: 'success'
      });
      await toast.present();

      // navigate back (or to settings)
      this.router.navigate(['/setting-profile']);
    } catch (err) {
      console.error('Failed to update status', err);
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Failed to update status. Try again.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }
}
