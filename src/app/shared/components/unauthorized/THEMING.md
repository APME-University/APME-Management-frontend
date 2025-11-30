# Unauthorized Component - PrimeNG Theme Integration

## Overview
The Unauthorized component is fully integrated with PrimeNG's theming system and automatically adapts to light/dark mode switches.

## Theme Variables Used

### Colors
- `--primary-color`: Main accent color (shield icon)
- `--primary-50`, `--primary-100`, `--primary-200`: Background gradients
- `--text-color`: Primary text color
- `--text-color-secondary`: Secondary text color
- `--surface-card`: Card background
- `--surface-50`, `--surface-100`, `--surface-200`: Surface variations
- `--surface-border`: Border colors
- `--border-radius`: Consistent border radius

## How It Works

### Automatic Theme Detection
The component uses PrimeNG CSS variables that automatically update when the theme changes:

```css
/* Light Mode (default) */
.unauthorized-container {
  background: linear-gradient(135deg, 
    var(--primary-50) 0%,   /* Light blue */
    var(--primary-100) 100%); /* Slightly darker blue */
}

/* Dark Mode (automatically adapts) */
/* When dark theme is active, these variables change to dark values */
```

### No Manual Dark Mode Classes
Unlike Tailwind's `dark:` prefix approach, PrimeNG themes work through CSS variables:
- ❌ `bg-blue-50 dark:bg-gray-900` (Tailwind approach)
- ✅ `var(--surface-100)` (PrimeNG approach)

## Theme Switching

### With Lara Light/Dark Themes
```typescript
// In your theme service or component
import { PrimeNGConfig } from 'primeng/api';

constructor(private primengConfig: PrimeNGConfig) {}

toggleTheme() {
  const currentTheme = document.getElementById('theme-link');
  if (currentTheme?.getAttribute('href')?.includes('dark')) {
    this.switchTheme('lara-light-blue');
  } else {
    this.switchTheme('lara-dark-blue');
  }
}

switchTheme(theme: string) {
  const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
  if (themeLink) {
    themeLink.href = `assets/themes/${theme}/theme.css`;
  }
}
```

### With Custom Preset (Your Current Setup)
The component automatically works with your MyPreset configuration:
```typescript
providePrimeNG({
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.my-app-dark'
    }
  }
})
```

## Customization

### Changing Colors
To customize the appearance, modify your theme preset or override variables:

```css
/* In your global styles */
:root {
  --unauthorized-gradient-start: var(--primary-50);
  --unauthorized-gradient-end: var(--primary-100);
  --unauthorized-icon-color: var(--primary-500);
}

.my-app-dark {
  --unauthorized-gradient-start: var(--surface-900);
  --unauthorized-gradient-end: var(--surface-800);
  --unauthorized-icon-color: var(--primary-400);
}
```

## Component Classes

### Semantic Classes Used
- `.unauthorized-container`: Main container
- `.unauthorized-icon-bg`: Icon background
- `.unauthorized-icon-glow`: Animated glow effect
- `.unauthorized-card`: Main card container
- `.text-color`: Primary text
- `.text-color-secondary`: Secondary text
- `.surface-100`, `.surface-200`: Surface backgrounds

### PrimeNG Components
- `p-card`: Automatically themed
- `p-tag`: Uses severity colors
- `p-button`: Follows theme colors

## Testing Theme Compatibility

### Light Mode Check
1. Backgrounds should be light blue/indigo gradients
2. Text should be dark and readable
3. Cards should have light backgrounds
4. Borders should be subtle

### Dark Mode Check
1. Backgrounds should use dark surface colors
2. Text should be light and readable
3. Cards should have dark backgrounds
4. Borders should be visible but subtle

## Browser Support
The theming system works in all modern browsers that support CSS custom properties (variables):
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

## Performance
- CSS variables are computed once per theme change
- No JavaScript recalculation needed
- Smooth transitions when switching themes
- Minimal CSS overhead
