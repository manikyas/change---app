/**
 * Motivating aesthetic theme for Change app - vibrant rose-gold gradients, glassmorphism.
 */

import { Platform } from 'react-native';

const tintColorLight = '#ff6b9d'; // Vibrant rose
const tintColorDark = '#ffd166'; // Gold

export const Colors = {
  light: {
    text: '#1a1a2e',
    background: '#f8f9fa',
    tint: tintColorLight,
    accent: '#ff9aa2',
    accentGradient: ['#ff9aa2', '#fecfef', '#ff6b9d'],
    success: '#a8e6cf',
    glass: 'rgba(255, 255, 255, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.18)',
    shadow: 'rgba(0, 0, 0, 0.05)',
    icon: '#6c757d',
    tabIconDefault: '#adb5bd',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f8f9fa',
    background: '#212529',
    tint: tintColorDark,
    accent: '#ffd166',
    accentGradient: ['#ffd166', '#ff9aa2', '#fecfef'],
    success: '#20c997',
    glass: 'rgba(0, 0, 0, 0.3)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    icon: '#6c757d',
    tabIconDefault: '#495057',
    tabIconSelected: tintColorDark,
  },
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  }
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
    title: 'ui-rounded',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    title: '-apple-system',
  },
  web: {
    sans: "system-ui, -apple-system",
    serif: "Georgia, serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, monospace",
    title: "'SF Pro Display', system-ui",
  },
});

export const BorderRadius = {
  card: 24,
  button: 32,
  input: 24,
  small: 16,
};

export const Spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};
