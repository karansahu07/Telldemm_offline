// import { Component, OnInit } from '@angular/core';
// import { IonicModule, NavController } from '@ionic/angular';
// import { ActivatedRoute } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-profile-dp-view',
//   templateUrl: './profile-dp-view.page.html',
//   styleUrls: ['./profile-dp-view.page.scss'],
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
// })
// export class ProfileDpViewPage implements OnInit {
//   imageUrl: string = 'assets/images/user.jfif';
//   isGroup: boolean = false;

//   constructor(
//     private navCtrl: NavController,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit() {
//   this.imageUrl = this.route.snapshot.queryParamMap.get('image') || this.imageUrl;

//   const isGroupParam = this.route.snapshot.queryParamMap.get('isGroup');
//   this.isGroup = isGroupParam === 'true';
// }


//   editProfileDp() {
//     if (this.isGroup) {
//       console.log('Edit Group Profile Picture clicked');
//     } else {
//       console.log('Edit User Profile Picture clicked');
//     }
//   }

//   closePage() {
//     this.navCtrl.back();
//   }
// }


import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-profile-dp-view',
  templateUrl: './profile-dp-view.page.html',
  styleUrls: ['./profile-dp-view.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ProfileDpViewPage implements OnInit {
  imageUrl: string = 'assets/images/user.jfif';
  isGroup: boolean = false;
  showEditModal: boolean = false;
  profileImage: string | undefined;
  groupId: number | null = null;
  firebaseGroupId: string | null = null; 

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private service : ApiService
  ) {}

  ngOnInit() {
    this.imageUrl = this.route.snapshot.queryParamMap.get('image') || this.imageUrl;

    const isGroupParam = this.route.snapshot.queryParamMap.get('isGroup');
    this.isGroup = isGroupParam === 'true';
     const gid = this.route.snapshot.queryParamMap.get('group_id');
    const fid = this.route.snapshot.queryParamMap.get('receiverId');
    if (gid) this.groupId = +gid;
    if (fid) this.firebaseGroupId = fid;
  }

  editProfileDp() {
    if (this.isGroup) {
      this.showEditModal = true;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  closePage() {
    this.navCtrl.back();
  }

 async pickOption(option: string) {
    console.log('Selected:', option);

    if (option === 'gallery') {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      this.profileImage = image.dataUrl;

      // ✅ Convert DataURL → File
      const file = this.dataURLtoFile(image.dataUrl as string, 'group-dp.jpg');

      // ✅ Call API
      this.service
        .updateGroupDp(this.groupId, this.firebaseGroupId, file)
        .subscribe({
          next: (res : any) => {
            console.log('✅ Group DP updated:', res);

            this.imageUrl = this.profileImage || this.imageUrl;
          },
          error: (err : any) => {
            console.error('❌ Failed to update DP:', err);
          },
        });
    }

    this.closeEditModal();
  }

  private dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  // closeEditModal() {
  //   console.log("Modal closed");
  // }
}
