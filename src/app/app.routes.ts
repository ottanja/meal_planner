import { Routes } from '@angular/router';
import { Callender } from './callender/callender';
import { Home } from './home/home';
import { authGuard } from './auth-guard-guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'calendar', component: Callender, canActivate: [authGuard] },
    { path: '**', redirectTo: '' },
];
