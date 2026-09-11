import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiRequest, messageFromError } from "../lib/api";
import type { AppColors } from "../theme/colors";
import { ErrorBox, PrimaryButton, SecondaryButton } from "../components/Common";

type Step = "username" | "register" | "login" | "legacy";

type CheckUsernameResponse = { exists: boolean; hasPin: boolean };
type AuthResponse = { success: true; username: string; sessionToken: string; expiresAt: string };

function normalizeUsername(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20).toLowerCase();
}

function normalizePin(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function WelcomeScreen({
  colors,
  onAuthenticated,
}: {
  colors: AppColors;
  onAuthenticated: (token: string) => Promise<void>;
}) {
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const validUsername = useMemo(() => /^[A-Za-z0-9_-]{3,20}$/.test(username), [username]);

  function resetUsername() {
    setStep("username");
    setPin("");
    setError("");
    setNotice("");
  }

  async function checkUsername() {
    if (!validUsername || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest<CheckUsernameResponse>("/api/auth/check-username", {
        method: "POST",
        body: { username },
      });
      if (!result.ok) {
        setError(messageFromError(result.data, "بررسی یوزرنیم انجام نشد."));
        return;
      }
      const data = result.data as CheckUsernameResponse;
      if (!data.exists) {
        setStep("register");
        setNotice("این یوزرنیم آزاده؛ یک پین ۶ رقمی انتخاب کن.");
      } else if (!data.hasPin) {
        setStep("legacy");
      } else {
        setStep("login");
        setNotice("حساب پیدا شد؛ پینت رو وارد کن.");
      }
    } catch {
      setError("اتصال به سرور برقرار نشد. آدرس API و اینترنت رو بررسی کن.");
    } finally {
      setBusy(false);
    }
  }

  async function authenticate() {
    if (pin.length !== 6 || busy) return;
    setBusy(true);
    setError("");
    try {
      const endpoint = step === "register" ? "/api/mobile/auth/register" : "/api/mobile/auth/login";
      const result = await apiRequest<AuthResponse>(endpoint, {
        method: "POST",
        body: { username, pin },
      });
      if (!result.ok) {
        setError(messageFromError(result.data, step === "register" ? "ساخت حساب انجام نشد." : "ورود انجام نشد."));
        return;
      }
      const data = result.data as AuthResponse;
      await onAuthenticated(data.sessionToken);
    } catch {
      setError("اتصال به سرور برقرار نشد. دوباره امتحان کن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <View style={[styles.orb, { backgroundColor: colors.accentFaint, borderColor: colors.line }]}>
            <Text style={styles.orbText}>💧</Text>
          </View>
          <Text style={[styles.eyebrow, { color: colors.accentStrong }]}>آب‌یار</Text>
          <Text style={[styles.title, { color: colors.text }]}>آب خوردن رو ساده نگه دار</Text>
          <Text style={[styles.lead, { color: colors.muted }]}>هر بار فقط یک لیوان؛ روند روزانه، تاریخچه و رتبه‌بندی همگام با نسخه وب.</Text>

          {step === "username" ? (
            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.text }]}>یوزرنیم</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surface2, borderColor: colors.line }]}>
                <Text style={[styles.prefix, { color: colors.muted }]}>@</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  onChangeText={(value) => setUsername(normalizeUsername(value))}
                  onSubmitEditing={checkUsername}
                  placeholder="username"
                  placeholderTextColor={colors.muted}
                  returnKeyType="next"
                  style={[styles.input, { color: colors.text }]}
                  value={username}
                />
              </View>
              <Text style={[styles.hint, { color: colors.muted }]}>۳ تا ۲۰ کاراکتر؛ حروف انگلیسی، عدد، _ یا -</Text>
              {error ? <ErrorBox colors={colors} message={error} /> : null}
              <PrimaryButton colors={colors} label={busy ? "در حال بررسی..." : "ادامه"} onPress={checkUsername} disabled={!validUsername || busy} />
            </View>
          ) : null}

          {step === "register" || step === "login" ? (
            <View style={styles.form}>
              <View style={[styles.identity, { backgroundColor: colors.accentFaint, borderColor: colors.line }]}>
                <Text style={[styles.identityLabel, { color: colors.muted }]}>حساب</Text>
                <Text style={[styles.identityValue, { color: colors.accentStrong }]}>@{username}</Text>
              </View>
              {notice ? <Text style={[styles.notice, { color: colors.accentStrong, backgroundColor: colors.accentFaint }]}>{notice}</Text> : null}
              <Text style={[styles.label, { color: colors.text }]}>{step === "register" ? "یک پین ۶ رقمی انتخاب کن" : "پینت رو وارد کن"}</Text>
              <TextInput
                autoFocus
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(value) => setPin(normalizePin(value))}
                onSubmitEditing={authenticate}
                placeholder="••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={[styles.pinInput, { backgroundColor: colors.surface2, borderColor: colors.line, color: colors.text }]}
                value={pin}
              />
              <Text style={[styles.hint, { color: colors.muted }]}>{pin.length.toLocaleString("fa-IR")}/۶ — فقط عدد</Text>
              {error ? <ErrorBox colors={colors} message={error} /> : null}
              <PrimaryButton
                colors={colors}
                label={busy ? (step === "register" ? "در حال ساخت حساب..." : "در حال ورود...") : (step === "register" ? "ساخت حساب" : "ورود")}
                onPress={authenticate}
                disabled={pin.length !== 6 || busy}
              />
              <SecondaryButton colors={colors} label="تغییر یوزرنیم" onPress={resetUsername} disabled={busy} />
            </View>
          ) : null}

          {step === "legacy" ? (
            <View style={styles.legacy}>
              <Text style={styles.legacyIcon}>🔐</Text>
              <Text style={[styles.legacyTitle, { color: colors.text }]}>این حساب هنوز پین ندارد</Text>
              <Text style={[styles.legacyText, { color: colors.muted }]}>برای جلوگیری از تصاحب حساب، ابتدا در همان مرورگری که Session قدیمی فعال است از بخش تنظیمات وب یک PIN تعیین کن؛ بعد می‌تونی از موبایل وارد شوی.</Text>
              <SecondaryButton colors={colors} label="یوزرنیم دیگری وارد کن" onPress={resetUsername} />
            </View>
          ) : null}
        </View>
        <Text style={[styles.foot, { color: colors.muted }]}>Session موبایل با Bearer Token روی سرور و SecureStore روی دستگاه مدیریت می‌شود.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 18, paddingVertical: 28 },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  orb: { width: 82, height: 82, borderRadius: 28, borderWidth: 1, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 16, transform: [{ rotate: "8deg" }] },
  orbText: { fontSize: 34, transform: [{ rotate: "-8deg" }] },
  eyebrow: { fontSize: 13, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  title: { fontSize: 30, fontWeight: "900", lineHeight: 40, textAlign: "center", letterSpacing: -0.8 },
  lead: { fontSize: 14, lineHeight: 23, textAlign: "center", marginTop: 10, marginBottom: 22 },
  form: { gap: 10 },
  label: { textAlign: "right", fontSize: 14, fontWeight: "800" },
  inputWrap: { minHeight: 56, borderRadius: 18, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  prefix: { fontSize: 16, fontWeight: "900", marginRight: 8 },
  input: { flex: 1, fontSize: 16, textAlign: "left", writingDirection: "ltr" },
  pinInput: { minHeight: 56, borderRadius: 18, borderWidth: 1, paddingHorizontal: 18, fontSize: 24, letterSpacing: 9, textAlign: "center", writingDirection: "ltr" },
  hint: { fontSize: 12, lineHeight: 19, textAlign: "right", marginBottom: 2 },
  identity: { borderWidth: 1, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  identityLabel: { fontSize: 12 },
  identityValue: { fontSize: 15, fontWeight: "900", writingDirection: "ltr" },
  notice: { borderRadius: 14, paddingVertical: 9, paddingHorizontal: 12, fontSize: 13, textAlign: "right", lineHeight: 20 },
  legacy: { gap: 12, alignItems: "center", paddingTop: 4 },
  legacyIcon: { fontSize: 36 },
  legacyTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  legacyText: { fontSize: 14, lineHeight: 24, textAlign: "center" },
  foot: { maxWidth: 460, alignSelf: "center", fontSize: 11, lineHeight: 18, textAlign: "center", marginTop: 14 },
});
