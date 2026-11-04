import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { getAnalytics } from "firebase/analytics";
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

export const firebaseConfig = {
    apiKey: "AIzaSyAmZFl-RrFQqOjsZmaxuPbkjj-4pwA5skA",
    authDomain: "shared-meal-planner-b9275.firebaseapp.com",
    projectId: "shared-meal-planner-b9275",
    storageBucket: "shared-meal-planner-b9275.firebasestorage.app",
    messagingSenderId: "887958536021",
    appId: "1:887958536021:web:cf794b0fa2f09c46fbb9dc",
    measurementId: "G-MPWSHLQ0RP"
  };

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ]
};
