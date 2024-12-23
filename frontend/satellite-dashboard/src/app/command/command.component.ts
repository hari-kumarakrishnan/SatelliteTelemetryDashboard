// src/app/command/command.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandService } from '../services/command.service';

@Component({
  selector: 'app-satellite-search',
  templateUrl: './satellite-search.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CommandComponent {
  // Form fields
  satelliteId: number | null = null;
  commandName: string = '';
  commandPayload: string = '';
  
  // Status variables
  commandStatus: string = '';
  commandId: string = '';

  constructor(private commandService: CommandService) {}

  /**
   * Send a command to the backend.
   */
  sendCommand(): void {
    if (!this.satelliteId || !this.commandName) {
      this.commandStatus = 'Please fill out Satellite ID and Command Name.';
      return;
    }

    // Attempt to parse JSON in the command payload
    let payloadObject: any = {};
    try {
      payloadObject = this.commandPayload ? JSON.parse(this.commandPayload) : {};
    } catch (error) {
      this.commandStatus = 'Invalid JSON in payload.';
      return;
    }

    // Construct the command object for the backend
    const cmd = {
      satellite_id: this.satelliteId,
      command_name: this.commandName,
      payload: payloadObject
    };

    // Call the command service
    this.commandService.sendCommand(cmd).subscribe({
      next: (response: any) => {
        // Example response might include { command_id: '...' }
        this.commandId = response.command_id;
        this.commandStatus = `Command sent (ID: ${this.commandId}). Waiting for ACK...`;
      },
      error: (err: any) => {
        console.error(err);
        this.commandStatus = 'Error sending command.';
      }
    });
  }

  /**
   * Check the status of the previously sent command.
   */
  checkCommandStatus(): void {
    if (!this.commandId) {
      this.commandStatus = 'No command ID to check.';
      return;
    }

    this.commandService.getCommandStatus(this.commandId).subscribe({
      next: (response: any) => {
        // Example response might be { command_id: '...', status: 'ACKNOWLEDGED' }
        this.commandStatus = `Command ID: ${response.command_id} - Status: ${response.status}`;
      },
      error: (err: any) => {
        console.error(err);
        this.commandStatus = 'Error fetching command status.';
      }
    });
  }
}
