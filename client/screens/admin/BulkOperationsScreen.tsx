import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckSquare, Square, Trash2, Send, Users } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { Order } from "@/lib/types";

export default function BulkOperationsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    // Load from API
    // setOrders(data);
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === orders.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
      setSelectAll(true);
    }
  };

  const handleBulkAssign = () => {
    if (selectedIds.size === 0) {
      Alert.alert("تنبيه", "الرجاء اختيار طلب واحد على الأقل");
      return;
    }

    Alert.alert("تعيين جماعي", `هل تريد تعيين ${selectedIds.size} طلب لسائق؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تعيين",
        onPress: async () => {
          // Bulk assign logic
          Alert.alert("نجح!", `تم تعيين ${selectedIds.size} طلب`);
          setSelectedIds(new Set());
          setSelectAll(false);
        },
      },
    ]);
  };

  const handleBulkCancel = () => {
    if (selectedIds.size === 0) {
      Alert.alert("تنبيه", "الرجاء اختيار طلب واحد على الأقل");
      return;
    }

    Alert.alert("إلغاء جماعي", `هل تريد إلغاء ${selectedIds.size} طلب؟`, [
      { text: "رجوع", style: "cancel" },
      {
        text: "إلغاء الطلبات",
        style: "destructive",
        onPress: async () => {
          // Bulk cancel logic
          Alert.alert("نجح!", `تم إلغاء ${selectedIds.size} طلب`);
          setSelectedIds(new Set());
          setSelectAll(false);
        },
      },
    ]);
  };

  const handleBulkNotify = () => {
    if (selectedIds.size === 0) {
      Alert.alert("تنبيه", "الرجاء اختيار طلب واحد على الأقل");
      return;
    }

    Alert.alert(
      "إرسال إشعارات",
      `سيتم إرسال إشعار لـ ${selectedIds.size} عميل`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إرسال",
          onPress: async () => {
            // Send notifications
            Alert.alert("نجح!", "تم إرسال الإشعارات");
            setSelectedIds(new Set());
            setSelectAll(false);
          },
        },
      ],
    );
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
          عمليات جماعية
        </ThemedText>

        {/* Selection Header */}
        <View
          style={[
            styles.selectionHeader,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Pressable onPress={toggleSelectAll} style={styles.selectAllRow}>
            {selectAll ? (
              <CheckSquare size={24} color={theme.primary} />
            ) : (
              <Square size={24} color={theme.textSecondary} />
            )}
            <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
              تحديد الكل ({selectedIds.size}/{orders.length})
            </ThemedText>
          </Pressable>
        </View>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <View style={styles.bulkActions}>
            <Button
              onPress={handleBulkAssign}
              icon={<Users size={18} color="#FFFFFF" />}
              style={{ flex: 1 }}
            >
              تعيين
            </Button>
            <Button
              onPress={handleBulkNotify}
              icon={<Send size={18} color="#FFFFFF" />}
              variant="outline"
              style={{ flex: 1, marginRight: Spacing.sm }}
            >
              إشعار
            </Button>
            <Button
              onPress={handleBulkCancel}
              icon={<Trash2 size={18} color="#FFFFFF" />}
              variant="danger"
              style={{ flex: 1, marginRight: Spacing.sm }}
            >
              إلغاء
            </Button>
          </View>
        )}

        {/* Orders List */}
        <View style={styles.ordersList}>
          {orders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => toggleSelect(order.id)}
              style={({ pressed }) => [
                styles.orderCard,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: selectedIds.has(order.id)
                    ? theme.primary
                    : theme.border,
                  borderWidth: selectedIds.has(order.id) ? 2 : 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={styles.orderRow}>
                {selectedIds.has(order.id) ? (
                  <CheckSquare size={20} color={theme.primary} />
                ) : (
                  <Square size={20} color={theme.textSecondary} />
                )}
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <ThemedText type="h4">#{order.id}</ThemedText>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    {order.customerName}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: theme.warning + "20" },
                  ]}
                >
                  <ThemedText type="caption" style={{ color: theme.warning }}>
                    {order.status}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
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
  selectionHeader: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bulkActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  ordersList: {
    gap: Spacing.md,
  },
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
});
