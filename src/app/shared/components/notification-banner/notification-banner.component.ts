import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { SignalRService, NotificationData } from '../../services/signalr.service';
import { Subject, takeUntil } from 'rxjs';
import { CoreModule, LocalizationService } from '@abp/ng.core';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, RippleModule,CoreModule],
  template: `
    <div 
      *ngIf="currentNotification" 
      class="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto animate-slide-down"
    >
      <div class="relative">
        <!-- Background blur effect -->
        <div class="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50"></div>
        
        <!-- Main notification content -->
        <div class="relative p-6 rounded-2xl">
          <!-- Header with icon and close button -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                [ngClass]="getIconContainerClasses()"
              >
                <i 
                  [class]="getNotificationIcon()" 
                  class="text-xl text-white"
                ></i>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">
                  {{ getNotificationTitle() }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ currentNotification.message }}
                </p>
              </div>
            </div>
            
            <button
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center group"
              (click)="dismissNotification()"
            >
              <i class="pi pi-times text-gray-500 group-hover:text-gray-700 transition-colors duration-200"></i>
            </button>
          </div>
          
          <!-- Action buttons -->
          <div class="flex items-center gap-3">
            <!-- <p-button
              *ngIf="currentNotification.data?.id"
              [label]="getViewButtonLabel()"
              size="large"
              [severity]="getButtonSeverity()"
              pRipple
              class="flex-1"
              (click)="viewItem()"
            ></p-button>
             -->
            <p-button
              [label]="'::Dismiss' | abpLocalization"
              size="large"
              severity="secondary"
              outlined
              pRipple
              (click)="dismissNotification()"
            ></p-button>
          </div>
          
          <!-- Progress bar -->
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                class="h-1.5 rounded-full transition-all duration-100 ease-linear"
                [ngClass]="getProgressBarClasses()"
                [style.width.%]="progressPercentage"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-2 text-center">
              {{ '::AutoDismissIn' | abpLocalization }} {{ remainingSeconds }}s
            </p>
          </div>
        </div>
        
        <!-- Decorative elements -->
        <div class="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
        <div class="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-down {
      animation: slideDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    @keyframes slideDown {
      from {
        transform: translateY(-120%) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class NotificationBannerComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private signalRService = inject(SignalRService);
  private destroy$ = new Subject<void>();

  currentNotification: NotificationData | null = null;
  private notificationTimeout: any;
  private progressInterval: any;
  progressPercentage = 100;
  remainingSeconds = 8;
  localizationService = inject(LocalizationService);
  
  // Audio element for notification sound
  private notificationAudio: HTMLAudioElement;

  constructor() {
    // Initialize audio element
    this.notificationAudio = new Audio('assets/order-notification-sound.wav');
    this.notificationAudio.preload = 'auto';
    this.notificationAudio.volume = 0.7; // Set volume to 70%
  }

  ngOnInit(): void {
    this.signalRService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.showNotification(notification);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearNotificationTimeout();
    this.clearProgressInterval();
    
    // Clean up audio
    if (this.notificationAudio) {
      this.notificationAudio.pause();
      this.notificationAudio = null;
    }
  }

  private showNotification(notification: NotificationData): void {
    // Clear any existing notification
    this.clearNotificationTimeout();
    this.clearProgressInterval();
    
    // Set the new notification
    this.currentNotification = notification;
    this.progressPercentage = 100;
    this.remainingSeconds = 8;
    
    // Play notification sound
    this.playNotificationSound();
    
    // Start progress bar animation
    this.startProgressBar();
    
    // Auto-dismiss after 8 seconds
    this.notificationTimeout = setTimeout(() => {
      this.dismissNotification();
    }, 8000);
  }

  private playNotificationSound(): void {
    try {
      // Reset audio to beginning and play
      this.notificationAudio.currentTime = 0;
      this.notificationAudio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
        // Fallback: try to play without user interaction
        this.notificationAudio.play().catch(() => {
          console.warn('Notification sound playback failed');
        });
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  private startProgressBar(): void {
    this.progressInterval = setInterval(() => {
      this.progressPercentage -= 1.25; // 100% / 8 seconds = 1.25% per 100ms
      this.remainingSeconds = Math.ceil(this.progressPercentage / 12.5); // 100% / 8 = 12.5% per second
      
      if (this.progressPercentage <= 0) {
        this.clearProgressInterval();
      }
    }, 100);
  }

  private clearNotificationTimeout(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
  }

  private clearProgressInterval(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  dismissNotification(): void {
    this.currentNotification = null;
    this.clearNotificationTimeout();
    this.clearProgressInterval();
  }

  viewMaintenanceRequest(): void {
    // if (this.currentNotification?.data?.id) {
    //   this.router.navigate(['/maintenance-requests', this.currentNotification.data.id]);
    //   this.dismissNotification();
    // }
  }

  viewItem(): void {
    // if (this.currentNotification?.data?.id) {
    //   if (this.currentNotification.data.type === 'order') {
    //     this.router.navigate(['/orders', this.currentNotification.data.id]);
    //   } else {
    //     // Default to maintenance request for backward compatibility
    //     this.router.navigate(['/maintenance-requests', this.currentNotification.data.id]);
    //   }
    //   this.dismissNotification();
    // }
  }

  getViewButtonLabel(): string {
    return this.localizationService.instant(`::ViewOrder`);
  }

  getNotificationTitle(): string {
    // if (this.currentNotification?.data?.type === 'order') {
    //   return this.localizationService.instant(`::NewOrderReceived`);
    // }
    return this.localizationService.instant(`::NewMaintenanceRequest`);
  }

  getButtonSeverity(): 'success' | 'primary' {
    // if (this.currentNotification?.data?.type === 'order') {
    //   return 'success';
    // }
    return 'primary';
  }

  getIconContainerClasses(): string {
    if (!this.currentNotification) return 'bg-blue-500';
    
    switch (this.currentNotification.type) {
      case 'success':
        return 'bg-gradient-to-br from-green-500 to-emerald-600';
      case 'warning':
        return 'bg-gradient-to-br from-amber-500 to-orange-600';
      case 'error':
        return 'bg-gradient-to-br from-red-500 to-pink-600';
      default:
        return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    }
  }

  getProgressBarClasses(): string {
    if (!this.currentNotification) return 'bg-blue-500';
    
    switch (this.currentNotification.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    }
  }

  getNotificationIcon(): string {
    if (!this.currentNotification) return 'pi pi-info-circle';
    
    switch (this.currentNotification.type) {
      case 'success':
        return 'pi pi-check';
      case 'warning':
        return 'pi pi-exclamation-triangle';
      case 'error':
        return 'pi pi-times';
      default:
        return 'pi pi-info-circle';
    }
  }
}
