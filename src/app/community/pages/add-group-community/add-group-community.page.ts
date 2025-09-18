import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';

@Component({
  selector: 'app-add-group-community',
  templateUrl: './add-group-community.page.html',
  styleUrls: ['./add-group-community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AddGroupCommunityPage implements OnInit {
  communityId: string | null = null;
  communityName = '';
  groupsInCommunity: Array<{ id: string; name: string; type?: string; membersCount?: number }> = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseChatService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // read communityId from query params
    this.route.queryParams.subscribe(params => {
      const cid = params['communityId'] || params['id'];
      if (cid) {
        this.communityId = cid;
        this.loadGroupsForCommunity();
      }
    });
  }

    goToCreateNewGroup() {
    const communityId = this.communityId;
    this.navCtrl.navigateForward(['/create-new-group'], {
      queryParams: { communityId, communityName: this.communityName }
    });
  }

  async loadGroupsForCommunity() {
    if (!this.communityId) return;
    this.loading = true;
    this.groupsInCommunity = [];

    try {
      // optional: fetch community meta to show name if you want
      // const comm = await this.firebaseService.getCommunityInfo?.(this.communityId as string).catch(() => null);
      // if (comm) {
      //   this.communityName = comm.name || '';
      // }

      // get group ids under community
      const groupIds = await this.firebaseService.getGroupsInCommunity(this.communityId);
      if (!groupIds || groupIds.length === 0) {
        this.loading = false;
        return;
      }

      // fetch each group's details
      for (const gid of groupIds) {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (!g) continue;
        this.groupsInCommunity.push({
          id: gid,
          name: g.name || 'Unnamed group',
          type: g.type || 'normal',
          membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0)
        });
      }
    } catch (err) {
      console.error('loadGroupsForCommunity error', err);
    } finally {
      this.loading = false;
    }
  }

  // placeholder for remove / leave button
  removeGroupFromCommunity(groupId: string) {
    console.log('remove clicked for', groupId);
    // implement removal logic with firebaseService as needed
  }

  goToAddExistingGroups() {
  // get communityId if available
  const communityId = this.route.snapshot.queryParamMap.get('communityId');

  // navigate to add-existing-groups page and pass communityId
  this.navCtrl.navigateForward(['/add-existing-groups'], {
    queryParams: { communityId }
  });
}
}
