import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  CalendarEvent,
  CalendarMonthViewComponent,
  DateAdapter,
  provideCalendar,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@Component({
  selector: 'app-callender',
  standalone: true,
  imports: [DatePipe, CalendarMonthViewComponent],
  providers: [
    provideCalendar({ provide: DateAdapter, useFactory: adapterFactory }),
  ],
  templateUrl: './callender.html',
  styleUrl: './callender.css',
})
export class Callender {
  viewDate = new Date();
  events: CalendarEvent[] = [
  { start: new Date(), title: 'Today: Pasta' },
  { start: new Date(2026, 10, 12), title: 'Lunch: Salad' },   // month is 0-based: 10 = November
  { start: new Date(2026, 10, 12), title: 'Dinner: Curry' },
];

  dayClicked({ day }: { day: { date: Date } }): void {
    console.log('Clicked on date:', day.date);
  }
}

