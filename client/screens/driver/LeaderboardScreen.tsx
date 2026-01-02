import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trophy, Star, TrendingUp, Award } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DriverRank {
  id: number;
  name: string;
  total_deliveries: number;
  average_rating: number;
  total_earnings: number;
  on_time_percentage: number;
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [drivers, setDrivers] = useState<DriverRank[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    // Sample data - will be replaced with real API
    setDrivers([
      {
        id: 1,
        name: "محمد أحمد",
        total_deliveries: 156,
        average_rating: 4.9,
        total_earnings: 12400,
        on_time_percentage: 98,
      },
      {
        id: 2,
        name: "أحمد محمود",
        total_deliveries: 142,
        average_rating: 4.8,
        total_earnings: 11300,
        on_time_percentage: 95,
      },
      {
        id: 3,
        name: "علي حسن",
        total_deliveries: 128,
        average_rating: 4.7,
        total_earnings: 10200,
        on_time_percentage: 92,
      },
    ]);
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return theme.textSecondary;
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
          🏆 لوحة الصدارة
        </ThemedText>

        <View style={styles.list}>
          {drivers.map((driver, index) => (
            <Pressable
              key={driver.id}
              style={({ pressed }) => [
                styles.driverCard,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              {/* Rank Badge */}
              <View style={styles.rankBadge}>
                {index < 3 ? (
                  <Trophy size={24} color={getMedalColor(index + 1)} />
                ) : (
                  <ThemedText type="h3" style={{ color: theme.textSecondary }}>
                    {index + 1}
                  </ThemedText>
                )}
              </View>

              {/* Driver Info */}
              <View style={styles.driverInfo}>
                <ThemedText type="h3">{driver.name}</ThemedText>

                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Star
                      size={14}
                      color={theme.warning}
                      fill={theme.warning}
                    />
                    <ThemedText type="small" style={{ marginLeft: 4 }}>
                      {driver.average_rating.toFixed(1)}
                    </ThemedText>
                  </View>

                  <View style={styles.stat}>
                    <TrendingUp size={14} color={theme.success} />
                    <ThemedText type="small" style={{ marginLeft: 4 }}>
                      {driver.total_deliveries} توصيلة
                    </ThemedText>
                  </View>

                  <View style={styles.stat}>
                    <Award size={14} color={theme.primary} />
                    <ThemedText type="small" style={{ marginLeft: 4 }}>
                      {driver.on_time_percentage}% في الوقت
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Earnings */}
              <View style={styles.earnings}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  الإجمالي
                </ThemedText>
                <ThemedText type="h4" style={{ color: theme.success }}>
                  {(driver.total_earnings / 100).toLocaleString("ar-EG")} ج.م
                </ThemedText>
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
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  title: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  list: {
    gap: Spacing.md,
  },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  rankBadge: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  driverInfo: {
    flex: 1,
  },
  stats: {
    flexDirection: "row",
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  earnings: {
    alignItems: "flex-end",
  },
});
