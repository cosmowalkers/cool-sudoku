export interface ThemeColors {
  background: string;
  surface: string;
  foreground: string;
  foregroundMuted: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  userInput: string;
  error: string;
  errorLight: string;
  border: string;
  borderThick: string;
  note: string;
  hint: string;
}

export interface Theme {
  id: string;
  nameKey: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

export type ThemeId = "light" | "dark";
