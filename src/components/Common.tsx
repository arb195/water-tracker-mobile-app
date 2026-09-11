import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { AppColors } from "../theme/colors";

export function PageHeader({ colors, eyebrow, title, subtitle }: { colors: AppColors; eyebrow: string; title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <Text style={[styles.eyebrow, { color: colors.accentStrong }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
    </View>
  );
}

export function Surface({ colors, children, style }: { colors: AppColors; children: ReactNode; style?: object }) {
  return <View style={[styles.surface, { backgroundColor: colors.surface, borderColor: colors.line }, style]}>{children}</View>;
}

export function LoadingState({ colors, label = "در حال دریافت اطلاعات..." }: { colors: AppColors; label?: string }) {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.stateText, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ colors, icon, title, text }: { colors: AppColors; icon: string; title: string; text: string }) {
  return (
    <Surface colors={colors} style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>{text}</Text>
    </Surface>
  );
}

export function ErrorBox({ colors, message }: { colors: AppColors; message: string }) {
  return (
    <View style={[styles.errorBox, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}>
      <Text style={[styles.errorText, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

export function PrimaryButton({ colors, label, onPress, disabled = false }: { colors: AppColors; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.accentStrong, opacity: disabled ? 0.52 : pressed ? 0.86 : 1 },
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ colors, label, onPress, disabled = false }: { colors: AppColors; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        { backgroundColor: colors.accentFaint, borderColor: colors.line, opacity: disabled ? 0.5 : pressed ? 0.78 : 1 },
      ]}
    >
      <Text style={[styles.secondaryButtonText, { color: colors.accentStrong }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 22, alignItems: "flex-end" },
  eyebrow: { fontSize: 13, fontWeight: "800", marginBottom: 6, textAlign: "right" },
  title: { fontSize: 30, fontWeight: "900", letterSpacing: -0.8, textAlign: "right" },
  subtitle: { fontSize: 14, lineHeight: 23, marginTop: 7, textAlign: "right" },
  surface: { borderWidth: 1, borderRadius: 24, padding: 18 },
  centerState: { minHeight: 280, alignItems: "center", justifyContent: "center", gap: 14 },
  stateText: { fontSize: 14, textAlign: "center" },
  emptyState: { minHeight: 230, alignItems: "center", justifyContent: "center", borderStyle: "dashed", gap: 8 },
  emptyIcon: { fontSize: 34 },
  emptyTitle: { fontSize: 18, fontWeight: "900", textAlign: "center" },
  emptyText: { fontSize: 14, lineHeight: 23, textAlign: "center" },
  errorBox: { borderWidth: 1, borderRadius: 15, paddingVertical: 10, paddingHorizontal: 13, marginTop: 8 },
  errorText: { fontSize: 13, lineHeight: 20, textAlign: "right" },
  primaryButton: { minHeight: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { minHeight: 50, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  secondaryButtonText: { fontSize: 15, fontWeight: "800" },
});
