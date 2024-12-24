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
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}
  sendCommand(cmd: SatelliteCommand): Observable<any> {
    return this.http.post(`${this.baseUrl}/commands`, cmd);
  }

  getCommandStatus(commandId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/commands/${commandId}`);
  }
}
