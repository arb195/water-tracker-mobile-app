import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiRequest, messageFromError } from "../lib/api";
import type { DashboardData } from "../types";
import type { AppColors } from "../theme/colors";
import { ErrorBox, LoadingState, SecondaryButton } from "../components/Common";

const CELEBRATION_MESSAGES = [
  "دمت گرم! امروز بدنت حسابی ازت ممنونه 💙",
  "۸ لیوان کامل شد! قهرمان آب‌رسانی امروز تویی 💧",
  "هدف امروز تکمیل شد؛ عالی بود ✨",
  "یه عادت کوچیک، یه نتیجه بزرگ 🌊",
  "آب کافی، حال بهتر ✨",
  "هدف آب‌رسانی امروز تیک خورد ✅",
] as const;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function HomeScreen({
  colors,
  token,
  username,
  onUnauthorized,
}: {
  colors: AppColors;
  token: string;
  username: string;
  onUnauthorized: () => void;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [celebrate, setCelebrate] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const result = await apiRequest<DashboardData>("/api/mobile/dashboard", { token });
      if (result.status === 401) {
        onUnauthorized();
        return;
      }
      if (!result.ok) {
        setError(messageFromError(result.data, "دریافت اطلاعات امروز انجام نشد."));
        return;
      }
      const next = result.data as DashboardData;
      setData(next);
      setCooldown(next.cooldownSeconds);
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

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown > 0]);

  const progress = data ? Math.min(data.count / data.goal, 1) : 0;
  const percentage = Math.round(progress * 100);
  const statusText = useMemo(() => {
    if (!data) return "";
    if (cooldown > 0) return `تا ثبت بعدی ${formatCountdown(cooldown)}`;
    if (data.count >= data.goal) return "هدفت تکمیل شده؛ هر لیوان اضافه هم ثبت می‌شه 🌊";
    return `${data.goal - data.count} لیوان تا هدف امروز`;
  }, [cooldown, data]);

  async function addWater() {
    if (!data || busy || cooldown > 0) return;
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest<{ success: true; count: number; celebrate: boolean; cooldownSeconds: number }>("/api/mobile/water", {
        method: "POST",
        token,
      });
      if (result.status === 401) {
        onUnauthorized();
        return;
      }
      if (!result.ok) {
        const payload = result.data as { code?: string; remainingSeconds?: number; message?: string };
        if (payload.code === "WATER_COOLDOWN") {
          setCooldown(payload.remainingSeconds ?? 0);
          setError(`هنوز ${Math.ceil((payload.remainingSeconds ?? 0) / 60)} دقیقه مونده تا ثبت بعدی 💧`);
        } else {
          setError(messageFromError(result.data, "ثبت آب انجام نشد."));
        }
        return;
      }
      const payload = result.data as { success: true; count: number; celebrate: boolean; cooldownSeconds: number };
      setData((current) => current ? { ...current, count: payload.count, cooldownSeconds: payload.cooldownSeconds } : current);
      setCooldown(payload.cooldownSeconds);
      if (payload.celebrate) setCelebrate(true);
    } catch {
      setError("اتصال اینترنت رو بررسی کن و دوباره امتحان کن.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) return <LoadingState colors={colors} />;

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.accent} onRefresh={() => { setRefreshing(true); void load(true); }} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.intro}>
            <Text style={[styles.greeting, { color: colors.accentStrong }]}>سلام، @{username} 👋</Text>
            <Text style={[styles.title, { color: colors.text }]}>امروز چقدر آب خوردی؟</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>آرام و پیوسته؛ فقط همین یک لیوان.</Text>
          </View>

          {data ? (
            <View style={styles.progressWrap}>
              <View style={[styles.progressCircle, { backgroundColor: colors.surface, borderColor: progress >= 1 ? colors.accent : colors.ringTrack }]}>
                <Text style={[styles.count, { color: colors.text }]}>{data.count}</Text>
                <Text style={[styles.goal, { color: colors.muted }]}>/ {data.goal}</Text>
                <Text style={[styles.glassLabel, { color: colors.muted }]}>لیوان امروز</Text>
                <Text style={[styles.percent, { color: colors.accentStrong }]}>{percentage.toLocaleString("fa-IR")}٪</Text>
              </View>
              <View style={[styles.track, { backgroundColor: colors.ringTrack }]}>
                <View style={[styles.trackValue, { width: `${percentage}%`, backgroundColor: colors.accent }]} />
              </View>
            </View>
          ) : null}

          <View style={styles.actionArea}>
            <Pressable
              accessibilityRole="button"
              disabled={busy || cooldown > 0 || !data}
              onPress={addWater}
              style={({ pressed }) => [
                styles.waterButton,
                { backgroundColor: colors.accentStrong, opacity: busy || cooldown > 0 || !data ? 0.52 : pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.waterButtonText}>💧 {busy ? "در حال ثبت..." : cooldown > 0 ? formatCountdown(cooldown) : "من آب خوردم"}</Text>
            </Pressable>
            <Text style={[styles.status, { color: colors.muted }]}>{statusText}</Text>
            {error ? <ErrorBox colors={colors} message={error} /> : null}
          </View>
        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={celebrate} onRequestClose={() => setCelebrate(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.celebrationCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
            <Text style={styles.celebrationIcon}>💧</Text>
            <Text style={[styles.celebrationEyebrow, { color: colors.accentStrong }]}>هدف امروز تکمیل شد</Text>
            <Text style={[styles.celebrationTitle, { color: colors.text }]}>۸ / ۸</Text>
            <Text style={[styles.celebrationText, { color: colors.muted }]}>{CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]}</Text>
            <SecondaryButton colors={colors} label="عالیه ✨" onPress={() => setCelebrate(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 24, paddingBottom: 30 },
  hero: { minHeight: 610, alignItems: "center", justifyContent: "center", gap: 28 },
  intro: { alignItems: "center", gap: 6 },
  greeting: { fontSize: 15, fontWeight: "900", writingDirection: "rtl" },
  title: { fontSize: 31, fontWeight: "900", letterSpacing: -0.9, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center" },
  progressWrap: { width: "100%", maxWidth: 320, alignItems: "center", gap: 16 },
  progressCircle: { width: 238, height: 238, borderRadius: 119, borderWidth: 12, alignItems: "center", justifyContent: "center", shadowColor: "#000000", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  count: { fontSize: 70, fontWeight: "900", lineHeight: 76, letterSpacing: -3 },
  goal: { fontSize: 20, fontWeight: "800", marginTop: -3 },
  glassLabel: { fontSize: 13, marginTop: 4 },
  percent: { fontSize: 13, fontWeight: "900", marginTop: 2 },
  track: { width: "100%", height: 10, borderRadius: 99, overflow: "hidden", flexDirection: "row-reverse" },
  trackValue: { height: "100%", borderRadius: 99 },
  actionArea: { width: "100%", maxWidth: 420, alignItems: "stretch", gap: 9 },
  waterButton: { minHeight: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, shadowColor: "#188fd4", shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  waterButtonText: { color: "white", fontSize: 17, fontWeight: "900" },
  status: { fontSize: 13, textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(6,25,36,0.58)", alignItems: "center", justifyContent: "center", padding: 20 },
  celebrationCard: { width: "100%", maxWidth: 410, borderWidth: 1, borderRadius: 30, padding: 26, alignItems: "stretch" },
  celebrationIcon: { fontSize: 42, textAlign: "center", marginBottom: 10 },
  celebrationEyebrow: { textAlign: "center", fontSize: 13, fontWeight: "900" },
  celebrationTitle: { textAlign: "center", fontSize: 46, fontWeight: "900", marginTop: 4 },
  celebrationText: { textAlign: "center", fontSize: 14, lineHeight: 23, marginTop: 5, marginBottom: 20 },
});
