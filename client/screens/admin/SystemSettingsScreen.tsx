import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings2, Database, Shield, Bell, Globe } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function SystemSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    realtimeSync: true,
    offlineMode: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    autoBackup: true,
    debugMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    settingKey,
  }: {
    icon: any;
    title: string;
    description: string;
    settingKey: keyof typeof settings;
  }) => (
    <View
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.settingIcon}>
        <Icon size={20} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="h4">{title}</ThemedText>
        <ThemedText
          type="caption"
          style={{ color: theme.textSecondary, marginTop: 4 }}
        >
          {description}
        </ThemedText>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const ActionButton = ({
    icon: Icon,
    title,
    description,
    onPress,
    danger,
  }: {
    icon: any;
    title: string;
    description: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.settingIcon}>
        <Icon size={20} color={danger ? theme.danger : theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText
          type="h4"
          style={{ color: danger ? theme.danger : theme.text }}
        >
          {title}
        </ThemedText>
        <ThemedText
          type="caption"
          style={{ color: theme.textSecondary, marginTop: 4 }}
        >
          {description}
        </ThemedText>
      </View>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        <ThemedText type="h1" style={styles.title}>
          إعدادات النظام
        </ThemedText>

        {/* General Settings */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            عام
          </ThemedText>
          <SettingItem
            icon={Database}
            title="المزامنة التلقائية"
            description="مزامنة البيانات في الوقت الفعلي"
            settingKey="realtimeSync"
          />
          <SettingItem
            icon={Globe}
            title="وضع عدم الاتصال"
            description="حفظ العمليات عند انقطاع الاتصال"
            settingKey="offlineMode"
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            الإشعارات
          </ThemedText>
          <SettingItem
            icon={Bell}
            title="إشعارات Push"
            description="إشعارات فورية على الجهاز"
            settingKey="pushNotifications"
          />
          <SettingItem
            icon={Bell}
            title="إشعارات البريد الإلكتروني"
            description="إرسال الإشعارات عبر البريد"
            settingKey="emailNotifications"
          />
          <SettingItem
            icon={Bell}
            title="إشعارات SMS"
            description="إرسال الإشعارات عبر الرسائل القصيرة"
            settingKey="smsNotifications"
          />
        </View>

        {/* Maintenance */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            الصيانة
          </ThemedText>
          <SettingItem
            icon={Database}
            title="النسخ الاحتياطي التلقائي"
            description="نسخ احتياطي يومي للبيانات"
            settingKey="autoBackup"
          />
          <SettingItem
            icon={Settings2}
            title="وضع التطوير"
            description="عرض معلومات إضافية للمطورين"
            settingKey="debugMode"
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            إجراءات
          </ThemedText>
          <ActionButton
            icon={Database}
            title="نسخة احتياطية يدوية"
            description="إنشاء نسخة احتياطية الآن"
            onPress={() => console.log("Backup")}
          />
          <ActionButton
            icon={Database}
            title="استعادة البيانات"
            description="استعادة من نسخة احتياطية سابقة"
            onPress={() => console.log("Restore")}
          />
          <ActionButton
            icon={Settings2}
            title="مسح الذاكرة المؤقتة"
            description="حذف البيانات المؤقتة المحفوظة"
            onPress={() => console.log("Clear Cache")}
            danger
          />
        </View>
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
  title: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  settingIcon: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
});
