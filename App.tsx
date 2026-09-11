import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, useColorScheme, View } from "react-native";
import { AppShell, type TabKey } from "./src/components/AppShell";
import { apiRequest } from "./src/lib/api";
import { clearSessionToken, loadSessionToken, loadThemeMode, saveSessionToken, saveThemeMode } from "./src/lib/storage";
import { HomeScreen } from "./src/screens/HomeScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { LeaderboardScreen } from "./src/screens/LeaderboardScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { colorsFor, type ThemeMode } from "./src/theme/colors";
import type { User } from "./src/types";

type MeResponse = { success: true; user: User };

export default function App() {
  const systemScheme = useColorScheme();
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const colors = useMemo(() => colorsFor(themeMode), [themeMode]);

  useEffect(() => {
    async function bootstrap() {
      const [storedTheme, storedToken] = await Promise.all([loadThemeMode(), loadSessionToken()]);
      if (storedTheme) setThemeMode(storedTheme);
      if (!storedToken) {
        setBooting(false);
        return;
      }

      try {
        const result = await apiRequest<MeResponse>("/api/mobile/auth/me", { token: storedToken });
        if (!result.ok) {
          await clearSessionToken();
          setBooting(false);
          return;
        }
        setToken(storedToken);
        setUser((result.data as MeResponse).user);
      } catch {
        // Keep the stored token when the server is temporarily unreachable.
        // The welcome screen is not shown until we know the token is invalid.
        setToken(storedToken);
      } finally {
        setBooting(false);
      }
    }
    void bootstrap();
  }, []);

  async function authenticate(sessionToken: string) {
    await saveSessionToken(sessionToken);
    const result = await apiRequest<MeResponse>("/api/mobile/auth/me", { token: sessionToken });
    if (!result.ok) {
      await clearSessionToken();
      throw new Error("Session validation failed");
    }
    setToken(sessionToken);
    setUser((result.data as MeResponse).user);
    setActiveTab("home");
  }

  function unauthorized() {
    setToken(null);
    setUser(null);
    setActiveTab("home");
    void clearSessionToken();
  }

  async function logout() {
    if (token) {
      try {
        await apiRequest<{ success: true }>("/api/mobile/auth/logout", { method: "POST", token });
      } catch {
        // Local logout still proceeds if the network is unavailable.
      }
    }
    await clearSessionToken();
    setToken(null);
    setUser(null);
    setActiveTab("home");
  }

  async function changeTheme(mode: ThemeMode) {
    setThemeMode(mode);
    await saveThemeMode(mode);
  }

  if (booting) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
        <Text style={styles.bootIcon}>💧</Text>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.bootText, { color: colors.muted }]}>در حال آماده‌سازی آب‌یار...</Text>
      </View>
    );
  }

  if (!token || !user) {
    return (
      <>
        <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
        <WelcomeScreen colors={colors} onAuthenticated={authenticate} />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
      <AppShell colors={colors} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "home" ? <HomeScreen colors={colors} token={token} username={user.username} onUnauthorized={unauthorized} /> : null}
        {activeTab === "leaderboard" ? <LeaderboardScreen colors={colors} token={token} onUnauthorized={unauthorized} /> : null}
        {activeTab === "history" ? <HistoryScreen colors={colors} token={token} onUnauthorized={unauthorized} /> : null}
        {activeTab === "settings" ? (
          <SettingsScreen
            colors={colors}
            token={token}
            user={user}
            mode={themeMode}
            onThemeChange={changeTheme}
            onPinConfigured={() => setUser((current) => current ? { ...current, hasPin: true } : current)}
            onLogout={logout}
            onUnauthorized={unauthorized}
          />
        ) : null}
      </AppShell>
    </>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  bootIcon: { fontSize: 48 },
  bootText: { fontSize: 14, textAlign: "center" },
});
