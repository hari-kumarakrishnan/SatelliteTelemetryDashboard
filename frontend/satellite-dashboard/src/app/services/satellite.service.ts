// src/app/services/satellite.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SatellitePosition } from '../models/satellite-position.model';

@Injectable({
  providedIn: 'root'
})
export class SatelliteService {
  private apiUrl = 'http://localhost:8000';  // FastAPI backend URL

  constructor(private http: HttpClient) {}

  /**
   * Fetches satellites based on filters, page, and page size.
   * @param filters The filter criteria.
   * @param page The current page number.
   * @param pageSize The number of satellites per page.
   */
  getSatellites(filters: any = {}, page: number = 1, pageSize: number = 100): Observable<SatellitePosition[]> {
    let params = new HttpParams();

    // Apply filter parameters
    if (filters.name) {
      params = params.set('name', filters.name);
    }
    if (filters.norad_id) {
      params = params.set('norad_id', filters.norad_id.toString());
    }
    if (filters.type) {
      params = params.set('type', filters.type);
    }
    if (filters.mission) {
      params = params.set('mission', filters.mission);
    }
    if (filters.min_altitude !== undefined) {
      params = params.set('min_altitude', filters.min_altitude.toString());
    }
    if (filters.max_altitude !== undefined) {
      params = params.set('max_altitude', filters.max_altitude.toString());
    }

    // Pagination parameters
    params = params.set('page', page.toString());
    params = params.set('page_size', pageSize.toString());

    return this.http.get<SatellitePosition[]>(`${this.apiUrl}/satellites`, { params });
  }
}
