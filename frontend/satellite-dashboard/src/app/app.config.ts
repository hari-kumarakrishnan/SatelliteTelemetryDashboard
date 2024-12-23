// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

// Example routes: link them to your Telemetry and Command components
const routes: Routes = [
  { path: '', redirectTo: 'telemetry', pathMatch: 'full' },
  { path: 'telemetry', loadComponent: () => import('./telemetry/telemetry.component').then(m => m.TelemetryComponent) },
  { path: 'command', loadComponent: () => import('./command/command.component').then(m => m.CommandComponent) },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // provideHttpClient(), etc. if you need them
  ]
};
