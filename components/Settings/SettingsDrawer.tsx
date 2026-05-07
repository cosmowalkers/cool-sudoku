import React from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { X, Volume2, VolumeX, Sun, Moon, Globe } from "lucide-react-native";
import { useTranslation, useLocaleStore } from "@/lib/i18n";
import { useTheme, type ThemeId } from "@/lib/themes";

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { t, toggleLocale, locale } = useTranslation();
  const { colors, themeId, setTheme } = useTheme();
  const isMuted = useLocaleStore((s) => s.isMuted);
  const toggleMute = useLocaleStore((s) => s.toggleMute);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.drawer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>{t("settings.title")}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={22} color={colors.foregroundMuted} />
            </Pressable>
          </View>

          {/* 主题 */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foregroundMuted }]}>{t("settings.theme")}</Text>
            <View style={styles.row}>
              <Pressable
                style={[
                  styles.themeOption,
                  { borderColor: themeId === "light" ? colors.primary : colors.border },
                  themeId === "light" && { borderWidth: 2 },
                ]}
                onPress={() => setTheme("light")}
              >
                <Sun size={20} color={themeId === "light" ? colors.primary : colors.foregroundMuted} />
                <Text style={[styles.optionText, { color: colors.foreground }]}>{t("theme.light")}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.themeOption,
                  { borderColor: themeId === "dark" ? colors.primary : colors.border },
                  themeId === "dark" && { borderWidth: 2 },
                ]}
                onPress={() => setTheme("dark")}
              >
                <Moon size={20} color={themeId === "dark" ? colors.primary : colors.foregroundMuted} />
                <Text style={[styles.optionText, { color: colors.foreground }]}>{t("theme.dark")}</Text>
              </Pressable>
            </View>
          </View>

          {/* 声音 */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foregroundMuted }]}>{t("settings.sound")}</Text>
            <Pressable
              style={[styles.menuItem, { borderColor: colors.border }]}
              onPress={toggleMute}
            >
              {isMuted ? <VolumeX size={20} color={colors.foregroundMuted} /> : <Volume2 size={20} color={colors.primary} />}
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>
                {isMuted ? t("settings.mute") : t("settings.unmute")}
              </Text>
            </Pressable>
          </View>

          {/* 语言 */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foregroundMuted }]}>{t("settings.language")}</Text>
            <Pressable
              style={[styles.menuItem, { borderColor: colors.border }]}
              onPress={toggleLocale}
            >
              <Globe size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>
                {locale === "zh" ? "中文" : "English"}
              </Text>
              <Text style={[styles.menuItemHint, { color: colors.foregroundMuted }]}>
                {t("lang.switch")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  menuItemHint: {
    fontSize: 13,
  },
});
