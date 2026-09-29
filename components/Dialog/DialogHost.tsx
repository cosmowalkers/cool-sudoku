import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useDialogStore } from "@/lib/dialog";
import { useTheme } from "@/lib/themes";

/** 应用内弹窗宿主，挂在根布局上，由 showAlert / showConfirm 驱动 */
export function DialogHost() {
  const request = useDialogStore((s) => s.request);
  const confirm = useDialogStore((s) => s.confirm);
  const dismiss = useDialogStore((s) => s.dismiss);
  const { colors } = useTheme();

  if (!request) return null;

  const { title, message, confirmText, cancelText, destructive } = request;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={dismiss} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: colors.foregroundMuted }]}>{message}</Text>
          ) : null}

          <View style={styles.actions}>
            {cancelText ? (
              <Pressable
                style={[styles.button, { borderColor: colors.border }]}
                onPress={dismiss}
              >
                <Text style={[styles.buttonText, { color: colors.foregroundMuted }]}>
                  {cancelText}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[
                styles.button,
                { backgroundColor: destructive ? colors.error : colors.primary },
              ]}
              onPress={confirm}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>{confirmText}</Text>
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  confirmText: {
    color: "#FFFFFF",
  },
});
