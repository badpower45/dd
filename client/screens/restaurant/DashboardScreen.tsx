import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Package, DollarSign, Truck } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface Stats {
  todayOrders: number;
  totalCollection: number;
  activeDeliveries: number;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.analytics.getRestaurantStats();
      setStats(data);
    } catch (error) {
      console.log("Failed to fetch stats", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const renderStatCard = (
    title: string,
    value: string,
    icon: React.ReactNode,
    color: string,
  ) => (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        {icon}
      </View>
      <View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {title}
        </ThemedText>
        <ThemedText type="h2" style={{ color: theme.text }}>
          {value}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText type="h1">لوحة التحكم</ThemedText>
        <ThemedText style={{ color: theme.textSecondary }}>
          مرحبا، {user?.fullName}
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsGrid}>
          {renderStatCard(
            "طلبات اليوم",
            stats?.todayOrders.toString() || "0",
            <Package size={24} color={Colors.light.primary} />,
            Colors.light.primary,
          )}
          {renderStatCard(
            "جاري التوصيل",
            stats?.activeDeliveries.toString() || "0",
            <Truck size={24} color={Colors.light.warning} />,
            Colors.light.warning,
          )}
        </View>

        <View style={styles.fullWidthCard}>
          {renderStatCard(
            "إجمالي التحصيلات",
            `${stats?.totalCollection.toFixed(2) || "0.00"} ج.م`,
            <DollarSign size={24} color={Colors.light.success} />,
            Colors.light.success,
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            الوصول السريع
          </ThemedText>
          <Card onPress={() => (navigation as any).navigate("OrdersTab")}>
            <View style={styles.actionRow}>
              <Package size={20} color={theme.text} />
              <ThemedText style={{ marginLeft: Spacing.sm }}>
                عرض كل الطلبات
              </ThemedText>
            </View>
          </Card>
          <Card
            onPress={() => (navigation as any).navigate("CreateOrder")}
            style={{ marginTop: Spacing.md }}
          >
            <View style={styles.actionRow}>
              <Truck size={20} color={theme.text} />
              <ThemedText style={{ marginLeft: Spacing.sm }}>
                إنشاء طلب جديد
              </ThemedText>
            </View>
          </Card>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  content: {
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "solid",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  fullWidthCard: {
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
