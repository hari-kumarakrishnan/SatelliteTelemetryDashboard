import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SatellitePosition, OrbitPoint } from '../models/satellite-position.model';  

@Injectable({
  providedIn: 'root'
})
export class SatelliteService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getSatellites(
    filters: any = {},
    page: number = 1,
    pageSize: number = 25
  ): Observable<SatellitePosition[]> {
    let params = new HttpParams();
    return this.http.get<SatellitePosition[]>(`${this.apiUrl}/satellites`, { params });
  }

  getSatelliteOrbit(
    norad_id: number,
    hours_ahead: number = 2,
    step_minutes: number = 10
  ): Observable<OrbitPoint[]> {
    let params = new HttpParams()
      .set('norad_id', norad_id.toString())
      .set('hours_ahead', hours_ahead.toString())
      .set('step_minutes', step_minutes.toString());

    return this.http.get<OrbitPoint[]>(`${this.apiUrl}/satellite_orbits`, { params });
  }
}
