import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Truck, Mail, Lock, Eye, EyeOff } from "lucide-react-native";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const demoAccounts = [
  { email: "admin@demo.com", role: "مدير", icon: "👨‍💼" },
  { email: "dispatcher@demo.com", role: "مُنسق", icon: "📋" },
  { email: "restaurant@demo.com", role: "مطعم", icon: "🍽️" },
  { email: "driver@demo.com", role: "سائق", icon: "🚗" },
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
            paddingTop: insets.top + Spacing["2xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={[styles.logoWrapper, { backgroundColor: theme.primary + "15" }]}>
            <Truck size={48} color={theme.primary} strokeWidth={1.5} />
          </View>
          <ThemedText type="h1" style={styles.appName}>
            ديليفر إيز
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.tagline, { color: theme.textSecondary }]}
          >
            نظام إدارة التوصيل الذكي
          </ThemedText>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={styles.formTitle}>
            تسجيل الدخول
          </ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              البريد الإلكتروني
            </ThemedText>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.backgroundRoot }]}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
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
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              كلمة المرور
            </ThemedText>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.backgroundRoot }]}>
              <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
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
            style={styles.loginButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              "دخول"
            )}
          </Button>

          <Pressable style={styles.forgotPassword}>
            <ThemedText type="small" style={{ color: theme.link }}>
              نسيت كلمة المرور؟
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.demoSection}>
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ThemedText type="small" style={[styles.dividerText, { color: theme.textSecondary, backgroundColor: theme.backgroundRoot }]}>
              حسابات تجريبية
            </ThemedText>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>
          
          <ThemedText
            type="caption"
            style={[styles.demoHint, { color: theme.textSecondary }]}
          >
            كلمة المرور: demo123
          </ThemedText>
          
          <View style={styles.demoGrid}>
            {demoAccounts.map((account) => (
              <Pressable
                key={account.email}
                style={[
                  styles.demoCard,
                  { 
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                  },
                ]}
                onPress={async () => {
                  await signIn(account.email, "demo123");
                }}
              >
                <ThemedText style={styles.demoIcon}>{account.icon}</ThemedText>
                <ThemedText type="small" style={styles.demoRole}>
                  {account.role}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, textAlign: "center" }}
          >
            بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </ThemedText>
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
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 60,
    height: 60,
  },
  appName: {
    marginBottom: Spacing.xs,
    fontSize: 32,
    fontWeight: "700",
  },
  tagline: {
    fontSize: 16,
  },
  formCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
    textAlign: "right",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
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
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  loginButton: {
    marginTop: Spacing.md,
    height: 56,
    borderRadius: BorderRadius.sm,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  demoSection: {
    marginBottom: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
  },
  demoHint: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  demoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  demoCard: {
    width: "47%",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
  },
  demoIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  demoRole: {
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    paddingVertical: Spacing.lg,
  },
});
