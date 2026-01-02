import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, Filter, Download } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SearchBar } from "@/components/SearchBar";
import { FilterSheet } from "@/components/FilterSheet";
import { useTheme } from "@/hooks/useTheme";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { Order } from "@/lib/types";

export default function OrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  const loadOrders = async () => {
    // Load from API
    // const data = await api.orders.list();
    // setOrders(data);
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchQuery) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredOrders(filtered);
  };

  const handleExportExcel = async () => {
    try {
      await exportToExcel(filteredOrders, "order_history");
      Alert.alert("نجح!", "تم تصدير الطلبات إلى Excel");
    } catch (error) {
      Alert.alert("خطأ", "فشل تصدير الطلبات");
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportToCSV(filteredOrders, "order_history");
      Alert.alert("نجح!", "تم تصدير الطلبات إلى CSV");
    } catch (error) {
      Alert.alert("خطأ", "فشل تصدير الطلبات");
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
        <ThemedText type="h1" style={styles.title}>
          سجل الطلبات
        </ThemedText>

        {/* Search and Filters */}
        <View style={styles.controls}>
          <SearchBar placeholder="ابحث عن طلب..." onSearch={setSearchQuery} />

          <View style={styles.actions}>
            <Pressable
              onPress={() => setShowFilters(true)}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Filter size={20} color={theme.text} />
            </Pressable>

            <Pressable
              onPress={handleExportExcel}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: theme.success + "20",
                  borderColor: theme.success,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Download size={20} color={theme.success} />
              <ThemedText
                type="small"
                style={{ color: theme.success, marginLeft: 4 }}
              >
                Excel
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <StatCard
            label="إجمالي الطلبات"
            value={filteredOrders.length.toString()}
            color={theme.primary}
          />
          <StatCard
            label="المكتملة"
            value={filteredOrders
              .filter((o) => o.status === "delivered")
              .length.toString()}
            color={theme.success}
          />
          <StatCard
            label="الملغاة"
            value={filteredOrders
              .filter((o) => o.status === "cancelled")
              .length.toString()}
            color={theme.danger}
          />
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      </ScrollView>

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(filters) => {
          console.log("Filters:", filters);
          setShowFilters(false);
        }}
      />
    </ThemedView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <ThemedText type="h2" style={{ color }}>
        {value}
      </ThemedText>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.orderCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.orderHeader}>
        <ThemedText type="h4">#{order.id}</ThemedText>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status, theme) + "20" },
          ]}
        >
          <ThemedText
            type="caption"
            style={{ color: getStatusColor(order.status, theme) }}
          >
            {getStatusLabel(order.status)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="body" style={{ marginTop: Spacing.sm }}>
        {order.customerName}
      </ThemedText>
      <ThemedText
        type="caption"
        style={{ color: theme.textSecondary, marginTop: 4 }}
      >
        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
      </ThemedText>
    </Pressable>
  );
}

function getStatusColor(status: string, theme: any): string {
  const colors: Record<string, string> = {
    pending: theme.warning,
    assigned: theme.info,
    picked_up: theme.primary,
    delivered: theme.success,
    cancelled: theme.danger,
  };
  return colors[status] || theme.textSecondary;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    assigned: "تم التعيين",
    picked_up: "تم الاستلام",
    delivered: "تم التوصيل",
    cancelled: "ملغي",
  };
  return labels[status] || status;
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
  controls: {
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  ordersList: {
    gap: Spacing.md,
  },
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
});
