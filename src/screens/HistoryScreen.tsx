import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState, ErrorBox, LoadingState, PageHeader, Surface } from "../components/Common";
import { apiRequest, messageFromError } from "../lib/api";
import type { AppColors } from "../theme/colors";
import type { HistoryData } from "../types";

export function HistoryScreen({ colors, token, onUnauthorized }: { colors: AppColors; token: string; onUnauthorized: () => void }) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const result = await apiRequest<HistoryData>("/api/mobile/history", { token });
      if (result.status === 401) {
        onUnauthorized();
        return;
      }
      if (!result.ok) {
        setError(messageFromError(result.data, "دریافت تاریخچه انجام نشد."));
        return;
      }
      setData(result.data as HistoryData);
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

  const max = Math.max(8, ...(data?.rows.map((row) => row.count) ?? [0]));
  const hasAny = Boolean(data?.rows.some((row) => row.count > 0));

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.accent} onRefresh={() => { setRefreshing(true); void load(true); }} />}
      showsVerticalScrollIndicator={false}
    >
      <PageHeader colors={colors} eyebrow="هفت روز اخیر" title="تاریخچه" subtitle="روندت رو ببین؛ استمرار از عددهای بزرگ مهم‌تره." />
      {error ? <ErrorBox colors={colors} message={error} /> : null}
      {data ? (
        <>
          <Surface colors={colors} style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>مجموع ۷ روز</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{data.total.toLocaleString("fa-IR")} <Text style={styles.summaryUnit}>لیوان</Text></Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.line }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>میانگین روزانه</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{data.average.toLocaleString("fa-IR")} <Text style={styles.summaryUnit}>لیوان</Text></Text>
            </View>
          </Surface>

          {!hasAny ? (
            <EmptyState colors={colors} icon="🌱" title="تاریخه‌ات از امروز شروع میشه" text="اولین لیوانت را ثبت کن تا اینجا کم‌کم شکل بگیرد." />
          ) : (
            <Surface colors={colors} style={styles.chartCard}>
              {data.rows.map((row) => {
                const width = row.count > 0 ? Math.max(8, (row.count / max) * 100) : 0;
                return (
                  <View style={styles.chartRow} key={row.key}>
                    <Text style={[styles.day, { color: colors.muted }]}>{row.label}</Text>
                    <View style={[styles.track, { backgroundColor: colors.ringTrack }]}>
                      <View style={[styles.value, { width: `${width}%`, backgroundColor: colors.accent }]} />
                    </View>
                    <Text style={[styles.count, { color: colors.text }]}>{row.count.toLocaleString("fa-IR")}</Text>
                  </View>
                );
              })}
            </Surface>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 30 },
  summary: { flexDirection: "row-reverse", alignItems: "stretch", marginBottom: 12, paddingVertical: 20 },
  summaryItem: { flex: 1, alignItems: "flex-end", gap: 5 },
  divider: { width: 1, marginHorizontal: 14 },
  summaryLabel: { fontSize: 12, textAlign: "right" },
  summaryValue: { fontSize: 22, fontWeight: "900", textAlign: "right" },
  summaryUnit: { fontSize: 11, fontWeight: "500" },
  chartCard: { gap: 17, paddingVertical: 24 },
  chartRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  day: { width: 66, fontSize: 12, textAlign: "right" },
  track: { flex: 1, height: 12, borderRadius: 99, overflow: "hidden", flexDirection: "row-reverse" },
  value: { height: "100%", borderRadius: 99 },
  count: { width: 28, fontSize: 13, fontWeight: "800", textAlign: "center" },
});
