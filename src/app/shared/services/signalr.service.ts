import { inject, Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
// import { MaintenanceRequestDto } from '../../proxy/maintenance-requests';
import { AuthService, LocalizationService } from '@abp/ng.core';

export interface NotificationData {
  message: string;
  // data: MaintenanceRequestDto | { id: string; type: string } | any;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService implements OnDestroy {
  private hubConnection: HubConnection | null = null;
  private isConnected = false;
  
  // Observable for notifications
  public notifications$ = new Subject<NotificationData>();
  
  // Observable for connection status
  public connectionStatus$ = new BehaviorSubject<boolean>(false);
  localizationservice = inject(LocalizationService);
  auth = inject(AuthService);
  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    // Build the hub connection
    const hubUrl = environment.signalR?.hubUrl || `${environment.apis.default.url}/hub`;
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl ,{
        accessTokenFactory: () => this.auth.getAccessToken()
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Set up connection event handlers
    this.setupConnectionHandlers();
    
    // Start the connection
    this.startConnection();
  }

  private setupConnectionHandlers(): void {
    if (!this.hubConnection) return;

    // Connection established
    this.hubConnection.onreconnected(() => {
      this.isConnected = true;
      this.connectionStatus$.next(true);
    });

    // Connection lost
    this.hubConnection.onclose(() => {
      console.log('SignalR: Connection to hub closed');
      this.isConnected = false;
      this.connectionStatus$.next(false);
    });

    // // Listen for maintenance request notifications
    // this.hubConnection.on('ReceiveMaintenanceRequest', (maintenanceRequest: MaintenanceRequestDto) => {      
    //   const notification: NotificationData = {
    //     message: this.localizationservice.instant(`::ReceivedNewMaintenanceRequest`),
    //     data: maintenanceRequest,
    //     timestamp: new Date(),
    //     type: 'info'
    //   };
      
    //   this.notifications$.next(notification);
    // });

    // Listen for other potential notifications
    this.hubConnection.on('ReceiveNotification', (message: string, data: any) => {
      
      const notification: NotificationData = {
        message: message,
        // data: data,
        timestamp: new Date(),
        type: 'info'
      };
      
      this.notifications$.next(notification);
    });

    // Listen for order notifications
    this.hubConnection.on('ReceiveOrder', (orderId: string) => {
      
      const notification: NotificationData = {
        message: this.localizationservice.instant(`::ReceivedNewOrder`),
        // data: { id: orderId, type: 'order' },
        timestamp: new Date(),
        type: 'success'
      };
      
      this.notifications$.next(notification);
    });
  }

  private async startConnection(): Promise<void> {
    if (!this.hubConnection) return;

    try {
      await this.hubConnection.start();
      console.log('SignalR: Connected to hub');
      this.isConnected = true;
      this.connectionStatus$.next(true);
    } catch (error) {
      console.error('SignalR: Failed to connect to hub', error);
      this.isConnected = false;
      this.connectionStatus$.next(false);
      
      // Retry connection after 5 seconds
      setTimeout(() => {
        this.startConnection();
      }, 5000);
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection && this.isConnected) {
      try {
        await this.hubConnection.stop();
        this.isConnected = false;
        this.connectionStatus$.next(false);
        console.log('SignalR: Disconnected from hub');
      } catch (error) {
        console.error('SignalR: Error stopping connection', error);
      }
    }
  }

  public isHubConnected(): boolean {
    return this.isConnected;
  }

  public async invokeMethod(methodName: string, ...args: any[]): Promise<any> {
    if (!this.hubConnection || !this.isConnected) {
      throw new Error('Hub connection is not established');
    }

    try {
      return await this.hubConnection.invoke(methodName, ...args);
    } catch (error) {
      console.error(`SignalR: Error invoking method ${methodName}`, error);
      throw error;
    }
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
