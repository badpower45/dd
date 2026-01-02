import React from "react";
import { StyleSheet, View, ViewStyle, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

type GradientPreset =
  | "primary"
  | "success"
  | "warning"
  | "sunset"
  | "dark"
  | "custom";

interface GradientCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  gradient?: GradientPreset;
  customColors?: string[];
  glassmorphism?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const gradientPresets: Record<GradientPreset, string[]> = {
  primary: ["#0D9488", "#14B8A6", "#2DD4BF"], // Teal
  success: ["#059669", "#10B981", "#34D399"], // Emerald
  warning: ["#EA580C", "#F97316", "#FB923C"], // Orange
  sunset: ["#8B5CF6", "#A78BFA", "#C4B5FD"], // Purple sunset
  dark: ["#0F172A", "#1E293B", "#334155"], // Slate
  custom: ["#0891B2", "#06B6D4", "#22D3EE"], // Cyan
};

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GradientCard({
  children,
  title,
  subtitle,
  gradient = "primary",
  customColors,
  glassmorphism = false,
  onPress,
  style,
  icon,
}: GradientCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const colors = (customColors || gradientPresets[gradient]) as [
    string,
    string,
    ...string[],
  ];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const CardContent = () => (
    <>
      {(icon || title || subtitle) && (
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.headerText}>
            {title && (
              <ThemedText type="h4" style={styles.title}>
                {title}
              </ThemedText>
            )}
            {subtitle && (
              <ThemedText type="small" style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            )}
          </View>
        </View>
      )}
      {children}
    </>
  );

  if (glassmorphism) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        style={[styles.glassContainer, animatedStyle, style]}
      >
        <BlurView intensity={20} tint="dark" style={styles.blurView}>
          <View
            style={[
              styles.glassOverlay,
              { borderColor: "rgba(255,255,255,0.15)" },
            ]}
          >
            <CardContent />
          </View>
        </BlurView>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[animatedStyle, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientContainer, Shadows.md]}
      >
        <CardContent />
      </LinearGradient>
    </AnimatedPressable>
  );
}

// Stat Card variant with icon and value
interface StatGradientCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  gradient?: GradientPreset;
  onPress?: () => void;
}

export function StatGradientCard({
  value,
  label,
  icon,
  gradient = "primary",
  onPress,
}: StatGradientCardProps) {
  return (
    <GradientCard gradient={gradient} onPress={onPress} style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={styles.statIcon}>{icon}</View>
        <ThemedText type="h2" style={styles.statValue}>
          {value}
        </ThemedText>
        <ThemedText type="small" style={styles.statLabel}>
          {label}
        </ThemedText>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    overflow: "hidden",
  },
  glassContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.md,
  },
  blurView: {
    overflow: "hidden",
    borderRadius: BorderRadius.xl,
  },
  glassOverlay: {
    padding: Spacing.xl,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statCard: {
    minWidth: 140,
  },
  statContent: {
    alignItems: "center",
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statValue: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 28,
  },
  statLabel: {
    color: "rgba(255,255,255,0.85)",
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});
