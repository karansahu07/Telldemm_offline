import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-help-feedback',
  templateUrl: './help-feedback.page.html',
  styleUrls: ['./help-feedback.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HelpFeedbackPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
  }



  openHelpCenter() {
    this.router.navigate(['settings/help/help-center']);
  }

  openTerms() {
    this.router.navigate(['settings/help/terms']);
  }

  openChannelReports() {
    this.router.navigate(['settings/help/channel-reports']);
  }

  openAppInfo() {
    this.router.navigate(['settings/help/app-info']);
  }

}
