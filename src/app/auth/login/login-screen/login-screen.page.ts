// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { IonicModule } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { ViewChildren, QueryList, ElementRef } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-login-screen',
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule]
// })
// export class LoginScreenPage implements OnInit {
//   showOtpPopup = false;
//   phoneNumber: string = '';
//   otpValues: string[] = ['', '', '', '', '', ''];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;

//   constructor(private router: Router) {}

//   ngOnInit() {}

//   get isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber);
//   }

//   goToHome() {
//     this.router.navigateByUrl('/home-screen');
//   }

//   onAgreeClick() {
//     if (this.isPhoneValid) {
//       this.showOtpPopup = true;
//     }
//   }

//   allowOnlyNumbers(event: KeyboardEvent) {
//     const charCode = event.key;
//     if (!/^\d$/.test(charCode)) {
//       event.preventDefault();
//     }
//   }

//   closeOtpPopup() {
//     this.showOtpPopup = false;
//   }

//   onOtpInput(event: any, index: number) {
//     const input = event.target as HTMLInputElement;
//     const value = input.value;

//     if (!/^\d$/.test(value)) {
//       input.value = '';
//       this.otpValues[index] = '';
//       return;
//     }

//     this.otpValues[index] = value;

//     if (value.length === 1 && index < 5) {
//       const inputsArray = this.otpInputs.toArray();
//       inputsArray[index + 1].nativeElement.focus();
//     }
//   }

//   handleBackspace(event: KeyboardEvent, index: number) {
//     const input = event.target as HTMLInputElement;
//     if (event.key === 'Backspace') {
//       if (input.value === '') {
//         this.otpValues[index] = '';
//         if (index > 0) {
//           const inputsArray = this.otpInputs.toArray();
//           inputsArray[index - 1].nativeElement.focus();
//         }
//       } else {
//         this.otpValues[index] = '';
//       }
//     }
//   }

//   isOtpComplete(): boolean {
//     return this.otpValues.every(val => val !== '');
//   }
// }


// import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
// import { AuthService } from '../../auth.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule } from '@ionic/angular';
// import { Router } from '@angular/router'; 

// @Component({
//   selector: 'app-login-screen',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     IonicModule,
//   ],
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
// })
// export class LoginScreenPage {
//   phoneNumber = '';
//   countryCode = '+91';
//   showOtpPopup = false;
//   otp: string[] = ['', '', '', '', '', ''];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   allowOnlyNumbers(event: KeyboardEvent) {
//     if (!/^\d$/.test(event.key)) {
//       event.preventDefault();
//     }
//   }

//   isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber.trim());
//   }

//   isOtpComplete(): boolean {
//     return this.otp.every(d => d.trim().length === 1);
//   }

//   async onAgreeClick() {
//     this.phoneNumber = this.phoneNumber.trim();

//     if (!this.isPhoneValid()) {
//       alert('Please enter a valid 10-digit mobile number.');
//       return;
//     }

//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;

//     try {
//       localStorage.setItem("userId",this.phoneNumber);
//       // await this.authService.initRecaptcha('recaptcha-container');
//       // await this.authService.sendOTP(fullPhone);
//       this.showOtpPopup = true;
//     } catch (err: any) {
//       console.error('Error sending OTP:', err);
//       alert(err?.message || 'Failed to send OTP. Try again.');
//     }
//   }

//   onOtpInput(event: any, index: number) {
//     const input = event.target.value;

//     if (!/^\d$/.test(input)) {
//       this.otp[index] = '';
//       event.target.value = '';
//       return;
//     }

//     this.otp[index] = input;

//     if (input && index < 5) {
//       const nextInput = this.otpInputs.get(index + 1);
//       nextInput?.nativeElement.focus();
//     }
//   }

//   handleBackspace(event: KeyboardEvent, index: number) {
//     if (event.key === 'Backspace') {
//       if (!this.otp[index] && index > 0) {
//         const prevInput = this.otpInputs.get(index - 1);
//         prevInput?.nativeElement.focus();
//       }
//       this.otp[index] = '';
//     }
//   }

//   async goToHome() {
//     if (!this.isOtpComplete()) {
//       alert('Please enter the complete 6-digit OTP.');
//       return;
//     }

//     const code = this.otp.join('');
//     try {
//       // const userCredential = await this.authService.verifyOTP(code);
//       // console.log('Logged in as:', userCredential.user?.phoneNumber);
//       // alert('Login successful!');

//       this.router.navigateByUrl('/home-screen');
//     } catch (err: any) {
//       console.error('OTP verification failed:', err);
//       alert(err?.message || 'Invalid OTP. Please try again.');
//     }
//   }
// }



// import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
// import { AuthService } from '../../auth.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule } from '@ionic/angular';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-login-screen',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     IonicModule,
//   ],
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
// })
// export class LoginScreenPage {
//   phoneNumber = '';
//   countryCode = '+91';
//   showOtpPopup = false;
//   otp: string[] = Array(6).fill('');

//   countries = [
//     { name: 'India', code: '+91' },
//     { name: 'USA', code: '+1' },
//     { name: 'UK', code: '+44' },
//     { name: 'Australia', code: '+61' },
//     { name: 'Canada', code: '+1' },
//     { name: 'Germany', code: '+49' },
//     { name: 'France', code: '+33' },
//     { name: 'Brazil', code: '+55' },
//     { name: 'South Africa', code: '+27' },
//     { name: 'Russia', code: '+7' },
//     { name: 'China', code: '+86' },
//     { name: 'Japan', code: '+81' },
//     { name: 'Singapore', code: '+65' },
//     { name: 'UAE', code: '+971' },
//     { name: 'New Zealand', code: '+64' },
//     { name: 'Mexico', code: '+52' },
//     { name: 'Italy', code: '+39' },
//     { name: 'Spain', code: '+34' },
//     { name: 'Netherlands', code: '+31' },
//     { name: 'Sweden', code: '+46' }
//   ];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   allowOnlyNumbers(event: KeyboardEvent) {
//     if (!/^\d$/.test(event.key)) {
//       event.preventDefault();
//     }
//   }

//   isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber.trim());
//   }

//   isOtpComplete(): boolean {
//     return this.otp.every(d => d.trim().length === 1);
//   }

//   onCountryChange(event: any) {
//     const selected = this.countries.find(c => c.name === event.target.value);
//     if (selected) {
//       this.countryCode = selected.code;
//     }
//   }

//   async onAgreeClick() {
//     this.phoneNumber = this.phoneNumber.trim();

//     if (!this.isPhoneValid()) {
//       alert('Please enter a valid 10-digit mobile number.');
//       return;
//     }

//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;

//     try {
//       localStorage.setItem("userId", this.phoneNumber);
//       // await this.authService.initRecaptcha('recaptcha-container');
//       // await this.authService.sendOTP(fullPhone);
//       this.showOtpPopup = true;
//     } catch (err: any) {
//       console.error('Error sending OTP:', err);
//       alert(err?.message || 'Failed to send OTP. Try again.');
//     }
//   }

//   onOtpInput(event: any, index: number) {
//     const input = event.target.value;
//     if (!/^\d$/.test(input)) {
//       this.otp[index] = '';
//       event.target.value = '';
//       return;
//     }

//     this.otp[index] = input;

//     if (input && index < this.otp.length - 1) {
//       this.otpInputs.get(index + 1)?.nativeElement.focus();
//     }
//   }

//   handleBackspace(event: KeyboardEvent, index: number) {
//     if (event.key === 'Backspace') {
//       if (!this.otp[index] && index > 0) {
//         this.otpInputs.get(index - 1)?.nativeElement.focus();
//       }
//       this.otp[index] = '';
//     }
//   }

//   async goToHome() {
//     if (!this.isOtpComplete()) {
//       alert('Please enter the complete 6-digit OTP.');
//       return;
//     }

//     const code = this.otp.join('');
//     try {
//       // const userCredential = await this.authService.verifyOTP(code);
//       // alert('Login successful!');
//       this.router.navigateByUrl('/home-screen');
//     } catch (err: any) {
//       console.error('OTP verification failed:', err);
//       alert(err?.message || 'Invalid OTP. Please try again.');
//     }
//   }
// }




// import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-login-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
// })
// export class LoginScreenPage {
//   phoneNumber = '';
//   countryCode = '+91';
//   showOtpPopup = false;
//   otp: string[] = Array(6).fill('');

//   countries = [
//     { name: 'India', code: '+91' },
//     { name: 'USA', code: '+1' },
//     { name: 'UK', code: '+44' },
//     { name: 'Australia', code: '+61' },
//     { name: 'Canada', code: '+1' },
//     { name: 'Germany', code: '+49' },
//     { name: 'France', code: '+33' },
//     { name: 'Brazil', code: '+55' },
//     { name: 'South Africa', code: '+27' },
//     { name: 'Russia', code: '+7' },
//     { name: 'China', code: '+86' },
//     { name: 'Japan', code: '+81' },
//     { name: 'Singapore', code: '+65' },
//     { name: 'UAE', code: '+971' },
//     { name: 'New Zealand', code: '+64' },
//     { name: 'Mexico', code: '+52' },
//     { name: 'Italy', code: '+39' },
//     { name: 'Spain', code: '+34' },
//     { name: 'Netherlands', code: '+31' },
//     { name: 'Sweden', code: '+46' }
//   ];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   allowOnlyNumbers(event: KeyboardEvent) {
//     if (!/^\d$/.test(event.key)) event.preventDefault();
//   }

//   isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber.trim());
//   }

//   isOtpComplete(): boolean {
//     return this.otp.every(d => d.trim().length === 1);
//   }

//   onCountryChange(event: any) {
//     const selected = this.countries.find(c => c.name === event.target.value);
//     if (selected) {
//       this.countryCode = selected.code;
//     }
//   }

//   async onAgreeClick() {
//     this.phoneNumber = this.phoneNumber.trim();
//     if (!this.isPhoneValid()) {
//       alert('Please enter a valid 10-digit mobile number.');
//       return;
//     }

//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone: fullPhone };

//     try {
//       const res: any = await this.http.post('https://websocket-8rgr.onrender.com/api/send-otp', payload).toPromise();
//       console.log('OTP sent response:', res);
//         console.log('Body:', res.body);

//       if (res.status) {
//         this.showOtpPopup = true;
//         localStorage.setItem("userId", this.phoneNumber);
//       } else {
//         alert(res.message || 'Failed to send OTP.');
//       }
//     } catch (err) {
//       console.error('Error sending OTP:', err);
//       alert('Failed to send OTP. Try again.');
//     }
//   }

//   onOtpInput(event: any, index: number) {
//     const input = event.target.value;
//     if (!/^\d$/.test(input)) {
//       this.otp[index] = '';
//       event.target.value = '';
//       return;
//     }

//     this.otp[index] = input;
//     if (input && index < this.otp.length - 1) {
//       this.otpInputs.get(index + 1)?.nativeElement.focus();
//     }
//   }

//   handleBackspace(event: KeyboardEvent, index: number) {
//     if (event.key === 'Backspace') {
//       if (!this.otp[index] && index > 0) {
//         this.otpInputs.get(index - 1)?.nativeElement.focus();
//       }
//       this.otp[index] = '';
//     }
//   }

//   async goToHome() {
//     if (!this.isOtpComplete()) {
//       alert('Please enter the complete 6-digit OTP.');
//       return;
//     }

//     const otpCode = this.otp.join('');
//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = {
//       phone: fullPhone,
//       otp: otpCode
//     };

//     try {
//       const res: any = await this.http.post('https://websocket-8rgr.onrender.com/api/verify-otp', payload).toPromise();
//       console.log('OTP verification response:', res);

//       if (res.status) {
//         alert('Login successful!');
//         this.router.navigateByUrl('/home-screen');
//       } else {
//         alert(res.message || 'Invalid OTP. Try again.');
//       }
//     } catch (err) {
//       console.error('OTP verification failed:', err);
//       alert('Failed to verify OTP. Try again.');
//     }
//   }
// }





// import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ToastController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-login-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
// })
// export class LoginScreenPage {
//   phoneNumber = '';
//   countryCode = '+91';
//   showOtpPopup = false;
//   otp: string[] = Array(6).fill('');
//   countries = [
//     { name: 'India', code: '+91' }, { name: 'USA', code: '+1' },
//     { name: 'UK', code: '+44' }, { name: 'Australia', code: '+61' },
//     { name: 'Canada', code: '+1' }, { name: 'Germany', code: '+49' },
//     { name: 'France', code: '+33' }, { name: 'Brazil', code: '+55' },
//     { name: 'South Africa', code: '+27' }, { name: 'Russia', code: '+7' },
//     { name: 'China', code: '+86' }, { name: 'Japan', code: '+81' },
//     { name: 'Singapore', code: '+65' }, { name: 'UAE', code: '+971' },
//     { name: 'New Zealand', code: '+64' }, { name: 'Mexico', code: '+52' },
//     { name: 'Italy', code: '+39' }, { name: 'Spain', code: '+34' },
//     { name: 'Netherlands', code: '+31' }, { name: 'Sweden', code: '+46' }
//   ];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private toastController: ToastController
//   ) {}

//   async showToast(message: string) {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2000,
//       position: 'bottom',
//       color: 'dark'
//     });
//     toast.present();
//   }

//   allowOnlyNumbers(event: KeyboardEvent) {
//     if (!/^\d$/.test(event.key)) event.preventDefault();
//   }

//   isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber.trim());
//   }

//   isOtpComplete(): boolean {
//     return this.otp.every(d => d.trim().length === 1);
//   }

//   onCountryChange(event: any) {
//     const selected = this.countries.find(c => c.name === event.target.value);
//     if (selected) {
//       this.countryCode = selected.code;
//     }
//   }

//   async onAgreeClick() {
//     this.phoneNumber = this.phoneNumber.trim();
//     if (!this.isPhoneValid()) {
//       this.showToast('Please enter a valid 10-digit mobile number.');
//       return;
//     }

//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone: fullPhone };

//     try {
//       const res: any = await this.http.post('https://websocket-8rgr.onrender.com/api/send-otp', payload).toPromise();
//       console.log('OTP sent response:', res);

//       if (res.status) {
//         this.showOtpPopup = true;
//         localStorage.setItem("userId", this.phoneNumber);
//       } else {
//         this.showToast(res.message || 'Failed to send OTP.');
//       }
//     } catch (err) {
//       console.error('Error sending OTP:', err);
//       this.showToast('Failed to send OTP. Try again.');
//     }
//   }

//   onOtpInput(event: any, index: number) {
//     const input = event.target.value;
//     if (!/^\d$/.test(input)) {
//       this.otp[index] = '';
//       event.target.value = '';
//       return;
//     }

//     this.otp[index] = input;
//     if (input && index < this.otp.length - 1) {
//       this.otpInputs.get(index + 1)?.nativeElement.focus();
//     }
//   }

//   handleBackspace(event: KeyboardEvent, index: number) {
//     if (event.key === 'Backspace') {
//       if (!this.otp[index] && index > 0) {
//         this.otpInputs.get(index - 1)?.nativeElement.focus();
//       }
//       this.otp[index] = '';
//     }
//   }

//   async goToHome() {
//     if (!this.isOtpComplete()) {
//       this.showToast('Please enter the complete 6-digit OTP.');
//       return;
//     }

//     const otpCode = this.otp.join('');
//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = {
//       phone: fullPhone,
//       otp: otpCode
//     };

//     try {
//       const res: any = await this.http.post('https://websocket-8rgr.onrender.com/api/verify-otp', payload).toPromise();
//       console.log('OTP verification response:', res);

//       if (res.status) {
//         this.showToast('Login successful!');
//         this.router.navigateByUrl('/home-screen');
//       } else {
//         this.showToast(res.message || 'Invalid OTP. Try again.');
//       }
//     } catch (err) {
//       console.error('OTP verification failed:', err);
//       this.showToast('Failed to verify OTP. Try again.');
//     }
//   }
// }



// import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ToastController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-login-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
// })
// export class LoginScreenPage {
//   phoneNumber = '';
//   countryCode = '+91';
//   showOtpPopup = false;
//   otp: string[] = Array(6).fill('');
//   timer: number = 60;
//   timerInterval: any;

//   countries = [
//     { name: 'India', code: '+91' }, { name: 'USA', code: '+1' },
//     { name: 'UK', code: '+44' }, { name: 'Australia', code: '+61' },
//     { name: 'Canada', code: '+1' }, { name: 'Germany', code: '+49' },
//     { name: 'France', code: '+33' }, { name: 'Brazil', code: '+55' },
//     { name: 'South Africa', code: '+27' }, { name: 'Russia', code: '+7' },
//     { name: 'China', code: '+86' }, { name: 'Japan', code: '+81' },
//     { name: 'Singapore', code: '+65' }, { name: 'UAE', code: '+971' },
//     { name: 'New Zealand', code: '+64' }, { name: 'Mexico', code: '+52' },
//     { name: 'Italy', code: '+39' }, { name: 'Spain', code: '+34' },
//     { name: 'Netherlands', code: '+31' }, { name: 'Sweden', code: '+46' }
//   ];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private toastController: ToastController
//   ) {}

//   async showToast(message: string) {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2000,
//       position: 'bottom',
//       color: 'dark'
//     });
//     toast.present();
//   }

//   allowOnlyNumbers(event: KeyboardEvent) {
//     if (!/^\d$/.test(event.key)) event.preventDefault();
//   }

//   isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber.trim());
//   }

//   isOtpComplete(): boolean {
//     return this.otp.every(d => d.trim().length === 1);
//   }

//   getFormattedTime(): string {
//     const minutes = Math.floor(this.timer / 60);
//     const seconds = this.timer % 60;
//     return `${('0' + minutes).slice(-2)} : ${('0' + seconds).slice(-2)}`;
//   }

//   startTimer() {
//     this.timer = 60;
//     clearInterval(this.timerInterval);
//     this.timerInterval = setInterval(() => {
//       if (this.timer > 0) {
//         this.timer--;
//       } else {
//         clearInterval(this.timerInterval);
//       }
//     }, 1000);
//   }

//   resendOtp() {
//     if (this.timer === 0) {
//       this.onAgreeClick(); 
//     }
//   }

//   onCountryChange(event: any) {
//     const selected = this.countries.find(c => c.name === event.target.value);
//     if (selected) {
//       this.countryCode = selected.code;
//     }
//   }

//   async onAgreeClick() {
//     this.phoneNumber = this.phoneNumber.trim();
//     if (!this.isPhoneValid()) {
//       this.showToast('Please enter a valid 10-digit mobile number.');
//       return;
//     }

//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone: fullPhone };

//     try {
//       const res: any = await this.http.post('https://websocket-8rgr.onrender.com/api/send-otp', payload).toPromise();
//       console.log('OTP sent response:', res);

//       if (res.status) {
//         this.showOtpPopup = true;
//         this.startTimer();
//         localStorage.setItem("userId", this.phoneNumber);
//       } else {
//         this.showToast(res.message || 'Failed to send OTP.');
//       }
//     } catch (err) {
//       console.error('Error sending OTP:', err);
//       this.showToast('Failed to send OTP. Try again.');
//     }
//   }

//   onOtpInput(event: any, index: number) {
//     const input = event.target.value;
//     if (!/^\d$/.test(input)) {
//       this.otp[index] = '';
//       event.target.value = '';
//       return;
//     }

//     this.otp[index] = input;
//     if (input && index < this.otp.length - 1) {
//       this.otpInputs.get(index + 1)?.nativeElement.focus();
//     }
//   }

//   handleBackspace(event: KeyboardEvent, index: number) {
//     if (event.key === 'Backspace') {
//       if (!this.otp[index] && index > 0) {
//         this.otpInputs.get(index - 1)?.nativeElement.focus();
//       }
//       this.otp[index] = '';
//     }
//   }

//   async goToHome() {
//     if (!this.isOtpComplete()) {
//       this.showToast('Please enter the complete 6-digit OTP.');
//       return;
//     }

//     const otpCode = this.otp.join('');
//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone: fullPhone, otp: otpCode };

//     try {
//       const res: any = await this.http.post('https://websocket-8rgr.onrender.com/api/verify-otp', payload).toPromise();
//       console.log('OTP verification response:', res);

//       if (res.status) {
//         this.showToast('Login successful!');
//         this.router.navigateByUrl('/home-screen');
//       } else {
//         this.showToast(res.message || 'Invalid OTP. Try again.');
//       }
//     } catch (err) {
//       console.error('OTP verification failed:', err);
//       this.showToast('Failed to verify OTP. Try again.');
//     }
//   }
// }



// import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ToastController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { ApiService } from 'src/app/services/api/api.service'; 

// @Component({
//   selector: 'app-login-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
// })
// export class LoginScreenPage {
//   phoneNumber = '';
//   countryCode = '+91';
//   showOtpPopup = false;
//   otp: string[] = Array(6).fill('');
//   timer: number = 60;
//   timerInterval: any;

//   countries = [
//     { name: 'India', code: '+91' }, { name: 'USA', code: '+1' },
//     { name: 'UK', code: '+44' }, { name: 'Australia', code: '+61' },
//     { name: 'Canada', code: '+1' }, { name: 'Germany', code: '+49' },
//     { name: 'France', code: '+33' }, { name: 'Brazil', code: '+55' },
//     { name: 'South Africa', code: '+27' }, { name: 'Russia', code: '+7' },
//     { name: 'China', code: '+86' }, { name: 'Japan', code: '+81' },
//     { name: 'Singapore', code: '+65' }, { name: 'UAE', code: '+971' },
//     { name: 'New Zealand', code: '+64' }, { name: 'Mexico', code: '+52' },
//     { name: 'Italy', code: '+39' }, { name: 'Spain', code: '+34' },
//     { name: 'Netherlands', code: '+31' }, { name: 'Sweden', code: '+46' }
//   ];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;

//   constructor(
//     private api: ApiService,
//     private router: Router,
//     private toastController: ToastController
//   ) {}

//   async showToast(message: string) {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2000,
//       position: 'bottom',
//       color: 'dark'
//     });
//     toast.present();
//   }

//   allowOnlyNumbers(event: KeyboardEvent) {
//     if (!/^\d$/.test(event.key)) event.preventDefault();
//   }

//   isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber.trim());
//   }

//   isOtpComplete(): boolean {
//     return this.otp.every(d => d.trim().length === 1);
//   }

//   getFormattedTime(): string {
//     const minutes = Math.floor(this.timer / 60);
//     const seconds = this.timer % 60;
//     return `${('0' + minutes).slice(-2)} : ${('0' + seconds).slice(-2)}`;
//   }

//   startTimer() {
//     this.timer = 60;
//     clearInterval(this.timerInterval);
//     this.timerInterval = setInterval(() => {
//       if (this.timer > 0) {
//         this.timer--;
//       } else {
//         clearInterval(this.timerInterval);
//       }
//     }, 1000);
//   }

//   resendOtp() {
//     if (this.timer === 0) {
//       this.onAgreeClick(); 
//     }
//   }

//   onCountryChange(event: any) {
//     const selected = this.countries.find(c => c.name === event.target.value);
//     if (selected) {
//       this.countryCode = selected.code;
//     }
//   }

//   async onAgreeClick() {
//     this.phoneNumber = this.phoneNumber.trim();
//     if (!this.isPhoneValid()) {
//       this.showToast('Please enter a valid 10-digit mobile number.');
//       return;
//     }

//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone_number: fullPhone };

//     try {
//       const res: any = await this.api.post('/api/send-otp', payload).toPromise();
//       console.log('OTP sent response:', res);

//       if (res.status) {
//         this.showOtpPopup = true;
//         this.startTimer();
//         localStorage.setItem("userId", this.phoneNumber);
//       } else {
//         this.showToast(res.message || 'Failed to send OTP.');
//       }
//     } catch (err) {
//       console.error('Error sending OTP:', err);
//       this.showToast('Failed to send OTP. Try again.');
//     }
//   }

//   onOtpInput(event: any, index: number) {
//     const input = event.target.value;
//     if (!/^\d$/.test(input)) {
//       this.otp[index] = '';
//       event.target.value = '';
//       return;
//     }

//     this.otp[index] = input;
//     if (input && index < this.otp.length - 1) {
//       this.otpInputs.get(index + 1)?.nativeElement.focus();
//     }
//   }

//   handleBackspace(event: KeyboardEvent, index: number) {
//     if (event.key === 'Backspace') {
//       if (!this.otp[index] && index > 0) {
//         this.otpInputs.get(index - 1)?.nativeElement.focus();
//       }
//       this.otp[index] = '';
//     }
//   }

//   async goToHome() {
//     if (!this.isOtpComplete()) {
//       this.showToast('Please enter the complete 6-digit OTP.');
//       return;
//     }

//     const otpCode = this.otp.join('');
//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone_number: fullPhone, otp_code: otpCode };

//     try {
//       const res: any = await this.api.post('/api/verify-otp', payload).toPromise();
//       console.log('OTP verification response:', res);

//       if (res.status) {
//         this.showToast('Login successful!');
//         this.router.navigateByUrl('/home-screen');
//       } else {
//         this.showToast(res.message || 'Invalid OTP. Try again.');
//       }
//     } catch (err) {
//       console.error('OTP verification failed:', err);
//       this.showToast('Failed to verify OTP. Try again.');
//     }
//   }
// }



// import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ToastController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { ApiService } from 'src/app/services/api/api.service';
// import { EncryptionService } from 'src/app/services/encryption.service';

// @Component({
//   selector: 'app-login-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './login-screen.page.html',
//   styleUrls: ['./login-screen.page.scss'],
// })
// export class LoginScreenPage {
//   phoneNumber = '';
//   countryCode = '+91';
//   showOtpPopup = false;
//   showConfirmPopup = false;
//   otp: string[] = Array(6).fill('');
//   timer: number = 60;
//   timerInterval: any;

//   countries = [
//     { name: 'India', code: '+91' }, { name: 'USA', code: '+1' },
//     { name: 'UK', code: '+44' }, { name: 'Australia', code: '+61' },
//     { name: 'Canada', code: '+1' }, { name: 'Germany', code: '+49' },
//     { name: 'France', code: '+33' }, { name: 'Brazil', code: '+55' },
//     { name: 'South Africa', code: '+27' }, { name: 'Russia', code: '+7' },
//     { name: 'China', code: '+86' }, { name: 'Japan', code: '+81' },
//     { name: 'Singapore', code: '+65' }, { name: 'UAE', code: '+971' },
//     { name: 'New Zealand', code: '+64' }, { name: 'Mexico', code: '+52' },
//     { name: 'Italy', code: '+39' }, { name: 'Spain', code: '+34' },
//     { name: 'Netherlands', code: '+31' }, { name: 'Sweden', code: '+46' }
//   ];

//   @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;
//   isLoading: boolean = false;
//   isSendingOtp: boolean = false;
//   isVerifyingOtp: boolean = false;

//   constructor(
//     private api: ApiService,
//     private router: Router,
//     private toastController: ToastController,
//     private encryptionService: EncryptionService
//   ) { }

//   // Utility to show toast messages
//   async showToast(message: string, color: 'danger' | 'success' | 'dark' = 'dark') {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2000,
//       color,
//     });
//     toast.present();
//   }

//   // Allow only numeric input
//   allowOnlyNumbers(event: KeyboardEvent) {
//     if (!/^\d$/.test(event.key)) event.preventDefault();
//   }

//   // Phone number validation
//   isPhoneValid(): boolean {
//     return /^\d{10}$/.test(this.phoneNumber.trim());
//   }

//   // Check if all OTP fields are filled
//   isOtpComplete(): boolean {
//     return this.otp.every(d => d.trim().length === 1);
//   }

//   // Format timer for display
//   getFormattedTime(): string {
//     const minutes = Math.floor(this.timer / 60);
//     const seconds = this.timer % 60;
//     return `${('0' + minutes).slice(-2)} : ${('0' + seconds).slice(-2)}`;
//   }

//   // Start countdown for OTP resend
//   startTimer() {
//     this.timer = 60;
//     clearInterval(this.timerInterval);
//     this.timerInterval = setInterval(() => {
//       if (this.timer > 0) {
//         this.timer--;
//       } else {
//         clearInterval(this.timerInterval);
//       }
//     }, 1000);
//   }

//   // Trigger resend OTP if allowed
//   resendOtp() {
//     if (this.timer === 0) {
//       this.sendOtp();
//     }
//   }

//   // Handle country code change from dropdown
//   onCountryChange(event: any) {
//     const selected = this.countries.find(c => c.name === event.target.value);
//     if (selected) {
//       this.countryCode = selected.code;
//     }
//   }

//   // Called when user clicks "Agree & Continue"
//   onAgreeClick() {
//     this.phoneNumber = this.phoneNumber.trim();
//     if (!this.isPhoneValid()) {
//       this.showToast('Please enter a valid 10-digit mobile number.', 'danger');
//       return;
//     }
//     this.showConfirmPopup = true;
//   }

//   // User edits phone number
//   onEdit() {
//     this.showConfirmPopup = false;
//   }

//   // User confirms phone number, OTP is sent
//   // async onConfirm() {
//   //   this.showConfirmPopup = false;
//   //   await this.sendOtp();
//   // }

//   async onConfirm() {
//     this.showConfirmPopup = false;
//     this.isSendingOtp = true;  // Start loader
//     await this.sendOtp();      // Call OTP send
//     this.isSendingOtp = false; // Stop loader when done
//   }

//   // Send OTP to the entered number
//   async sendOtp() {
//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone_number: fullPhone };

//     try {
//       const res: any = await this.api.post('/api/auth/send-otp', payload).toPromise();
//       console.log('OTP sent response:', res);

//       if (res.status) {
//         this.showOtpPopup = true;
//         this.startTimer();
//       } else {
//         this.showToast(res.message || 'Failed to send OTP.');
//       }
//     } catch (err) {
//       console.error('Error sending OTP:', err);
//       this.showToast('Failed to send OTP. Try again.', 'danger');
//     }
//   }

//   // Handle OTP input logic
//   onOtpInput(event: any, index: number) {
//     const input = event.target.value;
//     if (!/^\d$/.test(input)) {
//       this.otp[index] = '';
//       event.target.value = '';
//       return;
//     }

//     this.otp[index] = input;
//     if (input && index < this.otp.length - 1) {
//       this.otpInputs.get(index + 1)?.nativeElement.focus();
//     }
//   }

//   // Handle backspace on OTP input
//   handleBackspace(event: KeyboardEvent, index: number) {
//     if (event.key === 'Backspace') {
//       if (!this.otp[index] && index > 0) {
//         this.otpInputs.get(index - 1)?.nativeElement.focus();
//       }
//       this.otp[index] = '';
//     }
//   }

//   // Final verification step: Verify OTP and login
//   async goToHome() {
//     if (!this.isOtpComplete()) {
//       this.showToast('Please enter the complete 6-digit OTP.');
//       return;
//     }

//     this.isLoading = true; // Start loading
//     const otpCode = this.otp.join('');
//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     const payload = { phone_number: fullPhone, otp_code: otpCode };

//     this.isVerifyingOtp = true;

//     // try {
//     //   const res: any = await this.api.post('/api/auth/verify-otp', payload).toPromise();
//     //   console.log('OTP verification response:', res);

//     //   if (res.status) {
//     //     this.showToast('Login successful!', 'success');
//     //     localStorage.setItem("phone_number", `${this.countryCode}${this.phoneNumber}`);
//     //     localStorage.setItem("userId", res.user_id.toString());
//     //     // this.router.navigateByUrl('/home-screen');
//     //     //khusha
//     //     // localStorage.setItem("userId", "28");
//     //     const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();
//     //     // send your publicKeyHex to server or share with contacts
//     //     console.log('Your public key:', publicKeyHex);
//     //     //on basis of userid save public key user table
//     //     // post https://telldemm-backend.onrender.com/api/users/update-public-key
//     //     // payload 
//     //     //         {
//     //     //   "user_id": 28,
//     //     //   "public_key": "abcd1234ecchexvalue"
//     //     // }
//     //     //khusha

//     //     this.router.navigateByUrl('/profile-setup');
//     //   } else {
//     //     this.showToast(res.message || 'Invalid OTP. Try again.');
//     //   }
//     // } catch (err) {
//     //   console.error('OTP verification failed:', err);
//     //   this.showToast('Failed to verify OTP. Try again.', 'danger');
//     // } finally {
//     //   this.isVerifyingOtp = false;
//     // }

//     try {
//   const res: any = await this.api.post('/api/auth/verify-otp', payload).toPromise();
//   console.log('OTP verification response:', res);

//   if (res.status) {
//     this.showToast('Login successful!', 'success');

//     const fullPhone = `${this.countryCode}${this.phoneNumber}`;
//     localStorage.setItem("phone_number", fullPhone);
//     localStorage.setItem("userId", res.user_id.toString());
//     localStorage.setItem("loggedIn", "true");

//     // ✅ Generate ECC keys
//     const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();
//     console.log('Your public key:', publicKeyHex);

//     // ✅ Post public key to the server
//     await this.api.post('/api/users/update-public-key', {
//       user_id: res.user_id,
//       public_key: publicKeyHex
//     }).toPromise();

//     // ✅ Navigate to profile setup
//     this.router.navigateByUrl('/profile-setup');
//   } else {
//     this.showToast(res.message || 'Invalid OTP. Try again.');
//   }
// } catch (err) {
//   console.error('OTP verification failed:', err);
//   this.showToast('Failed to verify OTP. Try again.', 'danger');
// } finally {
//   this.isVerifyingOtp = false;
// }

//   }
// }



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
    private toastController: ToastController
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

  // async sendOtp() {
  //   const fullPhone = `${this.countryCode}${this.phoneNumber}`;
  //   try {
  //     const res = await this.authService.sendOtp(fullPhone);
  //     if (res.status) {
  //       this.showOtpPopup = true;
  //       this.startTimer();
  //     } else {
  //       this.showToast(res.message || 'Failed to send OTP.');
  //     }
  //   } catch (err) {
  //     this.showToast('Failed to send OTP. Try again.', 'danger');
  //   }
  // }

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
    const fullPhone = `${this.countryCode}${this.phoneNumber}`;
    const otpCode = this.otp.join('');

    const result = await this.authService.verifyOtp(fullPhone, otpCode);
    this.isVerifyingOtp = false;

    if (result.success) {
      this.showToast('Login successful!', 'success');
//       localStorage.setItem('userId', this.phoneNumber); //this will temporary
// const userId = this.phoneNumber;   //this will temporary
      this.router.navigateByUrl('/profile-setup');
    } else {
      this.showToast(result.message || 'Invalid OTP', 'danger');
    }
  }

  
}
