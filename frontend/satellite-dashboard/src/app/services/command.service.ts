// src/app/services/command.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SatelliteCommand {
  satellite_id: number;
  command_name: string;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  // Update baseUrl to the combined app's port
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * Send a command to the backend (POST /commands).
   * @param cmd A SatelliteCommand object to send
   * @returns An Observable of the response
   */
  sendCommand(cmd: SatelliteCommand): Observable<any> {
    return this.http.post(`${this.baseUrl}/commands`, cmd);
  }

  /**
   * Get the status of a previously sent command (GET /commands/{command_id}).
   * @param commandId The unique command ID returned by the backend
   * @returns An Observable of the response
   */
  getCommandStatus(commandId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/commands/${commandId}`);
  }
}
