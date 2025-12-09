import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
  ScrollView,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
  X,
  Check,
  MapPin,
  Phone,
  DollarSign,
  User,
  Clock,
} from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { assignOrder } from "@/lib/storage";
import { Order, Profile } from "@/lib/types";
import { Spacing, BorderRadius } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const DEMO_DRIVERS: Profile[] = [
  {
    id: "driver-001",
    role: "driver",
    full_name: "محمد السائق",
    phone_number: "+966501234567",
  },
  {
    id: "driver-002",
    role: "driver",
    full_name: "أحمد الريس",
    phone_number: "+966502345678",
  },
  {
    id: "driver-003",
    role: "driver",
    full_name: "خالد المشرف",
    phone_number: "+966503456789",
  },
];

type RouteParams = {
  AssignOrder: { order: Order };
};

export default function AssignOrderScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "AssignOrder">>();
  const { theme } = useTheme();

  const order = route.params?.order;

  const [selectedDriver, setSelectedDriver] = useState<Profile | null>(null);
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = selectedDriver && deliveryWindow.trim();

  const handleAssign = async () => {
    if (!order || !selectedDriver || !deliveryWindow.trim()) return;

    setIsSubmitting(true);
    try {
      await assignOrder(order.id, selectedDriver.id, deliveryWindow.trim());
      Alert.alert("تم بنجاح", "تم تعيين الطلب للسائق", [
        { text: "حسناً", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "فشل في تعيين الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>الطلب غير موجود</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.md, borderBottomColor: theme.border },
        ]}
      >
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <X size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">تعيين الطلب</ThemedText>
        <Pressable
          style={[styles.headerButton, !isValid && { opacity: 0.5 }]}
          onPress={handleAssign}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.link} />
          ) : (
            <Check size={24} color={isValid ? theme.link : theme.textSecondary} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            ملخص الطلب
          </ThemedText>

          <View
            style={[styles.orderCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.orderRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="h3">{order.customer_name}</ThemedText>
              </View>
              <StatusBadge status={order.status} />
            </View>

            <View style={styles.detailRow}>
              <MapPin size={16} color={theme.textSecondary} />
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginLeft: Spacing.sm, flex: 1 }}
              >
                {order.customer_address}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Phone size={16} color={theme.textSecondary} />
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}
              >
                {order.phone_primary}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <DollarSign size={16} color={theme.link} />
              <ThemedText
                type="h4"
                style={{ color: theme.link, marginRight: Spacing.sm }}
              >
                {order.collection_amount.toFixed(2)} ر.س
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            اختر السائق
          </ThemedText>

          {DEMO_DRIVERS.map((driver) => (
            <Pressable
              key={driver.id}
              style={[
                styles.driverOption,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor:
                    selectedDriver?.id === driver.id
                      ? theme.link
                      : "transparent",
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedDriver(driver)}
            >
              <View
                style={[
                  styles.driverAvatar,
                  {
                    backgroundColor:
                      selectedDriver?.id === driver.id
                        ? theme.link
                        : theme.backgroundSecondary,
                  },
                ]}
              >
                <User
                  size={20}
                  color={selectedDriver?.id === driver.id ? "#FFFFFF" : theme.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {driver.full_name}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {driver.phone_number}
                </ThemedText>
              </View>
              {selectedDriver?.id === driver.id ? (
                <Check size={20} color={theme.link} />
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            وقت التوصيل
          </ThemedText>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Clock size={20} color={theme.textSecondary} />
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                  textAlign: "right",
                },
              ]}
              value={deliveryWindow}
              onChangeText={setDeliveryWindow}
              placeholder="مثال: ٦:٠٠ م - ٦:٣٠ م"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  driverOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: Spacing.md,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingLeft: 48,
    paddingRight: Spacing.md,
    fontSize: 16,
  },
});
