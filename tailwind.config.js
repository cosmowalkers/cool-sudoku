/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light mode tokens
        primary: '#2563EB',
        'primary-light': '#DBEAFE',
        secondary: '#7C3AED',
        'secondary-light': '#EDE9FE',
        accent: '#F59E0B',
        surface: '#FFFFFF',
        foreground: '#0F172A',
        'foreground-muted': '#64748B',
        'user-input': '#2563EB',
        error: '#DC2626',
        'error-light': '#FEE2E2',
        border: '#E2E8F0',
        'border-thick': '#334155',
        note: '#64748B',
        hint: '#059669',
        background: '#F8FAFC',
        // Dark mode tokens
        'dark-primary': '#60A5FA',
        'dark-primary-light': '#1E3A5F',
        'dark-secondary': '#A78BFA',
        'dark-secondary-light': '#2D2054',
        'dark-accent': '#FBBF24',
        'dark-background': '#0F172A',
        'dark-surface': '#1E293B',
        'dark-foreground': '#F1F5F9',
        'dark-foreground-muted': '#94A3B8',
        'dark-user-input': '#60A5FA',
        'dark-error': '#F87171',
        'dark-error-light': '#451A1A',
        'dark-border': '#334155',
        'dark-border-thick': '#CBD5E1',
        'dark-note': '#94A3B8',
        'dark-hint': '#34D399',
      },
    },
  },
  plugins: [],
}