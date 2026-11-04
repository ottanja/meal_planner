import { Component, computed, signal } from '@angular/core';
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

interface Note { author: string; text: string; }

interface CookingEntry {
  dateKey: string;      // 'yyyy-MM-dd'
  dish: string;
  time: string;         // 'HH:mm'
  cook: string;
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
  viewDate = new Date();

  // state
  entries = signal<CookingEntry[]>([]);
  selectedDate = signal<Date | null>(null);
  confirmingJoin = signal(false);
  editing = signal(false);
  confirmingDelete = signal(false);
  editDish = '';
  editTime = '';

  // form fields
  userName = '';
  dish = '';
  time = '';
  noteText = '';

  // derived state
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

  // actions
  dayClicked({ day }: { day: { date: Date } }): void {
    this.selectedDate.set(day.date);
    this.confirmingJoin.set(false);
    this.confirmingDelete.set(false);
    this.editing.set(false);
    this.noteText = '';
  }

  signUp(): void {
    const key = this.selectedKey();
    if (!key || !this.userName.trim() || !this.dish.trim()) return;
    this.entries.update(list => [
      ...list,
      {
        dateKey: key,
        dish: this.dish.trim(),
        time: this.time,
        cook: this.userName.trim(),
        joiners: [],
        notes: [],
      },
    ]);
    this.dish = '';
  }

  canJoin(entry: CookingEntry): boolean {
    const name = this.userName.trim();
    return !!name && entry.cook !== name && !entry.joiners.includes(name);
  }

  confirmJoin(): void {
    const name = this.userName.trim();
    this.updateSelected(e => ({ ...e, joiners: [...e.joiners, name] }));
    this.confirmingJoin.set(false);
  }

  addNote(): void {
    const name = this.userName.trim();
    const text = this.noteText.trim();
    if (!name || !text) return;
    this.updateSelected(e => ({ ...e, notes: [...e.notes, { author: name, text }] }));
    this.noteText = '';
  }

  private updateSelected(fn: (e: CookingEntry) => CookingEntry): void {
    const key = this.selectedKey();
    this.entries.update(list => list.map(e => (e.dateKey === key ? fn(e) : e)));
  }

  isCook(entry: CookingEntry): boolean {
  const name = this.userName.trim();
  return !!name && entry.cook === name;
}

startEdit(entry: CookingEntry): void {
  this.editDish = entry.dish;
  this.editTime = entry.time;
  this.confirmingDelete.set(false);
  this.editing.set(true);
}

saveEdit(): void {
  if (!this.editDish.trim() || !this.editTime) return;
  this.updateSelected(e => ({
    ...e,
    dish: this.editDish.trim(),
    time: this.editTime,
  }));
  this.editing.set(false);
}

cancelEdit(): void {
  this.editing.set(false);
}

deleteEntry(): void {
  const key = this.selectedKey();
  this.entries.update(list => list.filter(e => e.dateKey !== key));
  this.confirmingDelete.set(false);
  this.editing.set(false);
}
}