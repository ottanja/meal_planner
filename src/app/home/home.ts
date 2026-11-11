import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  user,
} from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private auth = inject(Auth);
  private router = inject(Router);

  user = toSignal(user(this.auth), { initialValue: null });

  mode = signal<'login' | 'register'>('login');
  busy = signal(false);
  error = signal('');

  email = '';
  password = '';
  displayName = '';

  constructor() {
    // go to the calendar once signed in, but not while a sign-up is still
    // saving the display name
    effect(() => {
      if (this.user() && !this.busy()) {
        this.router.navigate(['/calendar']);
      }
    });
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set('');
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.busy.set(true);
    try {
      if (this.mode() === 'register') {
        const cred = await createUserWithEmailAndPassword(
          this.auth,
          this.email.trim(),
          this.password
        );
        await updateProfile(cred.user, { displayName: this.displayName.trim() });
      } else {
        await signInWithEmailAndPassword(this.auth, this.email.trim(), this.password);
      }
    } catch (err) {
      this.error.set(this.message(err));
    } finally {
      this.busy.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.error.set('');
    this.busy.set(true);
    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider());
    } catch (err) {
      this.error.set(this.message(err));
    } finally {
      this.busy.set(false);
    }
  }

  private message(err: unknown): string {
    const code = err instanceof FirebaseError ? err.code : '';
    switch (code) {
      case 'auth/invalid-email':
        return 'That email address is not valid.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Wrong email or password.';
      case 'auth/email-already-in-use':
        return 'There is already an account with this email. Try signing in.';
      case 'auth/weak-password':
        return 'The password must be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return '';
      default:
        console.error(err);
        return 'Something went wrong. Please try again.';
    }
  }
}