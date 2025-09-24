import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
// import { UserService } from '../services/user.service';  // ✅ import service

const USER_ID = 52; // ⚡ replace with logged-in user ID from auth/session

@Component({
  selector: 'app-email-edit',
  templateUrl: './email-edit.page.html',
  styleUrls: ['./email-edit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class EmailEditPage implements OnInit {
  emailForm: FormGroup;
  isEditing = false;
  originalEmail = '';

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private service: ApiService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    });
  }

  ngOnInit() {
    this.loadEmail();
  }

  get emailControl(): FormControl {
    return this.emailForm.get('email') as FormControl;
  }

  /** ✅ Load email from service */
  loadEmail() {
    this.service.getUserEmail(USER_ID).subscribe({
      next: (res) => {
        this.originalEmail = res.email;
        this.emailForm.patchValue({ email: res.email });
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Failed to load email',
          color: 'danger',
          duration: 2000,
        });
        toast.present();
      },
    });
  }

  /** Switch to edit mode */
  editEmail() {
    this.isEditing = true;
  }

  /** ✅ Save email via service */
  saveEmail() {
    if (this.emailForm.invalid) return;
    const newEmail = this.emailForm.value.email;

    this.service.updateUserEmail(USER_ID, newEmail).subscribe({
      next: async (res) => {
        this.originalEmail = res.email;
        this.isEditing = false;

        const toast = await this.toastCtrl.create({
          message: 'Email updated successfully',
          color: 'success',
          duration: 2000,
        });
        toast.present();
      },
      error: async (err) => {
        let msg = 'Failed to update email';
        if (err.status === 409) msg = 'Email already in use';
        if (err.status === 404) msg = 'User not found';

        const toast = await this.toastCtrl.create({
          message: msg,
          color: 'danger',
          duration: 2000,
        });
        toast.present();
      },
    });
  }

  /** Cancel edit and reset */
  cancelEdit() {
    this.isEditing = false;
    this.emailForm.reset({ email: this.originalEmail });
  }
}
