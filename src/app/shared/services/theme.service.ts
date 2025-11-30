import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for managing PrimeNG theme switching
 * Handles light/dark mode toggling
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme$ = new BehaviorSubject<'light' | 'dark'>('light');
  
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }
  
  /**
   * Initialize theme based on user preference or system setting
   */
  private initializeTheme(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    
    // Check system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
  }
  
  /**
   * Get current theme as observable
   */
  getCurrentTheme(): Observable<'light' | 'dark'> {
    return this.currentTheme$.asObservable();
  }
  
  /**
   * Get current theme value
   */
  getTheme(): 'light' | 'dark' {
    return this.currentTheme$.value;
  }
  
  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      // Add dark mode class for PrimeNG
      this.renderer.addClass(htmlElement, 'my-app-dark');
      // Add dark mode class for Tailwind (if using Tailwind dark mode)
      this.renderer.addClass(htmlElement, 'dark');
    } else {
      // Remove dark mode classes
      this.renderer.removeClass(htmlElement, 'my-app-dark');
      this.renderer.removeClass(htmlElement, 'dark');
    }
    
    // Save preference
    localStorage.setItem('theme', theme);
    
    // Update observable
    this.currentTheme$.next(theme);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme$.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.currentTheme$.value === 'dark';
  }
  
  /**
   * Apply theme based on time of day
   */
  applyAutoTheme(): void {
    const hour = new Date().getHours();
    // Dark mode from 7 PM to 7 AM
    const shouldBeDark = hour >= 19 || hour < 7;
    this.setTheme(shouldBeDark ? 'dark' : 'light');
  }
}
