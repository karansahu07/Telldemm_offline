import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ImageCropperModalComponent } from '../../components/image-cropper-modal/image-cropper-modal.component';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { CropResult } from 'src/types';

@Component({
  selector: 'app-setting-profile',
  templateUrl: './setting-profile.page.html',
  styleUrls: ['./setting-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class SettingProfilePage implements OnInit, OnDestroy {
  profileImageUrl = 'assets/images/user.jfif';
  isLoadingProfile = false;
  isUpdatingImage = false;
  
  user = {
    name: '',
    about: '',
    phone: ''
  };
  
  currentUserId: number | null = null;

  // Constants
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private service: ApiService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.initializeProfile();
  }

  async ionViewWillEnter(){
    await this.initializeProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize profile data
   */
  private async initializeProfile() {
    try {
      // Ensure auth is hydrated
      await this.authService.hydrateAuth();

      // Get current user ID
      const id = this.authService.authData?.userId;
      if (id) {
        this.currentUserId = Number(id);
      }
      
      // Set user data from auth
      if (this.authService.authData) {
        const auth = this.authService.authData;
        this.user = {
          name: auth.name || '',
          about: '.',
          phone: auth.phone_number || ''
        };
        
        // Load profile image
        await this.loadUserProfile();
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
      await this.showToast('Failed to load profile data', 'danger');
    }
  }

  goToUpdateName() {
  this.router.navigate(['/update-username']);
}

goToUpdateStatus() {
  this.router.navigate(['/update-status']);
}

  /**
   * Load user profile from API
   */
  async loadUserProfile() {
    const userId = this.authService.authData?.userId;
    
    if (!userId) {
      console.warn('No user ID found');
      return;
    }

    try {
      this.isLoadingProfile = true;
      
      // this.service.getUserProfilebyId(userId)
      //   .pipe(takeUntil(this.destroy$))
      //   .subscribe({
      //     next: (response: any) => {
      //       console.log('Profile response:', response);
            
      //       if (response?.profile || response?.image_url) {
      //         this.profileImageUrl = response.profile || response.image_url;
      //       }
            
      //       // Update user data if available
      //       if (response?.name) {
      //         this.user.name = response.name;
      //       }
            
      //       this.isLoadingProfile = false;
      //     },
      //     error: (error: any) => {
      //       console.error('Error loading profile:', error);
      //       this.isLoadingProfile = false;
      //       this.showToast('Failed to load profile image', 'danger');
      //     }
      //   });

      this.service.getUserProfilebyId(userId)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (response: any) => {
      console.log('Profile response:', response);

      // Profile image (dp)
      if (response?.profile || response?.image_url) {
        this.profileImageUrl = response.profile || response.image_url;
      }

      // Name
      if (response?.name) {
        this.user.name = response.name;
      }

      // dp-status
      if (response?.dp_status) {
        this.user.about = response.dp_status;
      }

      this.isLoadingProfile = false;
    },
    error: (error: any) => {
      console.error('Error loading profile:', error);
      this.isLoadingProfile = false;
      this.showToast('Failed to load profile image', 'danger');
    }
  });

        
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      this.isLoadingProfile = false;
    }
  }

  /**
   * Handle image error - fallback to default
   */
  onImageError() {
    this.profileImageUrl = 'assets/images/user.jfif';
  }

  /**
   * Show image source selection action sheet
   */
  async editProfileImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.selectImageFromSource(CameraSource.Camera);
          }
        },
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            this.selectImageFromSource(CameraSource.Photos);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Select image from camera or gallery
   */
  private async selectImageFromSource(source: CameraSource) {
    try {
      const loading = await this.loadingController.create({
        message: 'Opening camera...',
        duration: 5000
      });
      await loading.present();

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false, // We'll handle cropping ourselves
        resultType: CameraResultType.Uri,
        source: source,
        width: 1000,
        height: 1000
      });

      await loading.dismiss();

      if (image?.webPath) {
        await this.processSelectedImage(image.webPath);
      }

    } catch (error) {
      console.error('Error selecting image:', error);
      await this.showToast('Failed to select image. Please try again.', 'danger');
    }
  }

  /**
   * Process selected image and open cropper
   */
  private async processSelectedImage(imagePath: string) {
    try {
      // Show processing message
      const loading = await this.loadingController.create({
        message: 'Processing image...',
        duration: 10000
      });
      await loading.present();

      // Convert to blob first to validate
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      await loading.dismiss();

      // Validate file
      const validationError = this.validateImageBlob(blob);
      if (validationError) {
        await this.showToast(validationError, 'danger');
        return;
      }

      // Convert to data URL for cropper
      const dataUrl = await this.blobToDataURL(blob);
      
      // Open cropper modal
      await this.openImageCropper(dataUrl, blob);

    } catch (error) {
      console.error('Error processing image:', error);
      await this.showToast('Error processing image. Please try again.', 'danger');
    }
  }

  /**
   * Validate image blob
   */
  private validateImageBlob(blob: Blob): string | null {
    if (blob.size > this.MAX_FILE_SIZE) {
      return 'Image size should be less than 5MB';
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(blob.type)) {
      return 'Please select a valid image file (JPEG, PNG, WebP)';
    }

    return null;
  }

  /**
   * Convert blob to data URL
   */
  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Open image cropper modal
   */
  private async openImageCropper(imageUrl: string, originalBlob: Blob) {
    const modal = await this.modalController.create({
      component: ImageCropperModalComponent,
      componentProps: {
        imageUrl: imageUrl,
        aspectRatio: 1, // Square crop for profile picture
        cropQuality: 0.9
      },
      cssClass: 'image-cropper-modal',
      backdropDismiss: false
    });

    await modal.present();

    const { data } = await modal.onDidDismiss<CropResult>();
    
    if (data?.success && data.croppedImage && data.originalBlob) {
      // Update profile image with cropped version
      await this.updateProfileImage(data.originalBlob, data.croppedImage);
    } else if (data?.error) {
      await this.showToast(data.error, 'danger');
    }
    // If cancelled, do nothing
  }

  /**
   * Update profile image on server
   */
  private async updateProfileImage(croppedBlob: Blob, croppedImageUrl: string) {
    if (!this.currentUserId) {
      await this.showToast('User ID not found', 'danger');
      return;
    }

    try {
      this.isUpdatingImage = true;

      // Show loading
      const loading = await this.loadingController.create({
        message: 'Updating profile picture...',
        backdropDismiss: false
      });
      await loading.present();

      // Create file from blob
      const file = new File([croppedBlob], `profile_${Date.now()}.jpg`, { 
        type: croppedBlob.type 
      });

      // Update on server
      this.service.updateUserDp(this.currentUserId, file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (response) => {
            console.log('Profile updated successfully:', response);
            
            // Update local image immediately
            this.profileImageUrl = croppedImageUrl;
            
            await loading.dismiss();
            await this.showToast('Profile picture updated successfully!', 'success');
            this.isUpdatingImage = false;
          },
          error: async (error) => {
            console.error('Error updating profile picture:', error);
            await loading.dismiss();
            await this.showToast('Failed to update profile picture', 'danger');
            this.isUpdatingImage = false;
          }
        });

    } catch (error) {
      console.error('Error in updateProfileImage:', error);
      await this.showToast('Failed to update profile picture', 'danger');
      this.isUpdatingImage = false;
    }
  }

  /**
   * Show toast notification
   */
  private async showToast(message: string, color: 'danger' | 'success' | 'dark' = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Add links functionality (placeholder)
   */
  addLinks() {
    console.log('Add links clicked');
    // Implement your add links functionality here
  }

  /**
   * Get display image URL with loading state
   */
  get displayImageUrl(): string {
    if (this.isLoadingProfile || this.isUpdatingImage) {
      return 'assets/images/user.jfif'; // Show default while loading
    }
    return this.profileImageUrl;
  }

  /**
   * Check if image is loading
   */
  get isImageLoading(): boolean {
    return this.isLoadingProfile || this.isUpdatingImage;
  }
}