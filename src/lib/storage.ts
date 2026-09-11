import * as SecureStore from "expo-secure-store";
import type { ThemeMode } from "../theme/colors";

const SESSION_KEY = "wt_mobile_session";
const THEME_KEY = "wt_mobile_theme";

export async function loadSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function saveSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function loadThemeMode(): Promise<ThemeMode | null> {
  const value = await SecureStore.getItemAsync(THEME_KEY);
  return value === "dark" || value === "light" ? value : null;
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await SecureStore.setItemAsync(THEME_KEY, mode);
}
