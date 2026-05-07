import { Tabs } from 'expo-router';
import React from 'react';
import { Grid3X3, BarChart3 } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/lib/themes';
import { useTranslation } from '@/lib/i18n';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.game"),
          tabBarIcon: ({ color }) => <Grid3X3 size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t("tab.stats"),
          tabBarIcon: ({ color }) => <BarChart3 size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
