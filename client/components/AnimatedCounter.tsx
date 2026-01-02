import React, { useEffect } from "react";
import { StyleSheet, TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useDerivedValue,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

type FormatType = "number" | "currency" | "percentage";

interface AnimatedCounterProps {
  value: number;
  format?: FormatType;
  prefix?: string;
  suffix?: string;
  duration?: number;
  style?: TextStyle;
  textType?: "h1" | "h2" | "h3" | "h4" | "body" | "small";
  decimals?: number;
}

const formatValue = (
  value: number,
  format: FormatType,
  decimals: number,
  prefix?: string,
  suffix?: string,
): string => {
  let formatted: string;

  switch (format) {
    case "currency":
      formatted = value.toLocaleString("ar-EG", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      break;
    case "percentage":
      formatted = `${value.toFixed(decimals)}%`;
      break;
    default:
      formatted = value.toLocaleString("ar-EG", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
  }

  return `${prefix || ""}${formatted}${suffix || ""}`;
};

export function AnimatedCounter({
  value,
  format = "number",
  prefix,
  suffix,
  duration = 800,
  style,
  textType = "h2",
  decimals = 0,
}: AnimatedCounterProps) {
  const { theme } = useTheme();
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState("0");

  const springConfig = {
    damping: 15,
    mass: 0.5,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };

  useEffect(() => {
    animatedValue.value = withSpring(value, {
      ...springConfig,
      stiffness: (1000 / duration) * 100,
    });
  }, [value, duration]);

  useDerivedValue(() => {
    const interpolated = animatedValue.value;
    runOnJS(setDisplayValue)(
      formatValue(interpolated, format, decimals, prefix, suffix),
    );
  }, [animatedValue, format, decimals, prefix, suffix]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedValue.value,
      [0, value * 0.5, value],
      [0.8, 1.05, 1],
    );

    return {
      transform: [{ scale: Math.max(scale, 0.8) }],
    };
  });

  return (
    <Animated.View style={animatedTextStyle}>
      <ThemedText
        type={textType}
        style={[styles.counter, { color: theme.text }, style]}
      >
        {displayValue}
      </ThemedText>
    </Animated.View>
  );
}

// Convenience components
export function CurrencyCounter({
  value,
  style,
  ...props
}: Omit<AnimatedCounterProps, "format" | "suffix">) {
  return (
    <AnimatedCounter
      value={value}
      format="currency"
      suffix=" ج.م"
      style={style}
      {...props}
    />
  );
}

export function PercentageCounter({
  value,
  style,
  ...props
}: Omit<AnimatedCounterProps, "format">) {
  return (
    <AnimatedCounter
      value={value}
      format="percentage"
      decimals={1}
      style={style}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  counter: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
