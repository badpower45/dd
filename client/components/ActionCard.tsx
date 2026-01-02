import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ChevronLeft } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { haptics } from "@/lib/haptics";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface ActionCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onPress: () => void;
  delay?: number;
  style?: ViewStyle;
}

export function ActionCard({
  title,
  subtitle,
  icon,
  iconBgColor,
  onPress,
  delay = 0,
  style,
}: ActionCardProps) {
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
    <Animated.View entering={FadeInUp.duration(400).delay(delay)} style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
            Shadows.sm,
            animatedStyle,
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconBgColor || `${theme.primary}15` },
            ]}
          >
            {icon}
          </View>
          <View style={styles.textContainer}>
            <ThemedText type="h4">{title}</ThemedText>
            {subtitle && (
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginTop: 2 }}
              >
                {subtitle}
              </ThemedText>
            )}
          </View>
          <ChevronLeft size={18} color={theme.textSecondary} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
});
