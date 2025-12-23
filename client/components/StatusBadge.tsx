import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { StatusColors, Spacing, BorderRadius } from "@/constants/theme";
import { OrderStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  assigned: "تم التعيين",
  picked_up: "تم الاستلام",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = StatusColors[status];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <ThemedText type="caption" style={[styles.text, { color: colors.text }]}>
        {statusLabels[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  text: {
    fontWeight: "500",
  },
});
