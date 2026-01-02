import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users, TrendingUp, Package, DollarSign } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface CustomerInsight {
  id: number;
  phone_number: string;
  name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_at: string;
  preferred_restaurant: string;
}

export default function CustomerInsightsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [customers, setCustomers] = useState<CustomerInsight[]>([]);
  const [filter, setFilter] = useState<"all" | "vip" | "recent">("all");

  useEffect(() => {
    loadCustomers();
  }, [filter]);

  const loadCustomers = async () => {
    // Sample data - will be replaced with real API
    setCustomers([
      {
        id: 1,
        phone_number: "0501234567",
        name: "أحمد محمد",
        total_orders: 45,
        total_spent: 112500,
        average_order_value: 2500,
        last_order_at: new Date().toISOString(),
        preferred_restaurant: "مطعم الريف",
      },
      {
        id: 2,
        phone_number: "0509876543",
        name: "فاطمة علي",
        total_orders: 32,
        total_spent: 89600,
        average_order_value: 2800,
        last_order_at: new Date().toISOString(),
        preferred_restaurant: "مطعم النخيل",
      },
    ]);
  };

  const getCustomerType = (orders: number) => {
    if (orders >= 30) return { label: "VIP", color: theme.warning };
    if (orders >= 10) return { label: "مخلص", color: theme.success };
    return { label: "جديد", color: theme.textSecondary };
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
        <ThemedText type="h1" style={styles.title}>
          رؤى العملاء
        </ThemedText>

        {/* Filter Tabs */}
        <View style={styles.filters}>
          {(["all", "vip", "recent"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filter === f ? theme.primary : theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: filter === f ? "#FFFFFF" : theme.text,
                }}
              >
                {f === "all" ? "الكل" : f === "vip" ? "VIP" : "حديث"}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Users size={24} color={theme.primary} />
            <ThemedText type="h3" style={{ marginTop: Spacing.sm }}>
              {customers.length}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              إجمالي العملاء
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <TrendingUp size={24} color={theme.success} />
            <ThemedText type="h3" style={{ marginTop: Spacing.sm }}>
              {customers.reduce((sum, c) => sum + c.total_orders, 0)}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              مجموع الطلبات
            </ThemedText>
          </View>
        </View>

        {/* Customer List */}
        <View style={styles.list}>
          {customers.map((customer) => {
            const customerType = getCustomerType(customer.total_orders);
            return (
              <Pressable
                key={customer.id}
                style={({ pressed }) => [
                  styles.customerCard,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: theme.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.customerHeader}>
                  <View style={styles.customerInfo}>
                    <ThemedText type="h4">{customer.name}</ThemedText>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      {customer.phone_number}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: customerType.color + "20" },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{ color: customerType.color }}
                    >
                      {customerType.label}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.customerStats}>
                  <View style={styles.stat}>
                    <Package size={14} color={theme.textSecondary} />
                    <ThemedText type="small" style={{ marginLeft: 4 }}>
                      {customer.total_orders} طلب
                    </ThemedText>
                  </View>
                  <View style={styles.stat}>
                    <DollarSign size={14} color={theme.success} />
                    <ThemedText
                      type="small"
                      style={{ color: theme.success, marginLeft: 4 }}
                    >
                      {(customer.total_spent / 100).toLocaleString("ar-EG")} ج.م
                    </ThemedText>
                  </View>
                </View>

                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                >
                  المطعم المفضل: {customer.preferred_restaurant}
                </ThemedText>
              </Pressable>
            );
          })}
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
    marginBottom: Spacing.lg,
  },
  filters: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  list: {
    gap: Spacing.md,
  },
  customerCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  customerInfo: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  customerStats: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
});
