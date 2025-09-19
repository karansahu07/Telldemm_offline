import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController, IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.page.html',
  styleUrls: ['./avatar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AvatarPage implements OnInit {

  ngOnInit() {
  }

  constructor(private actionSheetController: ActionSheetController) {}

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Create your Avatar',
      buttons: [
        {
          text: 'Skin Tone',
          handler: () => {
            this.openSkinToneActionSheet();
          }
        },
        {
          text: 'Hair Color',
          handler: () => {
            this.openHairColorActionSheet();
          }
        },
        {
          text: 'Outfit',
          handler: () => {
            this.openOutfitActionSheet();
          }
        },
        {
          text: 'Save Avatar',
          handler: () => {
            console.log('Avatar saved');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async openSkinToneActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Skin Tone',
      buttons: [
        { text: 'Light', handler: () => console.log('Selected Light') },
        { text: 'Medium', handler: () => console.log('Selected Medium') },
        { text: 'Dark', handler: () => console.log('Selected Dark') },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openHairColorActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Hair Color',
      buttons: [
        { text: 'Black', handler: () => console.log('Selected Black') },
        { text: 'Brown', handler: () => console.log('Selected Brown') },
        { text: 'Blonde', handler: () => console.log('Selected Blonde') },
        { text: 'Red', handler: () => console.log('Selected Red') },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openOutfitActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Outfit',
      buttons: [
        { text: 'Casual', handler: () => console.log('Selected Casual') },
        { text: 'Formal', handler: () => console.log('Selected Formal') },
        { text: 'Sporty', handler: () => console.log('Selected Sporty') },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

}
