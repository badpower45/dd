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
import { X, Search, Phone, User, MapPin, Banknote } from "lucide-react-native";
import * as Location from "expo-location";
import MapView, { Marker, MapPressEvent } from "react-native-maps";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { CustomerGeo } from "@/lib/types";
import { Spacing, BorderRadius } from "@/constants/theme";

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
  const [collectionAmount, setCollectionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [customerGeo, setCustomerGeo] = useState<CustomerGeo | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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
        }
      } catch (error) {
      } finally {
        setIsSearching(false);
      }
    } else {
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("تنبيه", "إذن الموقع مطلوب لتحديد العنوان على الخريطة");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        lat: current.coords.latitude,
        lng: current.coords.longitude,
      };
      setCustomerGeo(coords);

      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        if (place) {
          const composed = [place.name, place.street, place.city, place.region]
            .filter(Boolean)
            .join(", ");
          if (composed) setCustomerAddress(composed);
        }
      } catch {
        // Ignore reverse geocode failure
      }
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحديد الموقع الحالي");
    } finally {
      setIsLocating(false);
    }
  };

  const handleGeocodeAddress = async () => {
    if (!customerAddress.trim()) {
      Alert.alert("تنبيه", "أدخل العنوان ثم اضغط تثبيت");
      return;
    }

    setIsLocating(true);
    try {
      const geo = await geocodeAddress(customerAddress.trim());
      setCustomerGeo(geo);
    } catch {
      Alert.alert("خطأ", "تعذر تثبيت العنوان، حاول مرة أخرى");
    } finally {
      setIsLocating(false);
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
      Alert.alert("تنبيه", "يرجى ملء جميع الحقول الإجبارية");
      return;
    }

    setIsSubmitting(true);
    try {
      const geo = customerGeo || (await geocodeAddress(customerAddress.trim()));

      await api.orders.create({
        restaurant_id: user.id,
        customer_name: customerName.trim(),
        customer_phone: phonePrimary.trim(),
        delivery_address: customerAddress.trim(),
        delivery_lat: String(geo.lat),
        delivery_lng: String(geo.lng),
        collection_amount: parseFloat(collectionAmount) || 0,
        delivery_fee: deliveryFee,
        status: "pending",
      });

      Alert.alert("نجاح", "تم إنشاء الطلب بنجاح");
      navigation.goBack();
    } catch (error) {
      console.error("Order creation failed:", error);
      Alert.alert("خطأ", "فشل في إنشاء الطلب. تأكد من اتصال الإنترنت.");
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
            backgroundColor: theme.backgroundDefault,
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
        <ThemedText type="h2">إنشاء طلب جديد</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <User size={20} color={theme.primary} />
            <ThemedText type="h3" style={styles.sectionTitle}>
              بيانات العميل
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              رقم الهاتف *
            </ThemedText>
            <View style={styles.inputWrapper}>
              <Phone
                size={18}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={phonePrimary}
                onChangeText={handlePhoneChange}
                placeholder="05xxxxxxxx"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
                textAlign="right"
              />
              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={theme.primary}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              اسم العميل *
            </ThemedText>
            <View style={styles.inputWrapper}>
              <User
                size={18}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="اسم العميل الثلاثي"
                placeholderTextColor={theme.textSecondary}
                textAlign="right"
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={theme.primary} />
            <ThemedText type="h3" style={styles.sectionTitle}>
              العنوان
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              تفاصيل العنوان *
            </ThemedText>
            <View
              style={[
                styles.inputWrapper,
                { height: 100, alignItems: "flex-start", paddingTop: 12 },
              ]}
            >
              <MapPin
                size={18}
                color={theme.textSecondary}
                style={[styles.inputIcon, { marginTop: 2 }]}
              />
              <TextInput
                style={[styles.input, { color: theme.text, height: 80 }]}
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="الحي، الشارع، رقم المبنى..."
                placeholderTextColor={theme.textSecondary}
                multiline
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.mapActions}>
            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={handleUseCurrentLocation}
            >
              {isLocating ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <>
                  <MapPin size={18} color={theme.primary} />
                  <ThemedText
                    style={{
                      marginLeft: 6,
                      color: theme.primary,
                      fontWeight: "700",
                    }}
                  >
                    موقعي الحالي
                  </ThemedText>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={handleGeocodeAddress}
            >
              <Search size={18} color={theme.textSecondary} />
              <ThemedText
                style={{
                  marginLeft: 6,
                  color: theme.textSecondary,
                  fontWeight: "700",
                }}
              >
                تثبيت العنوان
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: customerGeo?.lat || CAIRO_FALLBACK.lat,
                longitude: customerGeo?.lng || CAIRO_FALLBACK.lng,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              region={
                customerGeo
                  ? {
                      latitude: customerGeo.lat,
                      longitude: customerGeo.lng,
                      latitudeDelta: 0.04,
                      longitudeDelta: 0.04,
                    }
                  : undefined
              }
              onPress={(event: MapPressEvent) => {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                setCustomerGeo({ lat: latitude, lng: longitude });
              }}
            >
              {customerGeo && (
                <Marker
                  coordinate={{
                    latitude: customerGeo.lat,
                    longitude: customerGeo.lng,
                  }}
                />
              )}
            </MapView>
            <ThemedText
              type="small"
              style={{ marginTop: 8, color: theme.textSecondary }}
            >
              اضغط على الخريطة لتثبيت موقع التوصيل، أو استخدم موقعي الحالي
            </ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Banknote size={20} color={theme.primary} />
            <ThemedText type="h3" style={styles.sectionTitle}>
              التكلفة
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              المبلغ المراد تحصيله *
            </ThemedText>
            <View style={styles.inputWrapper}>
              <Banknote
                size={18}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, fontSize: 18, fontWeight: "bold" },
                ]}
                value={collectionAmount}
                onChangeText={setCollectionAmount}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                textAlign="right"
              />
              <ThemedText style={{ marginLeft: 8, color: theme.textSecondary }}>
                ر.س
              </ThemedText>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={{ color: theme.textSecondary }}>
              رسوم التوصيل الثابتة
            </ThemedText>
            <ThemedText type="h4">{deliveryFee.toFixed(2)} ر.س</ThemedText>
          </View>

          <View
            style={[
              styles.summaryRow,
              styles.totalRow,
              { borderTopColor: theme.border },
            ]}
          >
            <ThemedText type="h3" style={{ color: theme.primary }}>
              الإجمالي
            </ThemedText>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {(parseFloat(collectionAmount || "0") + deliveryFee).toFixed(2)}{" "}
              ر.س
            </ThemedText>
          </View>
        </View>

        <Button
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
          style={[styles.submitButton, { height: 60 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            "تأكيد وإنشاء الطلب"
          )}
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
  card: {
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    color: "#64748B",
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 54,
    backgroundColor: "#F8FAFC",
  },
  inputIcon: {
    marginRight: 0,
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingHorizontal: Spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  totalRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  submitButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  mapContainer: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  map: {
    height: 200,
    width: "100%",
  },
  mapActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
});
