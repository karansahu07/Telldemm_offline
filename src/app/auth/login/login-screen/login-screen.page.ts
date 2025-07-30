import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login-screen.page.html',
  styleUrls: ['./login-screen.page.scss'],
})
export class LoginScreenPage {
  phoneNumber = '';
  countryCode = '+91';
  showOtpPopup = false;
  showConfirmPopup = false;
  otp: string[] = Array(6).fill('');
  timer: number = 60;
  timerInterval: any;
  email: string = '';

  countries = [
    { name: 'India', code: '+91' }, { name: 'USA', code: '+1' },
    { name: 'UK', code: '+44' }, { name: 'Australia', code: '+61' },
    { name: 'Canada', code: '+1' }, { name: 'Germany', code: '+49' },
    { name: 'France', code: '+33' }, { name: 'Brazil', code: '+55' },
    { name: 'South Africa', code: '+27' }, { name: 'Russia', code: '+7' },
    { name: 'China', code: '+86' }, { name: 'Japan', code: '+81' },
    { name: 'Singapore', code: '+65' }, { name: 'UAE', code: '+971' },
    { name: 'New Zealand', code: '+64' }, { name: 'Mexico', code: '+52' },
    { name: 'Italy', code: '+39' }, { name: 'Spain', code: '+34' },
    { name: 'Netherlands', code: '+31' }, { name: 'Sweden', code: '+46' }
  ];

  @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;
  isLoading: boolean = false;
  isSendingOtp: boolean = false;
  isVerifyingOtp: boolean = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    // private secureStorage: SecureStorageService
  ) { }

  async showToast(message: string, color: 'danger' | 'success' | 'dark' = 'dark') {
    const toast = await this.toastController.create({ message, duration: 2000, color });
    toast.present();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  isPhoneValid(): boolean {
    return /^\d{10}$/.test(this.phoneNumber.trim());
  }

  isEmailValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email.trim());
  }

  isOtpComplete(): boolean {
    return this.otp.every(d => d.trim().length === 1);
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${('0' + minutes).slice(-2)} : ${('0' + seconds).slice(-2)}`;
  }

  startTimer() {
    this.timer = 60;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else clearInterval(this.timerInterval);
    }, 1000);
  }

  resendOtp() {
    if (this.timer === 0) {
      this.sendOtp();
    }
  }

  onCountryChange(event: any) {
    const selected = this.countries.find(c => c.name === event.target.value);
    if (selected) this.countryCode = selected.code;
  }

  onAgreeClick() {
    this.phoneNumber = this.phoneNumber.trim();
    if (!this.isPhoneValid()) {
      this.showToast('Please enter a valid 10-digit mobile number.', 'danger');
      return;
    }
    this.showConfirmPopup = true;
  }

  onEdit() {
    this.showConfirmPopup = false;
  }

  async onConfirm() {
    this.showConfirmPopup = false;
    this.isSendingOtp = true;
    await this.sendOtp();
    this.isSendingOtp = false;
  }

  async sendOtp() {
    const fullPhone = `${this.phoneNumber}`;
    // console.log("sfdhdjkszf", this.phoneNumber);
    const payload = {
      phone_number: fullPhone,
      email: this.email,
    };

    try {
      console.log('📨 Sending OTP payload:', payload);
      const res = await this.authService.sendOtp(payload);
      console.log('📬 OTP API Response:', res);

      if (res.status) {
        this.showToast('OTP sent successfully.', 'success');
        this.showOtpPopup = true;
        this.startTimer();
      } else {
        this.showToast(res.message || 'Failed to send OTP.', 'danger');
      }
    } catch (err) {
      console.error('❌ OTP API Error:', err);
      this.showToast('Failed to send OTP. Try again.', 'danger');
    }
  }

  onOtpInput(event: any, index: number) {
    const input = event.target.value;
    if (!/^\d$/.test(input)) {
      this.otp[index] = '';
      event.target.value = '';
      return;
    }

    this.otp[index] = input;
    if (input && index < this.otp.length - 1) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  handleBackspace(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (!this.otp[index] && index > 0) {
        this.otpInputs.get(index - 1)?.nativeElement.focus();
      }
      this.otp[index] = '';
    }
  }

  async goToHome() {
    if (!this.isOtpComplete()) {
      this.showToast('Please enter the complete 6-digit OTP.');
      return;
    }

    this.isVerifyingOtp = true;
    // const fullPhone = `${this.countryCode}${this.phoneNumber}`;
    const fullPhone = `${this.phoneNumber}`;
    const otpCode = this.otp.join('');

    const result = await this.authService.verifyOtp(fullPhone, otpCode);
    this.isVerifyingOtp = false;

    if (result.success) {
      this.showToast('Login successful!', 'success');
      this.router.navigateByUrl('/profile-setup');
    } else {
      this.showToast(result.message || 'Invalid OTP', 'danger');
    }
  }


}
