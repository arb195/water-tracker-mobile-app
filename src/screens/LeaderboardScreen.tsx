import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState, ErrorBox, LoadingState, PageHeader, Surface } from "../components/Common";
import { apiRequest, messageFromError } from "../lib/api";
import type { AppColors } from "../theme/colors";
import type { LeaderboardData } from "../types";

function medal(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}.`;
}

export function LeaderboardScreen({ colors, token, onUnauthorized }: { colors: AppColors; token: string; onUnauthorized: () => void }) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const result = await apiRequest<LeaderboardData>("/api/mobile/leaderboard", { token });
      if (result.status === 401) {
        onUnauthorized();
        return;
      }
      if (!result.ok) {
        setError(messageFromError(result.data, "دریافت رتبه‌بندی انجام نشد."));
        return;
      }
      setData(result.data as LeaderboardData);
    } catch {
      setError("اتصال به سرور برقرار نشد.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading && !data) return <LoadingState colors={colors} />;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.accent} onRefresh={() => { setRefreshing(true); void load(true); }} />}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader colors={colors} eyebrow="امروز در تهران" title="رتبه‌بندی امروز 🏆" subtitle="هر لیوان یک قدم کوچک؛ رقابت فقط برای انگیزه بیشتره." />
      {error ? <ErrorBox colors={colors} message={error} /> : null}

      {data?.rows.length === 0 ? (
        <EmptyState colors={colors} icon="💧" title="هنوز کسی امروز آب ثبت نکرده" text="اولین نفر باش و جدول امروز رو شروع کن." />
      ) : null}

      {data && data.rows.length > 0 ? (
        <>
          <View style={styles.statGrid}>
            <Surface colors={colors} style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>کاربران فعال امروز</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{data.activeUsers.toLocaleString("fa-IR")}</Text>
            </Surface>
            <Surface colors={colors} style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>کل لیوان‌های امروز</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{data.totalGlasses.toLocaleString("fa-IR")}</Text>
            </Surface>
            <Surface colors={colors} style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>میانگین کاربران فعال</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{data.average.toLocaleString("fa-IR")} <Text style={styles.statUnit}>لیوان</Text></Text>
            </Surface>
          </View>

          <View style={styles.extremaGrid}>
            <Surface colors={colors} style={styles.extremaCard}>
              <Text style={styles.extremaIcon}>💧</Text>
              <Text style={[styles.extremaLabel, { color: colors.muted }]}>بیشترین مصرف</Text>
              <Text style={[styles.extremaUser, { color: colors.text }]}>@{data.highest?.username ?? "-"}</Text>
              <Text style={[styles.extremaCount, { color: colors.accentStrong }]}>{data.highest?.count ?? 0} لیوان</Text>
            </Surface>
            <Surface colors={colors} style={styles.extremaCard}>
              <Text style={styles.extremaIcon}>🌱</Text>
              <Text style={[styles.extremaLabel, { color: colors.muted }]}>کمترین مصرف</Text>
              <Text style={[styles.extremaUser, { color: colors.text }]}>@{data.lowest?.username ?? "-"}</Text>
              <Text style={[styles.extremaCount, { color: colors.accentStrong }]}>{data.lowest?.count ?? 0} لیوان</Text>
            </Surface>
          </View>

          <Surface colors={colors} style={styles.leaderboardCard}>
            {data.rows.map((row, index) => (
              <View
                key={row.userId}
                style={[
                  styles.leaderRow,
                  index < data.rows.length - 1 && { borderBottomColor: colors.line, borderBottomWidth: 1 },
                  row.isCurrent && { backgroundColor: colors.accentFaint },
                ]}
              >
                <Text style={[styles.rank, { color: colors.muted }]}>{medal(row.rank)}</Text>
                <View style={styles.identity}>
                  <Text style={[styles.username, { color: colors.text }]}>@{row.username}</Text>
                  {row.isCurrent ? <Text style={[styles.youBadge, { color: colors.accentStrong, backgroundColor: colors.accentSoft }]}>شما</Text> : null}
                </View>
                <Text style={[styles.rowCount, { color: colors.muted }]}><Text style={[styles.rowCountStrong, { color: colors.text }]}>{row.count.toLocaleString("fa-IR")}</Text> لیوان</Text>
              </View>
            ))}
          </Surface>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 30 },
  statGrid: { gap: 10, marginBottom: 12 },
  statCard: { minHeight: 82, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  statLabel: { fontSize: 13, textAlign: "right" },
  statValue: { fontSize: 24, fontWeight: "900" },
  statUnit: { fontSize: 11, fontWeight: "500" },
  extremaGrid: { flexDirection: "row-reverse", gap: 10, marginBottom: 12 },
  extremaCard: { flex: 1, minWidth: 0, padding: 15, alignItems: "flex-end" },
  extremaIcon: { fontSize: 26, marginBottom: 5 },
  extremaLabel: { fontSize: 11, textAlign: "right" },
  extremaUser: { fontSize: 13, fontWeight: "900", writingDirection: "ltr", marginTop: 2 },
  extremaCount: { fontSize: 12, fontWeight: "800", marginTop: 2 },
  leaderboardCard: { padding: 7 },
  leaderRow: { minHeight: 66, borderRadius: 18, paddingHorizontal: 10, flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  rank: { width: 42, textAlign: "center", fontSize: 15, fontWeight: "900" },
  identity: { flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 7, minWidth: 0 },
  username: { fontSize: 14, fontWeight: "900", writingDirection: "ltr", flexShrink: 1 },
  youBadge: { fontSize: 10, fontWeight: "800", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99 },
  rowCount: { fontSize: 11, minWidth: 72, textAlign: "left" },
  rowCountStrong: { fontSize: 15, fontWeight: "900" },
});
