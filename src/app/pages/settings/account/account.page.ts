import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,RouterModule],
})
export class AccountPage implements OnInit {

  constructor(private navCtrl: NavController,private router:Router) {}

  ngOnInit() {
  }




  navigateTo(page: string) {
    this.navCtrl.navigateForward(`/settings/${page}`);
  }

  async openDeleteConfirmation() {
    // Simulate delete confirmation modal
    console.log('Delete account modal opened');
  }
  goToEditEmail() {
  this.router.navigate(['/email-edit']);
}


}
