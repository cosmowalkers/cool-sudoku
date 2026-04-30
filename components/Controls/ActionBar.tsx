import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Undo2, Eraser, PencilLine, Lightbulb } from "lucide-react-native";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/lib/i18n";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: string;
  accessibilityLabel: string;
}

function ActionButton({ icon, label, onPress, disabled, active, badge, accessibilityLabel }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        active && styles.actionButtonActive,
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && styles.actionButtonPressed,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.iconContainer}>
        {icon}
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.actionLabel,
          active && styles.actionLabelActive,
          disabled && styles.actionLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ActionBar() {
  const undo = useGameStore((s) => s.undo);
  const erase = useGameStore((s) => s.erase);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const hint = useGameStore((s) => s.hint);
  const isNotesMode = useGameStore((s) => s.isNotesMode);
  const historyLength = useGameStore((s) => s.history.length);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const { t } = useTranslation();

  const hintsRemaining = 3 - hintsUsed;

  return (
    <View style={styles.container}>
      <ActionButton
        icon={<Undo2 size={20} strokeWidth={2} color={historyLength === 0 ? "#94A3B8" : "#0F172A"} />}
        label={t("action.undo")}
        onPress={undo}
        disabled={historyLength === 0}
        accessibilityLabel={historyLength === 0 ? t("a11y.undoEmpty") : t("action.undo")}
      />
      <ActionButton
        icon={<Eraser size={20} strokeWidth={2} color="#0F172A" />}
        label={t("action.erase")}
        onPress={erase}
        accessibilityLabel={t("a11y.eraseCell")}
      />
      <ActionButton
        icon={<PencilLine size={20} strokeWidth={2} color={isNotesMode ? "#2563EB" : "#0F172A"} />}
        label={t("action.notes")}
        onPress={toggleNotesMode}
        active={isNotesMode}
        accessibilityLabel={isNotesMode ? t("a11y.notesOn") : t("a11y.notesOff")}
      />
      <ActionButton
        icon={<Lightbulb size={20} strokeWidth={2} color={hintsRemaining === 0 ? "#94A3B8" : "#0F172A"} />}
        label={t("action.hint")}
        onPress={hint}
        disabled={hintsRemaining === 0}
        badge={String(hintsRemaining)}
        accessibilityLabel={t("a11y.hintRemaining", { count: hintsRemaining })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 60,
    minHeight: 44,
  },
  actionButtonActive: {
    backgroundColor: "#DBEAFE",
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  actionLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  actionLabelActive: {
    color: "#2563EB",
  },
  actionLabelDisabled: {
    color: "#94A3B8",
  },
});
