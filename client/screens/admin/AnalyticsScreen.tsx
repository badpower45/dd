import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RevenueChart } from "@/components/RevenueChart";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "weekly",
  );

  // Sample data - will be replaced with real API data
  const revenueData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [1200, 1500, 980, 1700, 2100, 1800, 2300],
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const ordersData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [12, 15, 9, 17, 21, 18, 23],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
    ],
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
          التحليلات
        </ThemedText>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <View
              key={p}
              style={[
                styles.periodButton,
                {
                  backgroundColor:
                    period === p ? theme.primary : theme.backgroundSecondary,
                },
              ]}
              onTouchEnd={() => setPeriod(p)}
            >
              <ThemedText
                type="small"
                style={{
                  color: period === p ? "#FFFFFF" : theme.text,
                }}
              >
                {p === "daily" ? "يومي" : p === "weekly" ? "أسبوعي" : "شهري"}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Revenue Chart */}
        <RevenueChart title="الإيرادات" data={revenueData} />

        {/* Orders Chart */}
        <RevenueChart title="عدد الطلبات" data={ordersData} />

        {/* Stats Summary */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              متوسط الإيرادات اليومية
            </ThemedText>
            <ThemedText type="h2" style={{ marginTop: Spacing.xs }}>
              ١٬٦٥٠ ج.م
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              متوسط الطلبات اليومية
            </ThemedText>
            <ThemedText type="h2" style={{ marginTop: Spacing.xs }}>
              ١٦
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              معدل النمو
            </ThemedText>
            <ThemedText
              type="h2"
              style={{ marginTop: Spacing.xs, color: theme.success }}
            >
              +١٢٪
            </ThemedText>
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
  periodSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
    borderRadius: 12,
  },
});
