import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useStatsStore, getOverallStats, getStatsByDifficulty, type GameResult } from "@/stores/stats-store";
import { useAchievementStore, ACHIEVEMENTS } from "@/stores/achievement-store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation, useLocaleStore } from "@/lib/i18n";
import { Volume2, VolumeX } from "lucide-react-native";
import type { Difficulty } from "@/lib/sudoku";

function formatTime(seconds: number): string {
  if (seconds === 0) return "--:--";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDate(iso: string, t: (key: string) => string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
  const dateStr = iso.split("T")[0];
  if (dateStr === today) return t("time.today");
  if (dateStr === yesterday) return t("time.yesterday");
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
}

function getDiffColor(d: Difficulty): string {
  switch (d) {
    case "easy": return "#DCFCE7";
    case "medium": return "#DBEAFE";
    case "hard": return "#FEF3C7";
    case "expert": return "#FEE2E2";
  }
}

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t, toggleLocale } = useTranslation();
  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    surface: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#0F172A",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    primary: isDark ? "#60A5FA" : "#2563EB",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  const tabs: { key: Difficulty | "all"; label: string }[] = [
    { key: "all", label: t("stats.all") },
    { key: "easy", label: t("diff.easy") },
    { key: "medium", label: t("diff.medium") },
    { key: "hard", label: t("diff.hard") },
    { key: "expert", label: t("diff.expert") },
  ];

  const isMuted = useLocaleStore((s) => s.isMuted);
  const toggleMute = useLocaleStore((s) => s.toggleMute);

  const history = useStatsStore((s) => s.history);
  const unlockedIds = useAchievementStore((s) => s.unlockedIds);
  const unlockedDates = useAchievementStore((s) => s.unlockedDates);
  const [activeTab, setActiveTab] = useState<Difficulty | "all">("all");

  const overall = getOverallStats(history);

  const filteredHistory = activeTab === "all"
    ? history
    : history.filter((g) => g.difficulty === activeTab);

  const diffStats = activeTab !== "all" ? getStatsByDifficulty(history, activeTab) : null;

  if (history.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("stats.noGames")}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{t("stats.startPlaying")}</Text>
        <View style={styles.settingsRow}>
          <Pressable onPress={toggleMute} style={[styles.langButton, { borderColor: colors.border }]}>
            {isMuted ? <VolumeX size={16} color={colors.textMuted} /> : <Volume2 size={16} color={colors.textMuted} />}
            <Text style={[styles.langButtonText, { color: colors.textMuted }]}>{isMuted ? t("settings.mute") : t("settings.unmute")}</Text>
          </Pressable>
          <Pressable onPress={toggleLocale} style={[styles.langButton, { borderColor: colors.border }]}>
            <Text style={[styles.langButtonText, { color: colors.textMuted }]}>{t("lang.switch")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 总体统计卡片 */}
      <View style={styles.overallGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{overall.totalPlayed}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t("stats.games")}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{overall.currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t("stats.streak")}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{overall.bestStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t("stats.bestStreak")}</Text>
        </View>
      </View>

      {/* 难度筛选 tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === tab.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 分难度统计 */}
      {diffStats && (
        <View style={styles.diffStatsRow}>
          <View style={styles.diffStat}>
            <Text style={[styles.diffStatValue, { color: colors.text }]}>{diffStats.gamesPlayed}</Text>
            <Text style={[styles.diffStatLabel, { color: colors.textMuted }]}>{t("stats.played")}</Text>
          </View>
          <View style={styles.diffStat}>
            <Text style={[styles.diffStatValue, { color: colors.text }]}>{formatTime(diffStats.bestTime)}</Text>
            <Text style={[styles.diffStatLabel, { color: colors.textMuted }]}>{t("stats.best")}</Text>
          </View>
          <View style={styles.diffStat}>
            <Text style={[styles.diffStatValue, { color: colors.text }]}>{formatTime(diffStats.averageTime)}</Text>
            <Text style={[styles.diffStatLabel, { color: colors.textMuted }]}>{t("stats.average")}</Text>
          </View>
        </View>
      )}

      {/* 历史记录列表 */}
      <View style={styles.listContainer}>
        <FlashList
          data={filteredHistory}
          renderItem={({ item }: { item: GameResult }) => (
            <View style={[styles.historyItem, { borderBottomColor: colors.border }]}>
              <View style={styles.historyLeft}>
                <Text style={[styles.historyDate, { color: colors.textMuted }]}>{formatDate(item.completedAt, t)}</Text>
                <View style={[styles.diffBadge, { backgroundColor: getDiffColor(item.difficulty) }]}>
                  <Text style={styles.diffBadgeText}>
                    {t("diff." + item.difficulty)}
                  </Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyTime, { color: colors.text }]}>{formatTime(item.elapsedTime)}</Text>
                <Text style={[styles.historyMistakes, { color: colors.textMuted }]}>{t("stats.err", { count: item.mistakes })}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{t("stats.noDiffGames")}</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.achievementSection}>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>
                {t("achievement.progress", { count: unlockedIds.length })}
              </Text>
              <View style={styles.achievementGrid}>
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = unlockedIds.includes(a.id);
                  return (
                    <Pressable
                      key={a.id}
                      style={[styles.achievementItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => {
                        if (unlocked) {
                          Alert.alert(t(a.nameKey), `${t(a.descKey)}\n\n${t("achievement.unlockedOn", { date: unlockedDates[a.id] || "" })}`);
                        }
                      }}
                    >
                      <Text style={[styles.achievementIcon, !unlocked && styles.achievementLocked]}>
                        {unlocked ? a.icon : "?"}
                      </Text>
                      <Text style={[styles.achievementName, { color: unlocked ? colors.text : colors.textMuted }]} numberOfLines={1}>
                        {unlocked ? t(a.nameKey) : "???"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          }
        />
      </View>

      <View style={styles.settingsRow}>
        <Pressable onPress={toggleMute} style={[styles.langButton, { borderColor: colors.border }]}>
          {isMuted ? <VolumeX size={16} color={colors.textMuted} /> : <Volume2 size={16} color={colors.textMuted} />}
          <Text style={[styles.langButtonText, { color: colors.textMuted }]}>{isMuted ? t("settings.mute") : t("settings.unmute")}</Text>
        </Pressable>
        <Pressable onPress={toggleLocale} style={[styles.langButton, { borderColor: colors.border }]}>
          <Text style={[styles.langButtonText, { color: colors.textMuted }]}>{t("lang.switch")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#0F172A", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#64748B" },
  overallGrid: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  statValue: { fontSize: 24, fontWeight: "700", color: "#0F172A", fontVariant: ["tabular-nums"] },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 4 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
  tabActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  tabText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  tabTextActive: { color: "#FFFFFF" },
  diffStatsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  diffStat: { flex: 1, alignItems: "center" },
  diffStatValue: { fontSize: 16, fontWeight: "600", color: "#0F172A", fontVariant: ["tabular-nums"] },
  diffStatLabel: { fontSize: 12, color: "#64748B", marginTop: 2 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  historyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0" },
  historyLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  historyDate: { fontSize: 13, color: "#64748B", width: 70 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  diffBadgeText: { fontSize: 11, fontWeight: "500", color: "#0F172A" },
  historyRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyTime: { fontSize: 14, fontWeight: "600", color: "#0F172A", fontVariant: ["tabular-nums"] },
  historyMistakes: { fontSize: 12, color: "#64748B", width: 40 },
  settingsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16, marginBottom: 16 },
  langButton: { flexDirection: "row", alignItems: "center", gap: 6, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  langButtonText: { fontSize: 14, fontWeight: "500", color: "#64748B" },
  achievementSection: { paddingHorizontal: 0, paddingTop: 16, paddingBottom: 8 },
  achievementTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  achievementGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  achievementItem: { width: "30%", aspectRatio: 1, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", padding: 8 },
  achievementIcon: { fontSize: 24, marginBottom: 4 },
  achievementLocked: { opacity: 0.3 },
  achievementName: { fontSize: 10, textAlign: "center" },
});
