export type ThemeMode = "light" | "dark";

export type AppColors = {
  bg: string;
  bgSoft: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentFaint: string;
  ringTrack: string;
  danger: string;
  dangerSoft: string;
  success: string;
};

export const lightColors: AppColors = {
  bg: "#f5fbff",
  bgSoft: "#edf8ff",
  surface: "#ffffff",
  surface2: "#f7fbfe",
  text: "#123047",
  muted: "#688295",
  line: "#dcebf3",
  accent: "#3ca8e8",
  accentStrong: "#188fd4",
  accentSoft: "#dff4ff",
  accentFaint: "#effaff",
  ringTrack: "#dfeef6",
  danger: "#c95555",
  dangerSoft: "#fff1f1",
  success: "#268d68"
};

export const darkColors: AppColors = {
  bg: "#09151d",
  bgSoft: "#0d1d27",
  surface: "#10232e",
  surface2: "#132833",
  text: "#ecf8ff",
  muted: "#9ab4c3",
  line: "#29404c",
  accent: "#56bcf0",
  accentStrong: "#75cbf6",
  accentSoft: "#15384a",
  accentFaint: "#0d2634",
  ringTrack: "#1d3a49",
  danger: "#ff8b8b",
  dangerSoft: "#351f24",
  success: "#76d6b2"
};

export function colorsFor(mode: ThemeMode): AppColors {
  return mode === "dark" ? darkColors : lightColors;
}
