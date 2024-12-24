import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'telemetry', pathMatch: 'full' },
  { path: 'telemetry', loadComponent: () => import('./telemetry/telemetry.component').then(m => m.TelemetryComponent) },
  { path: 'command', loadComponent: () => import('./command/command.component').then(m => m.CommandComponent) },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
  ]
};
