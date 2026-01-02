import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Fingerprint, Shield } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface BiometricAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export function BiometricAuth({
  onSuccess,
  onCancel,
  title = "المصادقة البيومترية",
  subtitle = "استخدم بصمة الإصبع أو Face ID للمتابعة",
}: BiometricAuthProps) {
  const { theme } = useTheme();
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("");

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsAvailable(compatible && enrolled);

      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setBiometricType("Face ID");
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometricType("بصمة الإصبع");
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType("مسح القزحية");
      }
    } catch (error) {
      console.error("Biometric check error:", error);
      setIsAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        cancelLabel: "إلغاء",
        fallbackLabel: "استخدام كلمة المرور",
        disableDeviceFallback: false,
      });

      if (result.success) {
        onSuccess();
      } else {
        Alert.alert("فشلت المصادقة", "الرجاء المحاولة مرة أخرى");
      }
    } catch (error) {
      console.error("Biometric auth error:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء المصادقة");
    }
  };

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.danger + "20" },
          ]}
        >
          <Shield size={48} color={theme.danger} />
        </View>
        <ThemedText type="h4" style={styles.title}>
          المصادقة البيومترية غير متاحة
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          يرجى التأكد من تفعيل المصادقة البيومترية في إعدادات الجهاز
        </ThemedText>
        <Button onPress={onCancel} variant="outline">
          رجوع
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.primary + "20" },
        ]}
      >
        <Fingerprint size={64} color={theme.primary} />
      </View>

      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>

      <ThemedText
        type="body"
        style={[styles.subtitle, { color: theme.textSecondary }]}
      >
        {subtitle}
      </ThemedText>

      <View
        style={[
          styles.typeCard,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
        ]}
      >
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          نوع المصادقة المتاح:
        </ThemedText>
        <ThemedText type="h4" style={{ marginTop: 4 }}>
          {biometricType}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Button onPress={handleBiometricAuth} style={{ flex: 1 }}>
          المصادقة الآن
        </Button>
        <Button
          onPress={onCancel}
          variant="outline"
          style={{ flex: 1, marginRight: Spacing.md }}
        >
          إلغاء
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  typeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    width: "100%",
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
});
