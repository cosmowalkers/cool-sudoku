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

  // 功能色 — ActionBar 按钮
  funcUndo: string;
  funcUndoLight: string;
  funcErase: string;
  funcEraseLight: string;
  funcNotes: string;
  funcNotesLight: string;
  funcHint: string;
  funcHintLight: string;

  // 难度色
  diffEasy: string;
  diffMedium: string;
  diffHard: string;
  diffExpert: string;

  // 生命值
  life: string;
  lifeLost: string;

  // 数字键盘
  numpadBg: string;
  numpadShadow: string;
  numpadText: string;

  // 反馈条
  success: string;
  successShadow: string;
  errorShadow: string;
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
