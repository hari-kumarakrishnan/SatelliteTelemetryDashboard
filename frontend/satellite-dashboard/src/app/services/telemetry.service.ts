import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
    constructor(private http: HttpClient) {}

  /**
   * Poll the Telemetry endpoint every 3 seconds
   */
    getTelemetry() {
        return interval(3000).pipe(
            switchMap(() => this.http.get<any[]>('http://localhost:8000/telemetry'))
        );
    }
}
