import type { ReactNode } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import type { AppColors } from "../theme/colors";

export type TabKey = "home" | "leaderboard" | "history" | "settings";

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "home", label: "خانه", icon: "⌂" },
  { key: "leaderboard", label: "رتبه‌بندی", icon: "♕" },
  { key: "history", label: "تاریخچه", icon: "◔" },
  { key: "settings", label: "تنظیمات", icon: "⚙" },
];

export function AppShell({
  colors,
  activeTab,
  onTabChange,
  children,
}: {
  colors: AppColors;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>{children}</View>
      <View style={[styles.navWrap, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={({ pressed }) => [
                styles.navItem,
                active && { backgroundColor: colors.accentFaint },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Text style={[styles.navIcon, { color: active ? colors.accentStrong : colors.muted }]}>{tab.icon}</Text>
              <Text style={[styles.navLabel, { color: active ? colors.accentStrong : colors.muted }, active && styles.navLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  navWrap: {
    minHeight: 72,
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 24,
    padding: 7,
    flexDirection: "row-reverse",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  navItem: { flex: 1, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 2, minHeight: 56 },
  navIcon: { fontSize: 21, lineHeight: 23 },
  navLabel: { fontSize: 11 },
  navLabelActive: { fontWeight: "900" },
});
