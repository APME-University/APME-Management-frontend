import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SignalRService } from '../../services/signalr.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <div class="flex items-center gap-2">
      <div 
        class="w-2 h-2 rounded-full transition-colors duration-300"
        [ngClass]="getStatusColor()"
        [pTooltip]="getStatusTooltip()"
        tooltipPosition="bottom"
      ></div>
      
      <span 
        class="text-xs font-medium transition-colors duration-300"
        [ngClass]="getStatusTextColor()"
      >
        {{ getStatusText() }}
      </span>
      
      <p-button
        *ngIf="!isConnected"
        icon="pi pi-refresh"
        size="small"
        text
        rounded
        pRipple
        [loading]="isReconnecting"
        (click)="reconnect()"
        pTooltip="Reconnect to hub"
        tooltipPosition="bottom"
      ></p-button>
    </div>
  `,
  styles: [`
    .status-connected {
      background-color: #22c55e;
    }
    
    .status-connecting {
      background-color: #f59e0b;
    }
    
    .status-disconnected {
      background-color: #ef4444;
    }
    
    .text-connected {
      color: #22c55e;
    }
    
    .text-connecting {
      color: #f59e0b;
    }
    
    .text-disconnected {
      color: #ef4444;
    }
  `]
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  private signalRService = inject(SignalRService);
  private destroy$ = new Subject<void>();

  isConnected = false;
  isReconnecting = false;

  ngOnInit(): void {
    this.signalRService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isConnected = status;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusColor(): string {
    if (this.isConnected) {
      return 'status-connected';
    } else if (this.isReconnecting) {
      return 'status-connecting';
    } else {
      return 'status-disconnected';
    }
  }

  getStatusTextColor(): string {
    if (this.isConnected) {
      return 'text-connected';
    } else if (this.isReconnecting) {
      return 'text-connecting';
    } else {
      return 'text-disconnected';
    }
  }

  getStatusText(): string {
    if (this.isConnected) {
      return 'Connected';
    } else if (this.isReconnecting) {
      return 'Connecting...';
    } else {
      return 'Disconnected';
    }
  }

  getStatusTooltip(): string {
    if (this.isConnected) {
      return 'SignalR hub is connected';
    } else if (this.isReconnecting) {
      return 'Attempting to reconnect to hub...';
    } else {
      return 'SignalR hub is disconnected';
    }
  }

  async reconnect(): Promise<void> {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    
    try {
      await this.signalRService.stopConnection();
      // The service will automatically attempt to reconnect
    } catch (error) {
      console.error('Error during reconnection:', error);
    } finally {
      this.isReconnecting = false;
    }
  }
}
