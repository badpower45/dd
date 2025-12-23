import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { X, Check, Search } from "lucide-react-native";
import * as Location from "expo-location";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { CustomerGeo } from "@/lib/types";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const CAIRO_FALLBACK: CustomerGeo = { lat: 30.0444, lng: 31.2357 };

const geocodeAddress = async (address: string): Promise<CustomerGeo> => {
  try {
    const results = await Location.geocodeAsync(address);
    if (results && results.length > 0) {
      return { lat: results[0].latitude, lng: results[0].longitude };
    }
    return CAIRO_FALLBACK;
  } catch (error) {
    console.log("Geocoding failed, using fallback:", error);
    return CAIRO_FALLBACK;
  }
};

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
  const [isSearching, setIsSearching] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState(false);

  const deliveryFee = 5.0;

  const handlePhoneChange = async (text: string) => {
    setPhonePrimary(text);
    if (text.length >= 10) {
      setIsSearching(true);
      try {
        const customer = await api.customers.lookup(text);
        if (customer) {
          setCustomerName(customer.name);
          setCustomerAddress(customer.address);
          setFoundCustomer(true);
        }
      } catch (error) {
        // Customer not found, ignore
        setFoundCustomer(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setFoundCustomer(false);
    }
  };

  const isValid =
    customerName.trim() &&
    customerAddress.trim() &&
    phonePrimary.trim() &&
    collectionAmount.trim();

  const handleSubmit = async () => {
    if (!user) return;
    if (!isValid) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      const customerGeo = await geocodeAddress(customerAddress.trim());

      // Send with correct field names matching the backend schema
      await api.orders.create({
        restaurantId: user.id,
        customerName: customerName.trim(),
        customerPhone: phonePrimary.trim(),  // Backend expects customerPhone
        deliveryAddress: customerAddress.trim(),  // Backend expects deliveryAddress
        deliveryLat: String(customerGeo.lat),  // Backend expects string
        deliveryLng: String(customerGeo.lng),  // Backend expects string
        collectionAmount: Math.round(parseFloat(collectionAmount) * 100) || 0,  // Convert to cents (integer)
        deliveryFee: 500,  // 5.00 in cents (integer)
      });
      navigation.goBack();
    } catch (error) {
      console.error("Order creation failed:", error);
      Alert.alert("خطأ", "فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <X size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">طلب جديد</ThemedText>
        <Pressable
          style={[styles.headerButton, !isValid && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.link} />
          ) : (
            <Check
              size={24}
              color={isValid ? theme.link : theme.textSecondary}
            />
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
            معلومات العميل
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              اسم العميل *
            </ThemedText>
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
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="أدخل اسم العميل"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              رقم الهاتف الأساسي *
            </ThemedText>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: theme.backgroundDefault,
                    borderColor: foundCustomer
                      ? Colors.light.success
                      : theme.border,
                    color: theme.text,
                    textAlign: "right",
                  },
                ]}
                value={phonePrimary}
                onChangeText={handlePhoneChange}
                placeholder="أدخل رقم الهاتف"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
              {isSearching ? (
                <ActivityIndicator
                  size="small"
                  color={theme.link}
                  style={styles.searchIcon}
                />
              ) : (
                <Search
                  size={20}
                  color={theme.textSecondary}
                  style={styles.searchIcon}
                />
              )}
            </View>
            {foundCustomer && (
              <ThemedText
                type="small"
                style={{ color: Colors.light.success, marginTop: 4 }}
              >
                تم العثور على العميل!
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              رقم الهاتف الثانوي
            </ThemedText>
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
              value={phoneSecondary}
              onChangeText={setPhoneSecondary}
              placeholder="اختياري"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            عنوان التوصيل
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              العنوان *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  color: theme.text,
                  textAlign: "right",
                },
              ]}
              value={customerAddress}
              onChangeText={setCustomerAddress}
              placeholder="أدخل عنوان التوصيل الكامل"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            تفاصيل الدفع
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              مبلغ التحصيل *
            </ThemedText>
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
              value={collectionAmount}
              onChangeText={setCollectionAmount}
              placeholder="٠.٠٠"
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
              رسوم التوصيل
            </ThemedText>
            <ThemedText type="h4">{deliveryFee.toFixed(2)} ر.س</ThemedText>
          </View>

          {collectionAmount ? (
            <View
              style={[styles.totalDisplay, { backgroundColor: theme.link }]}
            >
              <ThemedText type="small" style={{ color: "#FFFFFF" }}>
                الإجمالي
              </ThemedText>
              <ThemedText
                type="h3"
                style={{ color: "#FFFFFF", fontWeight: "700" }}
              >
                {(parseFloat(collectionAmount) + deliveryFee).toFixed(2)} ر.س
              </ThemedText>
            </View>
          ) : null}
        </View>

        <Button
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? "جاري الإنشاء..." : "إنشاء الطلب"}
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
  phoneInputContainer: {
    flexDirection: "row-reverse", // Because RTL layout, icon should be left (visually right in code due to row-reverse? No, row-reverse makes it right-to-left)
    // Wait, RTL is forced. "row" means left-to-right normally, but with RTL forced it swaps?
    // Actually, let's keep it simple.
    // It is safer to use flexDirection: "row" and let I18nManager handle it if enabled.
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 10, // In RTL this might be right. If not, we adjust.
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
