import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Lock, Smartphone } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TwoFactorSetupProps {
  onComplete: (secret: string) => void;
  onCancel: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [step, setStep] = useState<"intro" | "qr" | "verify">("intro");
  const [verificationCode, setVerificationCode] = useState("");
  const [secret] = useState(generateSecret());

  function generateSecret(): string {
    // In production, use a proper library like speakeasy
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < 16; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }

  const handleVerify = async () => {
    // In production, verify with backend
    if (verificationCode.length === 6) {
      onComplete(secret);
      Alert.alert("نجح!", "تم تفعيل المصادقة الثنائية بنجاح");
    } else {
      Alert.alert("خطأ", "الرمز غير صحيح");
    }
  };

  return (
    <ThemedView
      style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}
    >
      {step === "intro" && (
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <Shield size={48} color={theme.primary} />
          </View>

          <ThemedText type="h2" style={styles.title}>
            المصادقة الثنائية (2FA)
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.description, { color: theme.textSecondary }]}
          >
            أضف طبقة أمان إضافية لحسابك باستخدام المصادقة الثنائية. ستحتاج إلى
            رمز من تطبيق المصادقة عند تسجيل الدخول.
          </ThemedText>

          <View style={styles.features}>
            <FeatureItem
              icon={<Lock size={20} color={theme.success} />}
              title="حماية إضافية"
              description="حماية حسابك من الدخول غير المصرح به"
            />
            <FeatureItem
              icon={<Smartphone size={20} color={theme.success} />}
              title="سهل الاستخدام"
              description="استخدم Google Authenticator أو أي تطبيق مماثل"
            />
          </View>

          <View style={styles.buttons}>
            <Button onPress={() => setStep("qr")} style={{ flex: 1 }}>
              ابدأ الإعداد
            </Button>
            <Button
              onPress={onCancel}
              variant="secondary"
              style={{ flex: 1, marginRight: Spacing.md }}
            >
              إلغاء
            </Button>
          </View>
        </View>
      )}

      {step === "qr" && (
        <View style={styles.content}>
          <ThemedText type="h3" style={styles.title}>
            امسح رمز QR
          </ThemedText>

          <View
            style={[
              styles.qrPlaceholder,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              [QR Code]
            </ThemedText>
            <ThemedText
              type="small"
              style={{ marginTop: Spacing.md, textAlign: "center" }}
            >
              في التطبيق الفعلي، سيظهر رمز QR هنا
            </ThemedText>
          </View>

          <ThemedText
            type="caption"
            style={[styles.description, { color: theme.textSecondary }]}
          >
            أو أدخل المفتاح يدوياً:
          </ThemedText>

          <View
            style={[
              styles.secretBox,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText type="body" style={{ fontFamily: "mono" }}>
              {secret}
            </ThemedText>
          </View>

          <Button
            onPress={() => setStep("verify")}
            style={{ marginTop: Spacing.xl }}
          >
            التالي
          </Button>
        </View>
      )}

      {step === "verify" && (
        <View style={styles.content}>
          <ThemedText type="h3" style={styles.title}>
            تأكيد الإعداد
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.description, { color: theme.textSecondary }]}
          >
            أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة:
          </ThemedText>

          <TextInput
            style={[
              styles.codeInput,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={theme.textSecondary}
          />

          <View style={styles.buttons}>
            <Button
              onPress={handleVerify}
              disabled={verificationCode.length !== 6}
              style={{ flex: 1 }}
            >
              تأكيد
            </Button>
            <Button
              onPress={() => setStep("qr")}
              variant="secondary"
              style={{ flex: 1, marginRight: Spacing.md }}
            >
              رجوع
            </Button>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureText}>
        <ThemedText type="h4">{title}</ThemedText>
        <ThemedText
          type="caption"
          style={{ color: theme.textSecondary, marginTop: 4 }}
        >
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  features: {
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: Spacing.xl,
  },
  secretBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  codeInput: {
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 24,
    textAlign: "center",
    fontFamily: "mono",
    marginVertical: Spacing.xl,
  },
  buttons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: "auto",
  },
});
