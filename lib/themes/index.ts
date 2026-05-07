import { useLocaleStore } from "@/lib/i18n";
import { themes } from "./themes";
import type { ThemeColors, ThemeId } from "./types";

export type { Theme, ThemeColors, ThemeId } from "./types";
export { themes } from "./themes";

export function useTheme(): { colors: ThemeColors; themeId: ThemeId; setTheme: (id: ThemeId) => void } {
  const themeId = useLocaleStore((s) => s.themeId ?? "light") as ThemeId;
  const setTheme = useLocaleStore((s) => s.setTheme);

  const theme = themes[themeId] ?? themes.light;
  const colors = themeId === "dark" ? theme.colors.dark : theme.colors.light;

  return { colors, themeId, setTheme };
}
