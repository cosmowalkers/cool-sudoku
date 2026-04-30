import { useCallback } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { zh } from "./locales/zh";
import { en } from "./locales/en";

export type Locale = "zh" | "en";

const dictionaries: Record<Locale, Record<string, string>> = { zh, en };

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "zh",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "locale-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  let text = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === "zh" ? "en" : "zh");
  }, [locale, setLocale]);

  return { t, locale, setLocale, toggleLocale };
}
