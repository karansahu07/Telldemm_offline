import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule} from '@ionic/angular';

@Component({
  selector: 'app-setting-profile',
  templateUrl: './setting-profile.page.html',
  styleUrls: ['./setting-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class SettingProfilePage implements OnInit {

  profileImageUrl = 'assets/images/user.jfif'; // default image

  user = {
    name: 'KARAN',
    about: '.',
    phone: '+91 91381 52160',
  };

  constructor() {}

  editProfileImage() {
    console.log('Edit profile image clicked');
    // logic to open file picker / camera
  }

  addLinks() {
    console.log('Add links clicked');
    // logic to add user links
  }

  ngOnInit() {
  }

}
