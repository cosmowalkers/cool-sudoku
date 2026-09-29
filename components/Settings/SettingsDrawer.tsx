import React from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { X, Sun, Moon, Globe, Heart, Shield } from "lucide-react-native";
import { useTranslation, useLocaleStore } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { t, toggleLocale, locale } = useTranslation();
  const { colors, themeId, setTheme } = useTheme();
  const lifeMode = useLocaleStore((s) => s.lifeMode);
  const setLifeMode = useLocaleStore((s) => s.setLifeMode);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.drawer, { backgroundColor: colors.surface }]}>
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />

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
                  styles.optionCard,
                  { backgroundColor: themeId === "light" ? colors.primaryLight : colors.background, borderColor: themeId === "light" ? colors.primary : colors.border },
                  themeId === "light" && { borderWidth: 2 },
                ]}
                onPress={() => setTheme("light")}
              >
                <Sun size={20} color={themeId === "light" ? colors.primary : colors.foregroundMuted} />
                <Text style={[styles.optionText, { color: colors.foreground }]}>{t("theme.light")}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.optionCard,
                  { backgroundColor: themeId === "dark" ? colors.primaryLight : colors.background, borderColor: themeId === "dark" ? colors.primary : colors.border },
                  themeId === "dark" && { borderWidth: 2 },
                ]}
                onPress={() => setTheme("dark")}
              >
                <Moon size={20} color={themeId === "dark" ? colors.primary : colors.foregroundMuted} />
                <Text style={[styles.optionText, { color: colors.foreground }]}>{t("theme.dark")}</Text>
              </Pressable>
            </View>
          </View>

          {/* 生命模式 */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foregroundMuted }]}>{t("settings.lifeMode")}</Text>
            <View style={styles.row}>
              <Pressable
                style={[
                  styles.optionCard,
                  { backgroundColor: lifeMode === "casual" ? colors.funcHintLight : colors.background, borderColor: lifeMode === "casual" ? colors.funcHint : colors.border },
                  lifeMode === "casual" && { borderWidth: 2 },
                ]}
                onPress={() => setLifeMode("casual")}
              >
                <Shield size={18} color={lifeMode === "casual" ? colors.funcHint : colors.foregroundMuted} />
                <Text style={[styles.optionText, { color: colors.foreground }]}>{t("settings.lifeMode.casual")}</Text>
                <Text style={[styles.optionDesc, { color: colors.foregroundMuted }]}>{t("settings.lifeMode.casual.desc")}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.optionCard,
                  { backgroundColor: lifeMode === "challenge" ? colors.funcEraseLight : colors.background, borderColor: lifeMode === "challenge" ? colors.funcErase : colors.border },
                  lifeMode === "challenge" && { borderWidth: 2 },
                ]}
                onPress={() => setLifeMode("challenge")}
              >
                <Heart size={18} color={lifeMode === "challenge" ? colors.funcErase : colors.foregroundMuted} />
                <Text style={[styles.optionText, { color: colors.foreground }]}>{t("settings.lifeMode.challenge")}</Text>
                <Text style={[styles.optionDesc, { color: colors.foregroundMuted }]}>{t("settings.lifeMode.challenge.desc")}</Text>
              </Pressable>
            </View>
          </View>

          {/* 语言 */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foregroundMuted }]}>{t("settings.language")}</Text>
            <Pressable
              style={[styles.menuItem, { backgroundColor: colors.background, borderColor: colors.border }]}
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
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
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionDesc: {
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
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
