// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class SqliteService {
  
// }// import { Injectable } from '@angular/core';
// import {
//   CapacitorSQLite,
//   SQLiteDBConnection,
// } from '@capacitor-community/sqlite';

// @Injectable({
//   providedIn: 'root', 
// })
// export class AttachmentService {
//   pickAndSaveFile(chatId: string) {
//     throw new Error('Method not implemented.');
//   }
//   private sqlite = CapacitorSQLite;
//   private db!: SQLiteDBConnection;  //this is for attachment local db

//   async init() {
//     const dbName = 'chatDB';
//     const res = await this.sqlite.createConnection({
//       database: dbName,
//       version: 1,
//       encrypted: false,
//       mode: 'no-encryption',
//     });
//     this.db = res;

//     await this.db.open();
//     await this.db.execute(`
//       CREATE TABLE IF NOT EXISTS attachments (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         chatId TEXT,
//         type TEXT,
//         filePath TEXT,
//         createdAt TEXT
//       );
//     `);
//   }

//   async saveAttachment(chatId: string, type: string, filePath: string) {
//     const createdAt = new Date().toISOString();
//     const sql = `INSERT INTO attachments (chatId, type, filePath, createdAt) VALUES (?, ?, ?, ?);`;
//     const values = [chatId, type, filePath, createdAt];
//     await this.db.run(sql, values);
//   }

//   async getAttachments(chatId: string) {
//     const stmt = `SELECT * FROM attachments WHERE chatId = ? ORDER BY createdAt ASC`;
//     const result = await this.db.query(stmt, [chatId]);
//     return result.values || [];
//   }
// }




// import { Injectable } from '@angular/core';
// import {
//   CapacitorSQLite,
//   SQLiteDBConnection,
// } from '@capacitor-community/sqlite';

// @Injectable({
//   providedIn: 'root',
// })
// export class AttachmentService {
//   private sqlite = CapacitorSQLite;
//   private db!: SQLiteDBConnection;

//   async init() {
//     const dbName = 'chatDB';
//     const res = await this.sqlite.createConnection({
//       database: dbName,
//       version: 1,
//       encrypted: false,
//       mode: 'no-encryption',
//     });

//     this.db = res;
//     await this.db.open();

//     await this.db.execute(`
//       CREATE TABLE IF NOT EXISTS attachments (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         roomId TEXT,
//         type TEXT,
//         filePath TEXT,
//         createdAt TEXT
//       );
//     `);
//   }

//   async saveAttachment(roomId: string, type: string, filePath: string) {
//     const createdAt = new Date().toISOString();
//     const sql = `
//       INSERT INTO attachments (roomId, type, filePath, createdAt)
//       VALUES (?, ?, ?, ?);
//     `;
//     const values = [roomId, type, filePath, createdAt];
//     await this.db.run(sql, values);
//   }

//   async getAttachments(roomId: string) {
//     const stmt = `SELECT * FROM attachments WHERE roomId = ? ORDER BY createdAt ASC`;
//     const result = await this.db.query(stmt, [roomId]);
//     return result.values || [];
//   }
// }



// import { Injectable } from '@angular/core';
// import {
//   CapacitorSQLite,
//   SQLiteConnection,
//   SQLiteDBConnection,
// } from '@capacitor-community/sqlite';

// @Injectable({
//   providedIn: 'root',
// })
// export class AttachmentService {
//   private sqliteConnection: SQLiteConnection;
//   private db!: SQLiteDBConnection;
//   private readonly dbName = 'chatDB';

//   constructor() {
//     this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
//   }

//   /**
//    * Initialize SQLite DB and create attachments table if not exists
//    */
//   async init(): Promise<void> {
//     try {
//       // Create connection
//       const db = await this.sqliteConnection.createConnection(
      
//         this.dbName,       // database
//         false,             // encrypted
//         'no-encryption',   // mode
//         1,                 // version
//         false              // readonly
//       );

//       this.db = db;
//       await this.db.open();

//       // Create attachments table if it doesn't exist
//       await this.db.execute(`
//         CREATE TABLE IF NOT EXISTS attachments (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           roomId TEXT,
//           type TEXT,
//           filePath TEXT,
//           createdAt TEXT
//         );
//       `);
//       console.log("DB connected")
//     } catch (error) {
//       console.error('SQLite init error:', error);
//     }
//   }

//   /**
//    * Save a new attachment to the database
//    */
//   async saveAttachment(roomId: string, type: string, filePath: string): Promise<void> {
//     try {
//       const createdAt = new Date().toISOString();
//       const sql = `
//         INSERT INTO attachments (roomId, type, filePath, createdAt)
//         VALUES (?, ?, ?, ?);
//       `;
//       const values = [roomId, type, filePath, createdAt];
//       await this.db.run(sql, values);
//     } catch (error) {
//       console.error('Error saving attachment:', error);
//     }
//   }

//   /**
//    * Retrieve attachments for a specific room
//    */
//   async getAttachments(roomId: string): Promise<any[]> {
//     try {
//       const stmt = `SELECT * FROM attachments WHERE roomId = ? ORDER BY createdAt ASC`;
//       const result = await this.db.query(stmt, [roomId]);
//       return result.values || [];
//     } catch (error) {
//       console.error('Error retrieving attachments:', error);
//       return [];
//     }
//   }

//   /**
//    * Close the database connection
//    */
//   async closeConnection(): Promise<void> {
//   try {
//     await this.sqliteConnection.closeConnection(this.dbName, false);
//   } catch (error) {
//     console.error('Error closing DB connection:', error);
//   }                                                                                   
// }
                         
// }




import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private sqliteConnection: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private readonly dbName = 'chatDB';

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);

    // ✅ For web platform, define the jeep-sqlite element
    if (Capacitor.getPlatform() === 'web') {
      defineCustomElements(window);
    }
  }

  /**
   * Initialize SQLite DB and create attachments table if not exists
   */
  // async init(): Promise<void> {
  //   try {
  //     if (Capacitor.getPlatform() === 'web') {
  //       await this.sqliteConnection.initWebStore();
  //     }

  //     // Close existing connection if open (handle re-init gracefully)
  //     const isConn = (await this.sqliteConnection.isConnection(this.dbName, false)).result;
  //     if (isConn) {
  //       await this.sqliteConnection.closeConnection(this.dbName, false);
  //     }

  //     // Create a new DB connection
  //     this.db = await this.sqliteConnection.createConnection(
  //       this.dbName,
  //       false,
  //       'no-encryption',
  //       1,
  //       false
  //     );

  //     await this.db.open();

  //     // Create attachments table
  //     await this.db.execute(`
  //       CREATE TABLE IF NOT EXISTS attachments (
  //         id INTEGER PRIMARY KEY AUTOINCREMENT,
  //         roomId TEXT,
  //         type TEXT,
  //         filePath TEXT,
  //         createdAt TEXT
  //       );
  //     `);

  //     console.log('✅ SQLite DB initialized');
  //   } catch (error) {
  //     console.error('❌ SQLite init error:', error);
  //   }
  // }

  async init(): Promise<void> {
  try {
    // ✅ 1. Request file picker permissions before DB usage
    // const permissionStatus = await FilePicker.checkPermissions();
    const permissionStatus = await FilePicker.checkPermissions() as unknown as { publicStorage: 'granted' | 'denied' | 'prompt' };

    if (permissionStatus.publicStorage !== 'granted') {
  const requestStatus = await FilePicker.requestPermissions() as unknown as { publicStorage: 'granted' | 'denied' | 'prompt' };
  if (requestStatus.publicStorage !== 'granted') {
    console.warn('FilePicker permission not granted');
  }
}


    // ✅ 2. Web store init if platform is web
    if (Capacitor.getPlatform() === 'web') {
      await this.sqliteConnection.initWebStore();
    }

    // ✅ 3. Close existing connection if open
    const isConn = (await this.sqliteConnection.isConnection(this.dbName, false)).result;
    if (isConn) {
      await this.sqliteConnection.closeConnection(this.dbName, false);
    }

    // ✅ 4. Create new DB connection
    this.db = await this.sqliteConnection.createConnection(
      this.dbName,
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();

    // ✅ 5. Create table if not exists
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roomId TEXT,
        type TEXT,
        filePath TEXT,
        createdAt TEXT
      );
    `);

    console.log('✅ SQLite DB initialized');
  } catch (error) {
    console.error('❌ SQLite init error:', error);
  }
}

  /**
   * Save a new attachment to the database
   */
  async saveAttachment(roomId: string, type: string, filePath: string): Promise<void> {
    try {
      const createdAt = new Date().toISOString();
      const sql = `
        INSERT INTO attachments (roomId, type, filePath, createdAt)
        VALUES (?, ?, ?, ?);
      `;
      const values = [roomId, type, filePath, createdAt];
      await this.db.run(sql, values);
    } catch (error) {
      console.error('❌ Error saving attachment:', error);
    }
  }

  /**
   * Retrieve attachments for a specific room
   */
  async getAttachments(roomId: string): Promise<any[]> {
    try {
      const stmt = `SELECT * FROM attachments WHERE roomId = ? ORDER BY createdAt ASC`;
      const result = await this.db.query(stmt, [roomId]);
      return result.values || [];
    } catch (error) {
      console.error('❌ Error retrieving attachments:', error);
      return [];
    }
  }

  /**
   * Close the database connection
   */
  async closeConnection(): Promise<void> {
    try {
      await this.sqliteConnection.closeConnection(this.dbName, false);
    } catch (error) {
      console.error('❌ Error closing DB connection:', error);
    }
  }
}
