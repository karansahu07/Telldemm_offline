import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-userabout',
  templateUrl: './userabout.page.html',
  styleUrls: ['./userabout.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UseraboutPage implements OnInit {

  receiverId: string = '';
  receiver_phone: string = '';
  isGroup: boolean = false;
  receiver_name: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.receiverId = params['receiverId'] || '';
      this.receiver_phone = params['receiver_phone'] || '';
      this.isGroup = params['isGroup'] === 'true';

       this.receiver_name = localStorage.getItem('receiver_name') || '';
    });
  }

  goToHome() {
    this.router.navigate(['/home-screen']);
  }

  goBackToChat() {
    this.router.navigate(['/chatting-screen'], {
      queryParams: {
        receiverId: this.receiverId,
        receiver_phone: this.receiver_phone,
        isGroup: this.isGroup
      }
    });
  }

}
