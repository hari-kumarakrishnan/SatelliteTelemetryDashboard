// src/app/websocket.service.ts

import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private socket!: WebSocket; // Definite assignment assertion
  private subject: Subject<any> = new Subject<any>(); // Initialized at declaration

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    this.socket = new WebSocket('ws://localhost:8000/ws/satellite_positions');

    this.socket.onopen = (event) => {
      console.log('WebSocket connection opened');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.subject.next(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.subject.error(event);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.reason);
      this.subject.complete();
      // Optionally, implement reconnection logic here
    };
  }

  public connectToWebSocket(): Observable<any> { // Renamed for clarity
    return this.subject.asObservable();
  }

  public sendMessage(message: any): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open. Ready state:', this.socket.readyState);
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
    if (this.subject) {
      this.subject.complete();
    }
  }
}
