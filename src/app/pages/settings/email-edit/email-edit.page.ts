import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
// import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

const STORAGE_KEY = 'user.email';

@Component({
  selector: 'app-email-edit',
  templateUrl: './email-edit.page.html',
  styleUrls: ['./email-edit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule,ReactiveFormsModule],
})
export class EmailEditPage implements OnInit {
emailForm: FormGroup;
isEditing = false;


constructor(private fb: FormBuilder) {
this.emailForm = this.fb.group({
email: ['Khushi.ss103@gmail.com', [Validators.required, Validators.email, Validators.maxLength(254)]],
});
}


ngOnInit() {}


get emailControl(): FormControl {
return this.emailForm.get('email') as FormControl;
}


editEmail() {
this.isEditing = true;
}


saveEmail() {
if (this.emailForm.invalid) return;
console.log('Email saved:', this.emailForm.value.email);
this.isEditing = false;
}


cancelEdit() {
this.isEditing = false;
// reset to original value if needed
this.emailForm.reset({ email: 'Khushi.ss103@gmail.com' });
}
}
