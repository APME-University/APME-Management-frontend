# SignalR Implementation for AlhafezFMS

This document describes the simplified SignalR client implementation for real-time notifications in the AlhafezFMS Angular application.

## Overview

The implementation provides real-time communication between the Angular client and the SignalR hub server, specifically for maintenance request notifications.

## Features

- **Real-time Notifications**: Listen for maintenance request notifications from the hub
- **Automatic Reconnection**: Handles connection drops and automatically reconnects
- **Connection Status**: Visual indicator showing hub connection status
- **Notification Banner**: Displays notifications at the top of the application
- **Navigation Integration**: Click notifications to navigate to maintenance request details

## Architecture

### Components

1. **SignalRService** (`src/app/shared/services/signalr.service.ts`)
   - Manages hub connection lifecycle
   - Handles automatic reconnection
   - Listens for hub events
   - Provides observables for notifications and connection status

2. **NotificationBannerComponent** (`src/app/shared/components/notification-banner/notification-banner.component.ts`)
   - Displays notifications at the top of the application
   - Auto-dismisses after 8 seconds
   - Provides "View Request" button for navigation
   - Supports different notification types (info, success, warning, error)

3. **ConnectionStatusComponent** (`src/app/shared/components/connection-status/connection-status.component.ts`)
   - Shows real-time connection status
   - Visual indicator (green/red/yellow dot)
   - Manual reconnect button when disconnected
   - Tooltips for status information

### Hub Events

The service listens for the following hub events:

- `ReceiveMaintenanceRequest`: Receives maintenance request data

## Configuration

### Environment Configuration

The hub URL is configured in the environment files:

```typescript
// environment.ts (development)
signalR: {
  hubUrl: 'https://localhost:44317/hub'
}

// environment.prod.ts (production)
signalR: {
  hubUrl: 'https://alhafez-back.varx-dev.com/hub'
}
```

### Hub URL Structure

The default hub URL follows the pattern:
```
{API_BASE_URL}/hub
```

## Usage

### 1. Service Injection

```typescript
import { SignalRService } from './shared/services/signalr.service';

constructor(private signalRService: SignalRService) {}
```

### 2. Listen for Notifications

```typescript
ngOnInit() {
  this.signalRService.notifications$.subscribe(notification => {
    console.log('New notification:', notification);
    // Handle notification
  });
}
```

### 3. Check Connection Status

```typescript
ngOnInit() {
  this.signalRService.connectionStatus$.subscribe(isConnected => {
    if (isConnected) {
      console.log('Hub is connected');
    } else {
      console.log('Hub is disconnected');
    }
  });
}
```

## Integration Points

### Header Component

The connection status is displayed in the header component (`hafez-header.component.html`):

```html
<app-connection-status></app-connection-status>
```

### Layout Component

The notification banner is displayed at the top of the main layout (`hafez-layout.component.html`):

```html
<app-notification-banner />
```

## Notification Data Structure

```typescript
interface NotificationData {
  message: string;                    // Display message
  data: MaintenanceRequestDto;        // Associated data
  timestamp: Date;                    // When notification was received
  type: 'info' | 'success' | 'warning' | 'error';
}
```

## Maintenance Request Navigation

When a user clicks "View Request" on a notification:

1. The notification is dismissed
2. User is navigated to `/maintenance-request/{id}`
3. The maintenance request details component displays the request

## Error Handling

- **Connection Failures**: Automatic retry every 5 seconds
- **Hub Method Invocation**: Error logging and re-throwing
- **Service Destruction**: Proper cleanup of connections and subscriptions

## Dependencies

- `@microsoft/signalr`: Core SignalR client library
- `rxjs`: Reactive programming and observables
- `primeng`: UI components for notifications and status

## Testing

### Manual Testing

1. Start the application
2. Check connection status in header (should show "Connected")
3. Simulate hub events from backend
4. Verify notifications appear and navigation works

### Connection Testing

1. Disconnect network
2. Verify status shows "Disconnected"
3. Reconnect network
4. Verify automatic reconnection

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check hub URL in environment configuration
   - Verify backend hub is running
   - Check network connectivity

2. **Notifications Not Appearing**
   - Verify hub connection is established
   - Check browser console for errors
   - Verify hub method names match backend

3. **Navigation Not Working**
   - Check notification data structure
   - Verify maintenance request ID exists
   - Check routing configuration

### Debug Mode

Enable debug logging by modifying the SignalR service:

```typescript
.configureLogging(LogLevel.Debug)
```

## Security Considerations

- Hub URL should use HTTPS in production
- Consider authentication/authorization for hub access
- Validate all data received from hub
- Implement rate limiting for reconnection attempts

## Performance Considerations

- Automatic reconnection with exponential backoff
- Efficient subscription management
- Proper cleanup on component destruction
- Minimal re-renders with reactive patterns
