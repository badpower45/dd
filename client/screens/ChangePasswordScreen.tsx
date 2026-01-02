import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Key, Lock, Eye, EyeOff } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (): string | null => {
    if (!currentPassword) return "الرجاء إدخال كلمة المرور الحالية";
    if (!newPassword) return "الرجاء إدخال كلمة المرور الجديدة";
    if (newPassword.length < 8)
      return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    if (newPassword === currentPassword)
      return "كلمة المرور الجديدة يجب أن تكون مختلفة";
    if (newPassword !== confirmPassword) return "كلمات المرور غير متطابقة";
    return null;
  };

  const handleChangePassword = async () => {
    const error = validatePassword();
    if (error) {
      Alert.alert("خطأ", error);
      return;
    }

    try {
      // In production, call API to change password
      Alert.alert("نجح!", "تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Alert.alert("خطأ", "فشل تغيير كلمة المرور");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.primary + "20" },
          ]}
        >
          <Key size={48} color={theme.primary} />
        </View>

        <ThemedText type="h2" style={styles.title}>
          تغيير كلمة المرور
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          اختر كلمة مرور قوية لحماية حسابك
        </ThemedText>

        {/* Current Password */}
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            كلمة المرور الحالية
          </ThemedText>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <Lock size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              placeholder="********"
              placeholderTextColor={theme.textSecondary}
            />
            <Pressable onPress={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? (
                <EyeOff size={20} color={theme.textSecondary} />
              ) : (
                <Eye size={20} color={theme.textSecondary} />
              )}
            </Pressable>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            كلمة المرور الجديدة
          </ThemedText>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <Lock size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              placeholder="********"
              placeholderTextColor={theme.textSecondary}
            />
            <Pressable onPress={() => setShowNew(!showNew)}>
              {showNew ? (
                <EyeOff size={20} color={theme.textSecondary} />
              ) : (
                <Eye size={20} color={theme.textSecondary} />
              )}
            </Pressable>
          </View>

          {/* Password strength indicator */}
          {newPassword && (
            <View style={styles.strengthBar}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${(newPassword.length / 12) * 100}%`,
                    backgroundColor:
                      newPassword.length < 8
                        ? theme.danger
                        : newPassword.length < 12
                          ? theme.warning
                          : theme.success,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            تأكيد كلمة المرور
          </ThemedText>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <Lock size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="********"
              placeholderTextColor={theme.textSecondary}
            />
            <Pressable onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? (
                <EyeOff size={20} color={theme.textSecondary} />
              ) : (
                <Eye size={20} color={theme.textSecondary} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Requirements */}
        <View
          style={[
            styles.requirements,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            متطلبات كلمة المرور:
          </ThemedText>
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, marginTop: 4 }}
          >
            • 8 أحرف على الأقل{"\n"}• حرف كبير وحرف صغير{"\n"}• رقم واحد على
            الأقل
          </ThemedText>
        </View>

        <Button
          onPress={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword}
          style={{ marginTop: Spacing.xl }}
        >
          تغيير كلمة المرور
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["4xl"],
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  requirements: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
});
