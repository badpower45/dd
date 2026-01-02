import React from "react";
import { StyleSheet, View, ViewStyle, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface SwipeAction {
  icon: React.ReactNode;
  label?: string;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeComplete?: (direction: "left" | "right") => void;
  style?: ViewStyle;
  threshold?: number;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export function SwipeableRow({
  children,
  leftAction,
  rightAction,
  onSwipeComplete,
  style,
  threshold = SWIPE_THRESHOLD,
}: SwipeableRowProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleLeftAction = () => {
    if (leftAction) {
      leftAction.onPress();
      onSwipeComplete?.("left");
    }
  };

  const handleRightAction = () => {
    if (rightAction) {
      rightAction.onPress();
      onSwipeComplete?.("right");
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newValue = startX.value + event.translationX;

      // Clamp based on available actions
      const maxRight = rightAction ? ACTION_WIDTH : 0;
      const maxLeft = leftAction ? -ACTION_WIDTH : 0;

      translateX.value = Math.max(maxLeft, Math.min(maxRight, newValue));

      // Trigger haptic when crossing threshold
      if (
        Math.abs(translateX.value) >= threshold &&
        Math.abs(startX.value) < threshold
      ) {
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd(() => {
      if (translateX.value >= threshold && rightAction) {
        translateX.value = withTiming(ACTION_WIDTH, { duration: 200 });
        runOnJS(handleRightAction)();
        // Reset after action
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      } else if (translateX.value <= -threshold && leftAction) {
        translateX.value = withTiming(-ACTION_WIDTH, { duration: 200 });
        runOnJS(handleLeftAction)();
        // Reset after action
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const progress = Math.max(0, -translateX.value / ACTION_WIDTH);
    return {
      opacity: progress,
      transform: [{ scale: 0.8 + progress * 0.2 }],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const progress = Math.max(0, translateX.value / ACTION_WIDTH);
    return {
      opacity: progress,
      transform: [{ scale: 0.8 + progress * 0.2 }],
    };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Left action (appears on right swipe) */}
      {leftAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.leftAction,
            { backgroundColor: leftAction.color },
            leftActionStyle,
          ]}
        >
          <Pressable style={styles.actionButton} onPress={handleLeftAction}>
            {leftAction.icon}
            {leftAction.label && (
              <ThemedText type="caption" style={styles.actionLabel}>
                {leftAction.label}
              </ThemedText>
            )}
          </Pressable>
        </Animated.View>
      )}

      {/* Right action (appears on left swipe) */}
      {rightAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.rightAction,
            { backgroundColor: rightAction.color },
            rightActionStyle,
          ]}
        >
          <Pressable style={styles.actionButton} onPress={handleRightAction}>
            {rightAction.icon}
            {rightAction.label && (
              <ThemedText type="caption" style={styles.actionLabel}>
                {rightAction.label}
              </ThemedText>
            )}
          </Pressable>
        </Animated.View>
      )}

      {/* Main content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.content,
            { backgroundColor: theme.backgroundDefault },
            rowStyle,
          ]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  content: {
    borderRadius: BorderRadius.lg,
    zIndex: 1,
  },
  actionContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
  },
  leftAction: {
    right: 0,
  },
  rightAction: {
    left: 0,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
  },
  actionLabel: {
    color: "#FFFFFF",
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
});
