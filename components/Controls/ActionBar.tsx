import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Undo2, Eraser, PencilLine, Lightbulb } from "lucide-react-native";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";

const SHADOW_HEIGHT = 3;

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: string;
  accessibilityLabel: string;
  bgColor: string;
  shadowColor: string;
}

function ActionButton({ icon, label, onPress, disabled, active, badge, accessibilityLabel, bgColor, shadowColor }: ActionButtonProps) {
  const translateY = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const { colors } = useTheme();

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    height: SHADOW_HEIGHT - translateY.value,
  }));

  return (
    <Pressable
      onPressIn={() => {
        if (!reducedMotion && !disabled)
          translateY.value = withTiming(SHADOW_HEIGHT, { duration: 80 });
      }}
      onPressOut={() => {
        if (!reducedMotion)
          translateY.value = withTiming(0, { duration: 100 });
      }}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={[styles.wrapper, disabled && styles.wrapperDisabled]}
    >
      <Animated.View style={[styles.body, { backgroundColor: active ? bgColor : colors.surface, borderColor: active ? bgColor : colors.border }, bodyStyle]}>
        <View style={styles.iconContainer}>
          {icon}
          {badge !== undefined && (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.label, { color: active ? "#FFFFFF" : colors.foregroundMuted }]}>
          {label}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.shadow, { backgroundColor: active ? shadowColor : colors.border }, shadowStyle]} />
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
  const { colors } = useTheme();

  const hintsRemaining = 3 - hintsUsed;

  return (
    <View style={styles.container}>
      <ActionButton
        icon={<Undo2 size={20} strokeWidth={2.5} color={historyLength === 0 ? colors.foregroundMuted : colors.funcUndo} />}
        label={t("action.undo")}
        onPress={undo}
        disabled={historyLength === 0}
        accessibilityLabel={historyLength === 0 ? t("a11y.undoEmpty") : t("action.undo")}
        bgColor={colors.funcUndo}
        shadowColor={colors.funcUndoLight}
      />
      <ActionButton
        icon={<Eraser size={20} strokeWidth={2.5} color={colors.funcErase} />}
        label={t("action.erase")}
        onPress={erase}
        accessibilityLabel={t("a11y.eraseCell")}
        bgColor={colors.funcErase}
        shadowColor={colors.funcEraseLight}
      />
      <ActionButton
        icon={<PencilLine size={20} strokeWidth={2.5} color={isNotesMode ? "#FFFFFF" : colors.funcNotes} />}
        label={t("action.notes")}
        onPress={toggleNotesMode}
        active={isNotesMode}
        accessibilityLabel={isNotesMode ? t("a11y.notesOn") : t("a11y.notesOff")}
        bgColor={colors.funcNotes}
        shadowColor={colors.funcNotesLight}
      />
      <ActionButton
        icon={<Lightbulb size={20} strokeWidth={2.5} color={hintsRemaining === 0 ? colors.foregroundMuted : colors.funcHint} />}
        label={t("action.hint")}
        onPress={hint}
        disabled={hintsRemaining === 0}
        badge={String(hintsRemaining)}
        accessibilityLabel={t("a11y.hintRemaining", { count: hintsRemaining })}
        bgColor={colors.funcHint}
        shadowColor={colors.funcHintLight}
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
  wrapper: {
    height: 56 + SHADOW_HEIGHT,
    minWidth: 64,
  },
  wrapperDisabled: {
    opacity: 0.4,
  },
  body: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 56,
  },
  shadow: {
    marginHorizontal: 2,
    height: SHADOW_HEIGHT,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
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
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
