import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

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
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.appName}>
            DeliverEase
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.tagline, { color: theme.textSecondary }]}
          >
            Delivery Management System
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Email
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Password
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <ThemedText type="small" style={{ color: theme.link }}>
                  {showPassword ? "Hide" : "Show"}
                </ThemedText>
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
              "Sign In"
            )}
          </Button>

          <Pressable style={styles.forgotPassword}>
            <ThemedText type="small" style={{ color: theme.link }}>
              Forgot Password?
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.demoSection}>
          <ThemedText
            type="small"
            style={[styles.demoTitle, { color: theme.textSecondary }]}
          >
            Demo Accounts (Password: demo123)
          </ThemedText>
          <View style={styles.demoAccounts}>
            {[
              { email: "admin@demo.com", role: "Admin" },
              { email: "dispatcher@demo.com", role: "Dispatcher" },
              { email: "restaurant@demo.com", role: "Restaurant" },
              { email: "driver@demo.com", role: "Driver" },
            ].map((account) => (
              <Pressable
                key={account.email}
                style={[
                  styles.demoAccount,
                  { backgroundColor: theme.backgroundDefault },
                ]}
                onPress={async () => {
                  await signIn(account.email, "demo123");
                }}
              >
                <ThemedText type="small" style={{ fontWeight: "600" }}>
                  {account.role}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  {account.email}
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
            By signing in, you agree to our Terms of Service and Privacy Policy
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
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  tagline: {},
  formContainer: {
    marginBottom: Spacing["2xl"],
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPasswordButton: {
    position: "absolute",
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  demoSection: {
    marginBottom: Spacing["2xl"],
  },
  demoTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  demoAccounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  demoAccount: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    minWidth: 140,
  },
  footer: {
    marginTop: "auto",
    paddingVertical: Spacing.lg,
  },
});
