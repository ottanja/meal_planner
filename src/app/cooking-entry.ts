import { Timestamp } from "@firebase/firestore";
import { Note } from "./note";

export interface CookingEntry {
     dateKey: string;      // 'yyyy-MM-dd', also the document id
      dish: string;
      time: string;         // 'HH:mm'
      cook: string;         // display name of the cook
      cookUid: string;      // Firebase user id of the cook (used by the security rules)
      joiners: string[];    // display names
      notes: Note[];
      expireAt: Timestamp;   // Firestore deletes the document after this time
}
