import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  I18nManager,
} from "react-native";
import { X, Calendar, Filter as FilterIcon } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface FilterOptions {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  restaurantId?: number;
  driverId?: number;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export function FilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: FilterSheetProps) {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const statusOptions = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "assigned", label: "تم التعيين" },
    { value: "picked_up", label: "تم الاستلام" },
    { value: "delivered", label: "تم التوصيل" },
    { value: "cancelled", label: "ملغي" },
  ];

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <ThemedView
          style={[styles.sheet, { backgroundColor: theme.backgroundDefault }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="h3">تصفية الطلبات</ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Status Filter */}
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                الحالة
              </ThemedText>
              <View style={styles.chipContainer}>
                {statusOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        status:
                          prev.status === option.value
                            ? undefined
                            : option.value,
                      }))
                    }
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          filters.status === option.value
                            ? theme.primary
                            : theme.backgroundSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color:
                          filters.status === option.value
                            ? "#FFFFFF"
                            : theme.text,
                      }}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Amount Range */}
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                نطاق المبلغ
              </ThemedText>
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    من
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={filters.minAmount?.toString() || ""}
                    onChangeText={(text) =>
                      setFilters((prev) => ({
                        ...prev,
                        minAmount: text ? parseInt(text) : undefined,
                      }))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    إلى
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={filters.maxAmount?.toString() || ""}
                    onChangeText={(text) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxAmount: text ? parseInt(text) : undefined,
                      }))
                    }
                    keyboardType="numeric"
                    placeholder="∞"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleReset}
              style={[
                styles.button,
                styles.resetButton,
                { borderColor: theme.border },
              ]}
            >
              <ThemedText type="body">إعادة تعيين</ThemedText>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={[styles.button, { backgroundColor: theme.primary }]}
            >
              <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                تطبيق
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 15,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    borderWidth: 1,
  },
});
