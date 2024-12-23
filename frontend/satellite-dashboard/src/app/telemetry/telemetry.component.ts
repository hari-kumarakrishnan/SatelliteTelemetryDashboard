// src/app/telemetry/telemetry.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TelemetryService } from '../services/telemetry.service';

@Component({
  standalone: true,
  selector: 'app-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.css'],
  imports: [
    CommonModule
  ]
})
export class TelemetryComponent implements OnInit, OnDestroy {
  telemetryData: any[] = [];
  subscription!: Subscription;

  constructor(private telemetryService: TelemetryService) {}

  ngOnInit(): void {
    // Start polling the telemetry endpoint
    this.subscription = this.telemetryService.getTelemetry().subscribe(data => {
      this.telemetryData = data;
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription to avoid memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
