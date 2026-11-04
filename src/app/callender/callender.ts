import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CalendarEvent,
  CalendarMonthViewComponent,
  DateAdapter,
  provideCalendar,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { format } from 'date-fns';
import { Observable, of, switchMap } from 'rxjs';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from '@angular/fire/firestore';

interface Note { author: string; text: string; }

interface CookingEntry {
  dateKey: string;      // 'yyyy-MM-dd', also used as the document id
  dish: string;
  time: string;         // 'HH:mm'
  cook: string;         // display name of the cook
  cookUid: string;      // Firebase auth uid, required by the security rules
  joiners: string[];
  notes: Note[];
}

@Component({
  selector: 'app-callender',
  imports: [DatePipe, FormsModule, CalendarMonthViewComponent],
  providers: [
    provideCalendar({ provide: DateAdapter, useFactory: adapterFactory }),
  ],
  templateUrl: './callender.html',
  styleUrl: './callender.css',
})
export class Callender {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private cookings = collection(this.firestore, 'cookings');

  viewDate = new Date();

  // auth state: null while signed out
  currentUser = toSignal(user(this.auth), { initialValue: null });

  // live data: only subscribes to Firestore while someone is signed in,
  // because the rules deny reads for unauthenticated users
  entries = toSignal(
    user(this.auth).pipe(
      switchMap(u =>
        u
          ? (collectionData(this.cookings) as Observable<CookingEntry[]>)
          : of([] as CookingEntry[])
      )
    ),
    { initialValue: [] as CookingEntry[] }
  );

  // UI state
  selectedDate = signal<Date | null>(null);
  confirmingJoin = signal(false);
  confirmingDelete = signal(false);
  editing = signal(false);

  // form fields
  dish = '';
  time = '00:00';
  noteText = '';
  editDish = '';
  editTime = '';

  // derived state
  userName = computed(() => {
    const u = this.currentUser();
    return (u?.displayName ?? u?.email ?? '').trim();
  });

  selectedKey = computed(() => {
    const d = this.selectedDate();
    return d ? format(d, 'yyyy-MM-dd') : null;
  });

  selectedEntry = computed(() =>
    this.entries().find(e => e.dateKey === this.selectedKey()) ?? null
  );

  events = computed<CalendarEvent[]>(() =>
    this.entries().map(e => ({
      start: new Date(e.dateKey + 'T' + e.time),
      title: `${e.time} ${e.dish} (${e.cook})`,
    }))
  );

  // auth actions
  async login(): Promise<void> {
    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider());
    } catch (err) {
      console.error('Login failed', err);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.selectedDate.set(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  // helpers
  private entryRef(key: string) {
    return doc(this.firestore, 'cookings', key);
  }

  isCook(entry: CookingEntry): boolean {
    const uid = this.currentUser()?.uid;
    return !!uid && entry.cookUid === uid;
  }

  canJoin(entry: CookingEntry): boolean {
    const name = this.userName();
    return !!name && !this.isCook(entry) && !entry.joiners.includes(name);
  }

  // actions
  dayClicked({ day }: { day: { date: Date } }): void {
    this.selectedDate.set(day.date);
    this.confirmingJoin.set(false);
    this.confirmingDelete.set(false);
    this.editing.set(false);
    this.noteText = '';
  }

  async signUp(): Promise<void> {
    const key = this.selectedKey();
    const u = this.currentUser();
    if (!key || !u || !this.dish.trim()) return;
    const entry: CookingEntry = {
      dateKey: key,
      dish: this.dish.trim(),
      time: this.time,
      cook: this.userName(),
      cookUid: u.uid, // must equal request.auth.uid
      joiners: [],
      notes: [],
    };
    try {
      await setDoc(this.entryRef(key), entry);
      this.dish = '';
    } catch (err) {
      console.error('Sign up failed', err);
    }
  }

  startEdit(entry: CookingEntry): void {
    this.editDish = entry.dish;
    this.editTime = entry.time;
    this.confirmingDelete.set(false);
    this.editing.set(true);
  }

  async saveEdit(): Promise<void> {
    const key = this.selectedKey();
    if (!key || !this.editDish.trim() || !this.editTime) return;
    try {
      await updateDoc(this.entryRef(key), {
        dish: this.editDish.trim(),
        time: this.editTime,
      });
      this.editing.set(false);
    } catch (err) {
      console.error('Edit failed', err);
    }
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  async deleteEntry(): Promise<void> {
    const key = this.selectedKey();
    if (!key) return;
    try {
      await deleteDoc(this.entryRef(key));
      this.confirmingDelete.set(false);
      this.editing.set(false);
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  async confirmJoin(): Promise<void> {
    const key = this.selectedKey();
    const name = this.userName();
    if (!key || !name) return;
    try {
      await updateDoc(this.entryRef(key), { joiners: arrayUnion(name) });
      this.confirmingJoin.set(false);
    } catch (err) {
      console.error('Join failed', err);
    }
  }

  async addNote(): Promise<void> {
    const key = this.selectedKey();
    const name = this.userName();
    const text = this.noteText.trim();
    if (!key || !name || !text) return;
    try {
      await updateDoc(this.entryRef(key), {
        notes: arrayUnion({ author: name, text }),
      });
      this.noteText = '';
    } catch (err) {
      console.error('Adding note failed', err);
    }
  }
}

