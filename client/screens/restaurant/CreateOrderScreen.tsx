import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { X, Check } from "lucide-react-native";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/storage";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function CreateOrderScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [phonePrimary, setPhonePrimary] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = 5.0;

  const isValid =
    customerName.trim() &&
    customerAddress.trim() &&
    phonePrimary.trim() &&
    collectionAmount.trim();

  const handleSubmit = async () => {
    if (!user) return;
    if (!isValid) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder(
        {
          customer_name: customerName.trim(),
          customer_address: customerAddress.trim(),
          phone_primary: phonePrimary.trim(),
          phone_secondary: phoneSecondary.trim() || undefined,
          collection_amount: parseFloat(collectionAmount) || 0,
        },
        user.id,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <ThemedText type="h3">New Order</ThemedText>
        <Pressable
          style={[styles.headerButton, !isValid && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.link} />
          ) : (
            <Check size={24} color={isValid ? theme.link : theme.textSecondary} />
          )}
        </Pressable>
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Customer Information
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Customer Name *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Primary Phone *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={phonePrimary}
              onChangeText={setPhonePrimary}
              placeholder="Enter phone number"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Secondary Phone
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={phoneSecondary}
              onChangeText={setPhoneSecondary}
              placeholder="Optional"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Delivery Address
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Address *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={customerAddress}
              onChangeText={setCustomerAddress}
              placeholder="Enter full delivery address"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Payment Details
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Collection Amount *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={collectionAmount}
              onChangeText={setCollectionAmount}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          <View
            style={[
              styles.feeDisplay,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Delivery Fee
            </ThemedText>
            <ThemedText type="h4">${deliveryFee.toFixed(2)}</ThemedText>
          </View>

          {collectionAmount ? (
            <View
              style={[styles.totalDisplay, { backgroundColor: theme.link }]}
            >
              <ThemedText type="small" style={{ color: "#FFFFFF" }}>
                Total
              </ThemedText>
              <ThemedText
                type="h3"
                style={{ color: "#FFFFFF", fontWeight: "700" }}
              >
                ${(parseFloat(collectionAmount) + deliveryFee).toFixed(2)}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <Button
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? "Creating..." : "Create Order"}
        </Button>
      </KeyboardAwareScrollViewCompat>
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
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    paddingVertical: Spacing.md,
  },
  feeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  totalDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xs,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
