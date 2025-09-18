import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule],
})
export class PrivacyPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
  }
lastSeen: string = 'contacts';
  profilePhoto: string = 'everyone';
  about: string = 'contacts';

 

  goToStatusPrivacy() {
    this.router.navigateByUrl('privacy/status');
  }

  goToBlockedContacts() {
    this.router.navigateByUrl('privacy/blocked');
  }
}
