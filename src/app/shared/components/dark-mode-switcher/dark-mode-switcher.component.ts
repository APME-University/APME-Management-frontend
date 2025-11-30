import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dark-mode-switcher',
  standalone : false,
  templateUrl: './dark-mode-switcher.component.html',
  styleUrl: './dark-mode-switcher.component.scss'
})
export class DarkModeSwitcherComponent implements OnInit {
  isDark: boolean = false;

  toggleDarkMode() {
    const htmlElement = document.querySelector('html');
    if (!htmlElement) return;

    htmlElement.classList.toggle('my-app-dark');
    this.isDark = !this.isDark;
    localStorage.setItem('isDarkMode', this.isDark ? 'true' : 'false');
  }

  ngOnInit(): void {
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    if (isDarkMode) {
      document.querySelector('html')?.classList.add('my-app-dark');
      this.isDark = true;
    }
  }
}
