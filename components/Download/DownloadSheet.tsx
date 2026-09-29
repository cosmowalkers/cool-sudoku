import React from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Smartphone, Apple, Download, X } from "lucide-react-native";
import { APP_DOWNLOADS } from "@/lib/app-links";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";
import { QrCode } from "./QrCode";

interface DownloadSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function DownloadSheet({ visible, onClose }: DownloadSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const android = APP_DOWNLOADS.android;
  const iosUrl = APP_DOWNLOADS.ios.url;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.drawer, { backgroundColor: colors.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>{t("download.title")}</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel={t("a11y.close")}>
              <X size={22} color={colors.foregroundMuted} />
            </Pressable>
          </View>

          {/* Android */}
          <View style={styles.section}>
            <View style={styles.platformHeader}>
              <Smartphone size={18} color={colors.foreground} />
              <Text style={[styles.platformName, { color: colors.foreground }]}>
                {t("download.android")}
              </Text>
            </View>

            {android.url ? (
              <>
                <View style={[styles.qrPanel, { borderColor: colors.border }]}>
                  <QrCode value={android.url} />
                  <Text style={[styles.qrHint, { color: colors.foregroundMuted }]}>
                    {t("download.scan")}
                  </Text>
                </View>
                <Pressable
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => Linking.openURL(android.url!)}
                >
                  <Download size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>{t("download.direct")}</Text>
                </Pressable>
                {android.fallback ? (
                  <Pressable
                    style={styles.fallbackButton}
                    onPress={() => Linking.openURL(android.fallback!)}
                  >
                    <Text style={[styles.fallbackText, { color: colors.foregroundMuted }]}>
                      {t("download.fallback")}
                    </Text>
                  </Pressable>
                ) : null}
                <Text style={[styles.note, { color: colors.foregroundMuted }]}>
                  {t("download.wechatHint")}
                </Text>
              </>
            ) : (
              <Text style={[styles.comingSoon, { color: colors.foregroundMuted }]}>
                {t("download.comingSoon")}
              </Text>
            )}
          </View>

          {/* iOS */}
          <View style={styles.section}>
            <View style={styles.platformHeader}>
              <Apple size={18} color={colors.foreground} />
              <Text style={[styles.platformName, { color: colors.foreground }]}>
                {t("download.ios")}
              </Text>
            </View>

            {iosUrl ? (
              <View style={[styles.qrPanel, { borderColor: colors.border }]}>
                <QrCode value={iosUrl} />
                <Text style={[styles.qrHint, { color: colors.foregroundMuted }]}>
                  {t("download.scan")}
                </Text>
              </View>
            ) : (
              <Text style={[styles.comingSoon, { color: colors.foregroundMuted }]}>
                {t("download.comingSoon")}
              </Text>
            )}
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
    backgroundColor: "rgba(15, 23, 42, 0.45)",
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
    marginBottom: 16,
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
  platformHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  platformName: {
    fontSize: 16,
    fontWeight: "700",
  },
  qrPanel: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  qrHint: {
    fontSize: 13,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  note: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  fallbackButton: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },
  fallbackText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
  comingSoon: {
    fontSize: 15,
    paddingVertical: 14,
  },
});
