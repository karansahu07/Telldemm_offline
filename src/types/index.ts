// export interface Message {
//     sender_id: string;
//     key?: any;
//     text: string | null;
//     timestamp: string;
//     sender_phone: string;
//     sender_name: string;
//     receiver_id: string;
//     receiver_phone: string;
//     delivered: boolean;
//     read: boolean;
//     isDeleted?: boolean;
//     message_id: string;
//     time?: string;
//     type?: string;
//     isForwarded?: boolean;
//     attachment?: {
//         type: 'image' | 'video' | 'audio' | 'file';
//         fileName?: string;           // Optional, used for downloads
//         mimeType?: string;           // Helps identify the type
//         base64Data: string;          // Full data URI, e.g., data:image/png;base64,...
//         filePath?: string;           // Optional original file path or local cache
//         caption?: string;            // Optional caption text for images/videos
//     };

//     replyToMessageId?: string | undefined;    //for reply
//     reactions?: {
//         [userId: string]: string;     //for reactions
//     }
// }

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
