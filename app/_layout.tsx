import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGameStore } from "@/stores/game-store";
import { preloadSounds } from "@/lib/audio";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
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

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="new-game"
            options={{ presentation: "modal", headerShown: false }}
          />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaView>
    </ThemeProvider>
  );
}
