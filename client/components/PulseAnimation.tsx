import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

type PulseVariant = "dot" | "ring" | "glow";

interface PulseAnimationProps {
    color?: string;
    size?: number;
    variant?: PulseVariant;
    active?: boolean;
    style?: ViewStyle;
    children?: React.ReactNode;
}

export function PulseAnimation({
    color,
    size = 12,
    variant = "dot",
    active = true,
    style,
    children,
}: PulseAnimationProps) {
    const { theme } = useTheme();
    const pulseColor = color || theme.success;

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (active) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.3, { duration: 600, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
                ),
                -1,
                false
            );

            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.4, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                false
            );
        } else {
            scale.value = withTiming(1);
            opacity.value = withTiming(1);
        }
    }, [active]);

    const animatedRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value * 0.5,
    }));

    if (variant === "ring") {
        return (
            <View style={[styles.container, { width: size * 2, height: size * 2 }, style]}>
                <Animated.View
                    style={[
                        styles.ring,
                        {
                            width: size * 2,
                            height: size * 2,
                            borderRadius: size,
                            borderColor: pulseColor,
                        },
                        animatedRingStyle,
                    ]}
                />
                <View
                    style={[
                        styles.dot,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: pulseColor,
                        },
                    ]}
                />
                {children}
            </View>
        );
    }

    if (variant === "glow") {
        return (
            <View style={[styles.container, style]}>
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            width: size * 3,
                            height: size * 3,
                            borderRadius: size * 1.5,
                            backgroundColor: pulseColor,
                        },
                        animatedGlowStyle,
                    ]}
                />
                <View
                    style={[
                        styles.dot,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: pulseColor,
                        },
                    ]}
                />
                {children}
            </View>
        );
    }

    // Default: dot variant
    return (
        <Animated.View
            style={[
                styles.dot,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: pulseColor,
                },
                active && animatedRingStyle,
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
}

// Online status indicator
interface OnlineIndicatorProps {
    isOnline: boolean;
    size?: number;
    style?: ViewStyle;
}

export function OnlineIndicator({ isOnline, size = 10, style }: OnlineIndicatorProps) {
    const { theme } = useTheme();

    return (
        <PulseAnimation
            variant="ring"
            size={size}
            color={isOnline ? theme.success : theme.textSecondary}
            active={isOnline}
            style={style}
        />
    );
}

// Order status pulse
interface StatusPulseProps {
    status: "pending" | "assigned" | "picked_up" | "delivered" | "cancelled";
    size?: number;
    style?: ViewStyle;
}

const statusColors: Record<string, string> = {
    pending: "#F59E0B",
    assigned: "#3B82F6",
    picked_up: "#F97316",
    delivered: "#10B981",
    cancelled: "#EF4444",
};

export function StatusPulse({ status, size = 8, style }: StatusPulseProps) {
    const isActive = status === "pending" || status === "assigned" || status === "picked_up";

    return (
        <PulseAnimation
            variant="dot"
            size={size}
            color={statusColors[status]}
            active={isActive}
            style={style}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        position: "absolute",
    },
    ring: {
        position: "absolute",
        borderWidth: 2,
    },
    glow: {
        position: "absolute",
    },
});
