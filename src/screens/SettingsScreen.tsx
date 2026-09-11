import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { ErrorBox, PageHeader, PrimaryButton, Surface } from "../components/Common";
import { apiRequest, messageFromError } from "../lib/api";
import type { AppColors, ThemeMode } from "../theme/colors";
import type { User } from "../types";

function normalizePin(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function SettingsScreen({
  colors,
  token,
  user,
  mode,
  onThemeChange,
  onPinConfigured,
  onLogout,
  onUnauthorized,
}: {
  colors: AppColors;
  token: string;
  user: User;
  mode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => Promise<void>;
  onPinConfigured: () => void;
  onLogout: () => Promise<void>;
  onUnauthorized: () => void;
}) {
  const [pin, setPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function setupPin() {
    if (pin.length !== 6 || pinBusy) return;
    setPinBusy(true);
    setPinError("");
    setPinSuccess("");
    try {
      const result = await apiRequest<{ success: true }>("/api/mobile/auth/set-pin", {
        method: "POST",
        token,
        body: { pin },
      });
      if (result.status === 401) {
        onUnauthorized();
        return;
      }
      if (!result.ok) {
        setPinError(messageFromError(result.data, "تنظیم پین انجام نشد."));
        return;
      }
      setPin("");
      setPinSuccess("پین فعال شد؛ از این به بعد می‌تونی از دستگاه‌های دیگه هم وارد همین حساب بشی.");
      onPinConfigured();
    } catch {
      setPinError("اتصال به سرور برقرار نشد.");
    } finally {
      setPinBusy(false);
    }
  }

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <PageHeader colors={colors} eyebrow="شخصی‌سازی و حساب" title="تنظیمات" subtitle="ورود امن، ظاهر برنامه و مدیریت Session." />

      <View style={styles.stack}>
        <Surface colors={colors} style={styles.settingCard}>
          <View style={styles.settingTextWrap}>
            <Text style={[styles.settingLabel, { color: colors.muted }]}>نام کاربری</Text>
            <Text style={[styles.settingStrong, { color: colors.text }]}>@{user.username}</Text>
          </View>
          <Text style={[styles.badge, { color: colors.accentStrong, backgroundColor: colors.accentFaint }]}>فعال</Text>
        </Surface>

        <Surface colors={colors} style={styles.settingCard}>
          <View style={styles.settingTextWrap}>
            <Text style={[styles.settingLabel, { color: colors.muted }]}>ورود از دستگاه‌های دیگر</Text>
            <Text style={[styles.settingParagraph, { color: colors.muted }]}>{user.hasPin ? "پین ۶ رقمی برای این حساب فعال است." : "این حساب قدیمی هنوز پین ورود ندارد."}</Text>
          </View>
          <Text style={[styles.badge, { color: user.hasPin ? colors.accentStrong : colors.danger, backgroundColor: user.hasPin ? colors.accentFaint : colors.dangerSoft }]}>
            {user.hasPin ? "PIN فعال" : "نیاز به PIN"}
          </Text>
        </Surface>

        {!user.hasPin ? (
          <Surface colors={colors} style={styles.pinCard}>
            <Text style={[styles.pinEyebrow, { color: colors.accentStrong }]}>فعال‌سازی حساب قدیمی</Text>
            <Text style={[styles.pinTitle, { color: colors.text }]}>یک پین ۶ رقمی تنظیم کن</Text>
            <Text style={[styles.settingParagraph, { color: colors.muted }]}>این عملیات فقط با Session معتبر انجام می‌شود و PIN خام در دیتابیس ذخیره نمی‌شود.</Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => setPin(normalizePin(value))}
              placeholder="••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={[styles.pinInput, { backgroundColor: colors.surface2, borderColor: colors.line, color: colors.text }]}
              value={pin}
            />
            {pinError ? <ErrorBox colors={colors} message={pinError} /> : null}
            {pinSuccess ? <Text style={[styles.success, { color: colors.success, backgroundColor: colors.accentFaint }]}>{pinSuccess}</Text> : null}
            <PrimaryButton colors={colors} label={pinBusy ? "در حال فعال‌سازی..." : "فعال کردن PIN"} onPress={setupPin} disabled={pinBusy || pin.length !== 6} />
          </Surface>
        ) : null}

        <Surface colors={colors} style={styles.settingCard}>
          <View style={styles.settingTextWrap}>
            <Text style={[styles.settingLabel, { color: colors.muted }]}>حالت تاریک</Text>
            <Text style={[styles.settingParagraph, { color: colors.muted }]}>نمای آرام‌تر برای شب</Text>
          </View>
          <Switch
            value={mode === "dark"}
            onValueChange={(enabled) => void onThemeChange(enabled ? "dark" : "light")}
            trackColor={{ false: colors.ringTrack, true: colors.accent }}
            thumbColor={colors.surface}
          />
        </Surface>

        <Surface colors={colors} style={styles.aboutCard}>
          <View style={[styles.aboutIcon, { backgroundColor: colors.accentFaint }]}><Text style={styles.aboutIconText}>💧</Text></View>
          <View style={styles.aboutText}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>آب‌یار</Text>
            <Text style={[styles.settingParagraph, { color: colors.muted }]}>یک همراه مینیمال برای ساختن عادت نوشیدن آب. هدف پیش‌فرض هر روز ۸ لیوان است.</Text>
          </View>
        </Surface>

        <Pressable
          accessibilityRole="button"
          disabled={loggingOut}
          onPress={() => void logout()}
          style={({ pressed }) => [styles.logoutButton, { backgroundColor: colors.dangerSoft, borderColor: colors.danger, opacity: loggingOut ? 0.5 : pressed ? 0.78 : 1 }]}
        >
          <Text style={[styles.logoutText, { color: colors.danger }]}>{loggingOut ? "در حال خروج..." : "خروج از حساب"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 30 },
  stack: { gap: 11 },
  settingCard: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 15 },
  settingTextWrap: { flex: 1, alignItems: "flex-end", gap: 3 },
  settingLabel: { fontSize: 12, textAlign: "right" },
  settingStrong: { fontSize: 16, fontWeight: "900", writingDirection: "ltr" },
  settingParagraph: { fontSize: 12, lineHeight: 20, textAlign: "right" },
  badge: { fontSize: 11, fontWeight: "800", paddingVertical: 5, paddingHorizontal: 9, borderRadius: 99, overflow: "hidden" },
  pinCard: { gap: 9, alignItems: "stretch" },
  pinEyebrow: { fontSize: 12, fontWeight: "900", textAlign: "right" },
  pinTitle: { fontSize: 20, fontWeight: "900", textAlign: "right" },
  pinInput: { minHeight: 54, borderWidth: 1, borderRadius: 17, textAlign: "center", writingDirection: "ltr", fontSize: 22, letterSpacing: 8, paddingHorizontal: 14, marginTop: 6 },
  success: { borderRadius: 14, padding: 10, fontSize: 12, lineHeight: 20, textAlign: "right" },
  aboutCard: { flexDirection: "row-reverse", gap: 14, alignItems: "flex-start" },
  aboutIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  aboutIconText: { fontSize: 24 },
  aboutText: { flex: 1, alignItems: "flex-end", gap: 4 },
  aboutTitle: { fontSize: 17, fontWeight: "900" },
  logoutButton: { minHeight: 54, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 5 },
  logoutText: { fontSize: 15, fontWeight: "900" },
});
