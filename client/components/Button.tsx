import React, { ReactNode } from "react";
import {
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { haptics } from "@/lib/haptics";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  loading = false,
  icon,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      haptics.light();
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case "secondary":
        return {
          bg: theme.backgroundSecondary,
          text: theme.text,
        };
      case "outline":
        return {
          bg: "transparent",
          text: theme.primary,
          border: theme.primary,
        };
      case "danger":
        return {
          bg: theme.danger,
          text: "#FFFFFF",
        };
      case "primary":
      default:
        return {
          bg: theme.primary,
          text: "#FFFFFF",
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border || "transparent",
          borderWidth: variant === "outline" ? 2 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === "primary" && Shadows.sm,
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: variantStyles.text }]}
          >
            {children}
          </ThemedText>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginLeft: Spacing.sm,
  },
  buttonText: {
    fontWeight: "600",
  },
});

