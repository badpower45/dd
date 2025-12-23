import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  I18nManager,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Truck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react-native";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const demoAccounts = [
  { email: "admin@demo.com", role: "مدير", icon: "👨‍💼", color: "#3B82F6" },
  { email: "dispatcher@demo.com", role: "مُنسق", icon: "📋", color: "#10B981" },
  { email: "restaurant@demo.com", role: "مطعم", icon: "🍽️", color: "#F59E0B" },
  { email: "driver@demo.com", role: "سائق", icon: "🚗", color: "#6366F1" },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    await signIn(email.trim(), password);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View
            style={[styles.logoWrapper, { backgroundColor: theme.primary }]}
          >
            <Truck size={40} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <ThemedText type="h1" style={[styles.appName, { color: theme.text }]}>
            ديليفر إيز
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.tagline, { color: theme.textSecondary }]}
          >
            بوابتك لإدارة التوصيل الذكي
          </ThemedText>
        </View>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
              ...Shadows.md,
            },
          ]}
        >
          <ThemedText
            type="h2"
            style={[styles.formTitle, { color: theme.text }]}
          >
            مرحباً بك مجدداً 👋
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.formSubtitle, { color: theme.textSecondary }]}
          >
            قم بتسجيل الدخول للمتابعة
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText
              type="small"
              style={[styles.label, { color: theme.textSecondary }]}
            >
              البريد الإلكتروني
            </ThemedText>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundSecondary,
                },
              ]}
            >
              <Mail
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText
              type="small"
              style={[styles.label, { color: theme.textSecondary }]}
            >
              كلمة المرور
            </ThemedText>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundSecondary,
                },
              ]}
            >
              <Lock
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="أدخل كلمة المرور"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textAlign="right"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.textSecondary} />
                )}
              </Pressable>
            </View>
          </View>

          <Button
            onPress={handleLogin}
            disabled={isLoading || !email.trim() || !password.trim()}
            style={[
              styles.loginButton,
              { backgroundColor: theme.primary, ...Shadows.sm },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText
                style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}
              >
                تسجيل الدخول
              </ThemedText>
            )}
          </Button>

          <Pressable style={styles.forgotPassword}>
            <ThemedText
              type="small"
              style={{ color: theme.link, fontWeight: "500" }}
            >
              نسيت كلمة المرور؟
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.demoSection}>
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ThemedText
              type="small"
              style={[
                styles.dividerText,
                {
                  color: theme.textSecondary,
                  backgroundColor: theme.backgroundRoot,
                },
              ]}
            >
              دخول سريع (تجريبي)
            </ThemedText>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          <View style={styles.demoGrid}>
            {demoAccounts.map((account) => (
              <Pressable
                key={account.email}
                style={({ pressed }) => [
                  styles.demoCard,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: pressed ? theme.primary : theme.border,
                    ...Shadows.sm,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                onPress={async () => {
                  await signIn(account.email, "demo123");
                }}
              >
                <View
                  style={[
                    styles.demoIconWrapper,
                    { backgroundColor: account.color + "15" },
                  ]}
                >
                  <ThemedText style={styles.demoIcon}>
                    {account.icon}
                  </ThemedText>
                </View>
                <ThemedText
                  type="small"
                  style={[styles.demoRole, { color: theme.text }]}
                >
                  {account.role}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary, fontSize: 10 }}
                >
                  تجربة الدور
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    transform: [{ rotate: "-5deg" }],
    ...Shadows.lg,
  },
  appName: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.8,
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
    textAlign: "right",
    paddingRight: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingHorizontal: Spacing.sm,
    writingDirection: "rtl",
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  loginButton: {
    marginTop: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  demoSection: {
    marginBottom: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
  },
  demoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "center",
  },
  demoCard: {
    width: "47%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
  },
  demoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  demoIcon: {
    fontSize: 24,
  },
  demoRole: {
    fontWeight: "600",
    marginBottom: 2,
  },
});
