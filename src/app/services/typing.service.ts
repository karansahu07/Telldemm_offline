import { Injectable } from '@angular/core';
import {
  getDatabase,
  ref,
  update,
  remove,
  onValue,
  onDisconnect,
  DatabaseReference,
  Unsubscribe
} from 'firebase/database';
import { TypingEntry } from 'src/types';


@Injectable({ providedIn: 'root' })
export class TypingService {
  private db = getDatabase();

  // Start typing: create/update node with timestamp
  async startTyping(roomId: string, userId: string): Promise<void> {
    const r = ref(this.db, `typing/${roomId}/${userId}`);
    // update keeps node idempotent
    await update(r, { typing: true, lastUpdated: Date.now() });
    // Ensure onDisconnect removal if possible
    try {
      onDisconnect(r).remove();
    } catch (e) {
      // ignore if environment doesn't support onDisconnect
      // (most web/capacitor support it if firebase initialized)
      console.warn('onDisconnect not available', e);
    }
  }

  // Stop typing: remove node
  async stopTyping(roomId: string, userId: string): Promise<void> {
    const r = ref(this.db, `typing/${roomId}/${userId}`);
    await remove(r);
  }

  // Listen typing entries for a room. callback called with array of entries.
  // Returns unsubscribe function to stop listening.
  listenTyping(roomId: string, callback: (entries: TypingEntry[]) => void): Unsubscribe {
    const r = ref(this.db, `typing/${roomId}`);
    const unsubscribe = onValue(r, (snap) => {
      const val = snap.val() || {};
      const entries: TypingEntry[] = Object.keys(val).map(k => ({
        userId: k,
        typing: val[k]?.typing ?? false,
        lastUpdated: val[k]?.lastUpdated ?? 0
      }));
      callback(entries);
    });
    return unsubscribe;
  }

  // Return DB ref for manual onDisconnect if caller wants it
  getRef(roomId: string, userId: string): DatabaseReference {
    return ref(this.db, `typing/${roomId}/${userId}`);
  }
}
