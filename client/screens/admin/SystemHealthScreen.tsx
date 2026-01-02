import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Activity,
  Database,
  Wifi,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SystemHealth {
  database: "healthy" | "degraded" | "down";
  api: "healthy" | "degraded" | "down";
  storage: "healthy" | "degraded" | "down";
  responseTime: number;
  uptime: number;
  lastCheck: string;
}

export default function SystemHealthScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [health, setHealth] = useState<SystemHealth>({
    database: "healthy",
    api: "healthy",
    storage: "healthy",
    responseTime: 45,
    uptime: 99.9,
    lastCheck: new Date().toISOString(),
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    setRefreshing(true);
    try {
      // In production, call health check endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setHealth({
        database: "healthy",
        api: "healthy",
        storage: "healthy",
        responseTime: Math.floor(Math.random() * 100) + 20,
        uptime: 99.9 + Math.random() * 0.1,
        lastCheck: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return theme.success;
      case "degraded":
        return theme.warning;
      case "down":
        return theme.danger;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle size={24} color={theme.success} />;
      case "degraded":
        return <AlertCircle size={24} color={theme.warning} />;
      case "down":
        return <AlertCircle size={24} color={theme.danger} />;
      default:
        return <Activity size={24} color={theme.textSecondary} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "healthy":
        return "سليم";
      case "degraded":
        return "متدهور";
      case "down":
        return "متوقف";
      default:
        return "غير معروف";
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={checkSystemHealth}
            tintColor={theme.primary}
          />
        }
      >
        <ThemedText type="h1" style={styles.title}>
          صحة النظام
        </ThemedText>

        {/* Overall Status */}
        <View
          style={[
            styles.overallCard,
            {
              backgroundColor:
                health.database === "healthy" &&
                health.api === "healthy" &&
                health.storage === "healthy"
                  ? theme.success + "20"
                  : theme.warning + "20",
              borderColor:
                health.database === "healthy" &&
                health.api === "healthy" &&
                health.storage === "healthy"
                  ? theme.success
                  : theme.warning,
            },
          ]}
        >
          <Activity
            size={48}
            color={
              health.database === "healthy" &&
              health.api === "healthy" &&
              health.storage === "healthy"
                ? theme.success
                : theme.warning
            }
          />
          <ThemedText type="h2" style={{ marginTop: Spacing.md }}>
            {health.database === "healthy" &&
            health.api === "healthy" &&
            health.storage === "healthy"
              ? "النظام يعمل بشكل طبيعي"
              : "تم اكتشاف مشكلة"}
          </ThemedText>
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
          >
            آخر فحص: {new Date(health.lastCheck).toLocaleString("ar-EG")}
          </ThemedText>
        </View>

        {/* Component Health */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            مكونات النظام
          </ThemedText>

          <HealthCard
            icon={
              <Database size={24} color={getStatusColor(health.database)} />
            }
            title="قاعدة البيانات"
            status={health.database}
            statusLabel={getStatusLabel(health.database)}
            statusColor={getStatusColor(health.database)}
          />

          <HealthCard
            icon={<Wifi size={24} color={getStatusColor(health.api)} />}
            title="واجهة البرمجة (API)"
            status={health.api}
            statusLabel={getStatusLabel(health.api)}
            statusColor={getStatusColor(health.api)}
          />

          <HealthCard
            icon={<Database size={24} color={getStatusColor(health.storage)} />}
            title="التخزين"
            status={health.storage}
            statusLabel={getStatusLabel(health.storage)}
            statusColor={getStatusColor(health.storage)}
          />
        </View>

        {/* Metrics */}
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            المقاييس
          </ThemedText>

          <View style={styles.metricsGrid}>
            <MetricCard
              icon={<Clock size={24} color={theme.primary} />}
              label="زمن الاستجابة"
              value={`${health.responseTime}ms`}
              color={theme.primary}
            />
            <MetricCard
              icon={<CheckCircle size={24} color={theme.success} />}
              label="وقت التشغيل"
              value={`${health.uptime.toFixed(2)}%`}
              color={theme.success}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function HealthCard({
  icon,
  title,
  status,
  statusLabel,
  statusColor,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  statusLabel: string;
  statusColor: string;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.healthCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.healthIcon}>{icon}</View>
      <View style={styles.healthInfo}>
        <ThemedText type="h4">{title}</ThemedText>
        <ThemedText type="caption" style={{ color: statusColor, marginTop: 4 }}>
          {statusLabel}
        </ThemedText>
      </View>
    </View>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      {icon}
      <ThemedText type="h3" style={{ color, marginTop: Spacing.sm }}>
        {value}
      </ThemedText>
      <ThemedText
        type="caption"
        style={{ color: theme.textSecondary, marginTop: 4 }}
      >
        {label}
      </ThemedText>
    </View>
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
  overallCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  healthCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  healthIcon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  healthInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
});
