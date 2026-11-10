import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup, user } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private auth = inject(Auth);
  private router = inject(Router);

  user = toSignal(user(this.auth), { initialValue: null });

  constructor() {
    // as soon as someone is signed in (now or already), go to the calendar
    effect(() => {
      if (this.user()) {
        this.router.navigate(['/calendar']);
      }
    });
  }

  async login(): Promise<void> {
    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider());
    } catch (err) {
      console.error('Login failed', err);
    }
  }
}