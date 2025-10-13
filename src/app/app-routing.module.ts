// import { NgModule } from '@angular/core';
// import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


// const routes: Routes = [
//   {
//     path: 'home',
//     loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
//   },
//   {
//     path: '',
//     redirectTo: 'home',
//     pathMatch: 'full'
//   },
//   {
//     path: 'welcome-screen',
//     loadChildren: () => import('./welcome-screen/welcome-screen.module').then( m => m.WelcomeScreenPageModule)
//   },
//   {
//     path: 'login-screen',
//     loadChildren: () => import('./auth/login/login-screen/login-screen.module').then( m => m.LoginScreenPageModule)
//   },
//   {
//     path: 'home-screen',
//     loadChildren: () => import('./home-screen/home-screen.module').then( m => m.HomeScreenPageModule)
//   },
//   {
//     path: 'chatting-screen',
//     loadChildren: () => import('./user-screens/chatting-screen/chatting-screen.module').then( m => m.ChattingScreenPageModule)
//   },
//   {
//     path: 'calling-screen',
//     loadChildren: () => import('./user-screens/voice-call/calling-screen/calling-screen.module').then( m => m.CallingScreenPageModule)
//   },
//   {
//     path: 'calls-screen',
//     loadChildren: () => import('./user-screens/voice-call/calls-screen/calls-screen.module').then(m => m.CallsScreenPageModule)
//   },
//   {
//     path: 'status-screen',
//     loadChildren: () => import('./status-screens/status-screen/status-screen.module').then( m => m.StatusScreenPageModule)
//   },
//   {
//     path: 'setting-screen',
//     loadChildren: () => import('./setting-screen/setting-screen.module').then( m => m.SettingScreenPageModule)
//   },
//   {
//     path: 'see-status-screen',
//     loadChildren: () => import('./status-screens/see-status-screen/see-status-screen.module').then( m => m.SeeStatusScreenPageModule)
//   },
//   {
//   path: 'profile-setup',
//   loadComponent: () => import('./components/profile-setup/profile-setup.page').then(m => m.ProfileSetupPage)
// }

// ];

// @NgModule({
//   imports: [
//     RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
//   ],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { } 



import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'welcome-screen',
    canActivate: [LoginRedirectGuard],
    loadChildren: () => import('./welcome-screen/welcome-screen.module').then(m => m.WelcomeScreenPageModule)
  },
  {
    path: 'login-screen',
    canActivate: [LoginRedirectGuard],
    loadChildren: () => import('./auth/login/login-screen/login-screen.module').then(m => m.LoginScreenPageModule)
  },
  {
    path: 'home-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home-screen/home-screen.module').then(m => m.HomeScreenPageModule)
  },
  {
    path: 'chatting-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user-screens/chatting-screen/chatting-screen.module').then(m => m.ChattingScreenPageModule)
  },
  {
    path: 'calling-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user-screens/voice-call/calling-screen/calling-screen.module').then(m => m.CallingScreenPageModule)
  },
  {
    path: 'calls-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user-screens/voice-call/calls-screen/calls-screen.module').then(m => m.CallsScreenPageModule)
  },
  {
    path: 'status-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./status-screens/status-screen/status-screen.module').then(m => m.StatusScreenPageModule)
  },
  {
    path: 'setting-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./setting-screen/setting-screen.module').then(m => m.SettingScreenPageModule)
  },
  {
    path: 'see-status-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./status-screens/see-status-screen/see-status-screen.module').then(m => m.SeeStatusScreenPageModule)
  },
  {
    path: 'profile-setup',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/profile-setup/profile-setup.page').then(m => m.ProfileSetupPage)
  },
  {
    path: 'contact-screen',
    canActivate: [AuthGuard],
    loadComponent: () => import('./contact-screen/contacts.page').then(m => m.ContactsPage)
  },
  {
    path: 'community-screen',
    canActivate: [AuthGuard],  
    loadComponent: () => import('./community/community-screen/community.page').then(m => m.CommunityPage)
  },
  // {
  //   path: 'community-new',
  //   // canActivate: [AuthGuard],  
  //   loadComponent: () => import('./community-new/community-1.page').then(m => m.Community1Page)
  // },
  {
    path: 'profile-screen',
    canActivate: [AuthGuard],
    loadComponent: () => import('./profile-screen/userabout.page').then(m => m.UseraboutPage)
  },
  {
    path: 'change-group-name',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/change-group-name/change-group-name.module').then( m => m.ChangeGroupNamePageModule)
  },
  {
    path: 'add-members',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/add-members/add-members.module').then( m => m.AddMembersPageModule)
  },
  {
    path: 'view-past-members',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/view-past-members/view-past-members.module').then( m => m.ViewPastMembersPageModule)
  },
  {
    path: 'group-description',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/group-description/group-description.module').then( m => m.GroupDescriptionPageModule)
  },
  {
    path: 'attachment-preview',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/attachment-preview/attachment-preview.module').then( m => m.AttachmentPreviewPageModule)
  },
  {
    path: 'forwardmessage',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/forwardmessage/forwardmessage/forwardmessage.module').then( m => m.ForwardmessagePageModule)
  },
  {
    path: 'setting-profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/setting-profile/setting-profile.module').then( m => m.SettingProfilePageModule)
  },
  {
    path: 'profile-dp-view',
    loadChildren: () => import('./pages/profile-dp-view/profile-dp-view.module').then( m => m.ProfileDpViewPageModule)
  },
  {
    path: 'update-username',
    loadChildren: () => import('./pages/update-username/update-username.module').then( m => m.UpdateUsernamePageModule)
  },
  {
    path: 'update-status',
    loadChildren: () => import('./pages/update-status/update-status.module').then( m => m.UpdateStatusPageModule)
  },
  {
    path: 'social-media-links',
    loadChildren: () => import('./pages/social-media-links/social-media-links.module').then( m => m.SocialMediaLinksPageModule)
  },
  {
    path: 'add-instagram',
    loadChildren: () => import('./pages/add-instagram/add-instagram.module').then( m => m.AddInstagramPageModule)
  },
  {
    path: 'new-community-form',
    loadChildren: () => import('./community/pages/new-community-form/new-community-form.module').then( m => m.NewCommunityFormPageModule)
  },
  {
    path: 'new-community',
    loadChildren: () => import('./community/pages/new-community/new-community.module').then( m => m.NewCommunityPageModule)
  },
  {
    path: 'community-detail',
    loadChildren: () => import('./community/pages/community-detail/community-detail.module').then( m => m.CommunityDetailPageModule)
  },
  {
    path: 'add-group-community',
    loadChildren: () => import('./community/pages/add-group-community/add-group-community.module').then( m => m.AddGroupCommunityPageModule)
  },
  {
    path: 'add-existing-groups',
    loadChildren: () => import('./community/pages/add-existing-groups/add-existing-groups.module').then( m => m.AddExistingGroupsPageModule)
  },
  {
    path: 'confirm-add-existing-groups',
    loadChildren: () => import('./community/pages/confirm-add-existing-groups/confirm-add-existing-groups.module').then( m => m.ConfirmAddExistingGroupsPageModule)
  },
  {
    path: 'create-new-group',
    loadChildren: () => import('./community/pages/create-new-group/create-new-group.module').then( m => m.CreateNewGroupPageModule)
  },
  {
    path: 'load-all-members',
    loadChildren: () => import('./community/pages/load-all-members/load-all-members.module').then( m => m.LoadAllMembersPageModule)
  },
  {
    path: 'community-info',
    loadChildren: () => import('./community/pages/community-info/community-info.module').then( m => m.CommunityInfoPageModule)
  },
  {
    path: 'community-chat',
    loadChildren: () => import('./community/pages/community-chat/community-chat.module').then( m => m.CommunityChatPageModule)
  },
  {
    path: 'account',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/settings/account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'privacy',
    loadChildren: () => import('./pages/settings/privacy/privacy.module').then( m => m.PrivacyPageModule)
  },
  {
    path: 'avatar',
    loadChildren: () => import('./pages/settings/avatar/avatar.module').then( m => m.AvatarPageModule)
  },
  {
    path: 'chats',
    loadChildren: () => import('./pages/settings/chats/chats.module').then( m => m.ChatsPageModule)
  },
  {
    path: 'accessibility',
    loadChildren: () => import('./pages/settings/accessibility/accessibility.module').then( m => m.AccessibilityPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./pages/settings/notification/notification.module').then( m => m.NotificationPageModule)
  },
  {
    path: 'storage-data',
    loadChildren: () => import('./pages/settings/storage-data/storage-data.module').then( m => m.StorageDataPageModule)
  },
  {
    path: 'app-language',
    loadChildren: () => import('./pages/settings/app-language/app-language.module').then( m => m.AppLanguagePageModule)
  },
  {
    path: 'help-feedback',
    loadChildren: () => import('./pages/settings/help-feedback/help-feedback.module').then( m => m.HelpFeedbackPageModule)
  },
  {
    path: 'app-updates',
    loadChildren: () => import('./pages/settings/app-updates/app-updates.module').then( m => m.AppUpdatesPageModule)
  },
  {
    path: 'invite-friend',
    loadChildren: () => import('./pages/settings/invite-friend/invite-friend.module').then( m => m.InviteFriendPageModule)
  },
  {
    path: 'email-edit',
    loadChildren: () => import('./pages/settings/email-edit/email-edit.module').then( m => m.EmailEditPageModule)
  },
  {
    path: 'message-info',
    loadChildren: () => import('./pages/message-info/message-info.module').then( m => m.MessageInfoPageModule)
  },
  {
    path: 'archieved-screen',
    loadChildren: () => import('./pages/archieved-screen/archieved-screen.module').then( m => m.ArchievedScreenPageModule)
  },





];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
