import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useLocaleStore } from "@/lib/i18n";
import { useGameStore } from "@/stores/game-store";
import { useTheme } from "@/lib/themes";
import { preloadSounds } from "@/lib/audio";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const themeId = useLocaleStore((s) => s.themeId ?? "light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkHydration = () => {
      if (useGameStore.persist.hasHydrated()) {
        setReady(true);
        return;
      }
      const unsub = useGameStore.persist.onFinishHydration(() => {
        setReady(true);
        unsub();
      });
    };

    checkHydration();

    // 兜底：2 秒后无论如何都放行，避免白屏
    const timeout = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (ready) {
      preloadSounds();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  const { colors } = useTheme();

  return (
    <ThemeProvider value={themeId === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="new-game"
            options={{ presentation: "modal", headerShown: false }}
          />
        </Stack>
        <StatusBar style={themeId === "dark" ? "light" : "dark"} />
      </SafeAreaView>
    </ThemeProvider>
  );
}
