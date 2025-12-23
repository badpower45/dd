import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, I18nManager, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Package, DollarSign, Truck, ChevronLeft, Plus, TrendingUp } from "lucide-react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Stats {
  todayOrders: number;
  totalCollection: number;
  activeDeliveries: number;
}

// Simple stat card component
function StatCard({
  value,
  label,
  icon: Icon,
  color,
  delay = 0
}: {
  value: number | string;
  label: string;
  icon: any;
  color: string;
  delay?: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay)}
      style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <ThemedText type="h2" style={styles.statValue}>
        {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
      </ThemedText>
      <ThemedText type="small" style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
    </Animated.View>
  );
}

// Quick action button
function QuickAction({
  title,
  subtitle,
  icon: Icon,
  color,
  onPress,
  delay = 0
}: {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  onPress: () => void;
  delay?: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    haptics.light();
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(delay)}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.actionCard,
            { backgroundColor: theme.backgroundDefault },
            animatedStyle,
          ]}
        >
          <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.actionTextContainer}>
            <ThemedText type="h4">{title}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {subtitle}
            </ThemedText>
          </View>
          <ChevronLeft size={18} color={theme.textSecondary} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
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
    if (!user?.id) return;
    try {
      const data = await api.analytics.getRestaurantStats(user.id);
      setStats(data);
    } catch (error) {
      console.log("Failed to fetch stats", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (value: number) => {
    return `${(value / 100).toFixed(0)} ج.م`;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
      >
        <View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            مرحباً 👋
          </ThemedText>
          <ThemedText type="h2">{user?.fullName || 'المطعم'}</ThemedText>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Stat - Total Collection */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={[styles.heroCard, { backgroundColor: theme.primary }]}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <TrendingUp size={20} color="#FFFFFF" />
            </View>
            <ThemedText type="small" style={styles.heroLabel}>
              إجمالي التحصيلات
            </ThemedText>
          </View>
          <ThemedText type="h1" style={styles.heroValue}>
            {loading ? '...' : formatCurrency(stats?.totalCollection || 0)}
          </ThemedText>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            value={loading ? '-' : (stats?.todayOrders || 0)}
            label="طلبات اليوم"
            icon={Package}
            color={theme.info}
            delay={200}
          />
          <StatCard
            value={loading ? '-' : (stats?.activeDeliveries || 0)}
            label="جاري التوصيل"
            icon={Truck}
            color={theme.warning}
            delay={300}
          />
        </View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            الإجراءات السريعة
          </ThemedText>
        </Animated.View>

        <QuickAction
          title="عرض الطلبات"
          subtitle="إدارة ومتابعة كل الطلبات"
          icon={Package}
          color={theme.primary}
          onPress={() => (navigation as any).navigate("OrdersTab")}
          delay={450}
        />

        <QuickAction
          title="طلب جديد"
          subtitle="إنشاء طلب توصيل"
          icon={Plus}
          color={theme.success}
          onPress={() => (navigation as any).navigate("CreateOrder")}
          delay={500}
        />
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
    paddingBottom: Spacing["4xl"],
  },
  // Hero card - main stat
  heroCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.9)',
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: Spacing.xs,
  },
  // Section
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  // Action cards
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
});
