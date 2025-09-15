export interface Message {
  sender_id: string;
  key?: any;
  text: string | null;
  timestamp: string;
  sender_phone: string;
  sender_name: string;
  receiver_id: string;
  receiver_phone: string;
  receiver_name?: string;
  delivered: boolean;
  read: boolean;
  isDeleted?: boolean;
  message_id: string;
  isEdit?: boolean;
  time?: string;
  type?: string;
  isForwarded?: boolean;
  attachment?: {
    type: 'image' | 'video' | 'audio' | 'file';
    fileName?: string;           
    mimeType?: string;           
    base64Data?: string;         
    mediaId?: string;            
    fileSize?: number;           
    filePath?: string;           
    caption?: string;  
    previewUrl?: string | null;       
  };
  replyToMessageId?: string | undefined;    
  reactions?: {
    [userId: string]: string;     
  }
}



export interface PinnedMessage {
    roomId: string;
    key: string;            // Chat room ID (1-to-1, group, community)
    messageId?: string;     // ID of the pinned message
    pinnedBy: string;       // User who pinned the message
    pinnedAt: number;       // Timestamp when the message was pinned
    scope: 'global';        // Always global
}

export interface PinnedMessagesCollection {
    [key: string]: PinnedMessage;
}
export interface PinnedMessageWithContent extends PinnedMessage {
    messageContent?: Message; // Assuming you have a ChatMessage interface
}


export interface Contact {
  userId: number;
  name: string;
  profile: string | null;
  // phone?: string;
  // lastMessage?: string | null;
}

export interface CropResult {
  success: boolean;
  croppedImage?: string;
  originalBlob?: Blob;
  cropArea?: any;
  error?: string;
  cancelled?: boolean;
}

export interface TypingEntry {
  userId: string;
  typing?: boolean;
  lastUpdated?: number;
}

export interface SocialMediaEntry {
  user_social_id: number;
  profile_url: string;
  platform: string;
}

export interface GetSocialMediaResponse {
  success: boolean;
  data: SocialMediaEntry[];
}