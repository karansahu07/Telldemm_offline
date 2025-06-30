// import { Component } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
// export class HomePage {

//   constructor() {}

// }

export class HomePage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigateByUrl('/welcome-screen');
    }, 3000);
  }

}
