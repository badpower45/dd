import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate,
    Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

type SkeletonVariant = "text" | "card" | "avatar" | "button" | "custom";

interface SkeletonLoaderProps {
    variant?: SkeletonVariant;
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
    count?: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function SkeletonLoader({
    variant = "text",
    width,
    height,
    borderRadius,
    style,
    count = 1,
}: SkeletonLoaderProps) {
    const { theme } = useTheme();
    const shimmerPosition = useSharedValue(-1);

    useEffect(() => {
        shimmerPosition.value = withRepeat(
            withTiming(1, {
                duration: 1500,
                easing: Easing.bezier(0.4, 0, 0.6, 1),
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    shimmerPosition.value,
                    [-1, 1],
                    [-200, 200]
                ),
            },
        ],
    }));

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case "text":
                return {
                    width: (width || "100%") as any,
                    height: height || 16,
                    borderRadius: borderRadius ?? BorderRadius.xs,
                };
            case "card":
                return {
                    width: (width || "100%") as any,
                    height: height || 120,
                    borderRadius: borderRadius ?? BorderRadius.lg,
                };
            case "avatar":
                return {
                    width: (width || 48) as any,
                    height: height || 48,
                    borderRadius: borderRadius ?? BorderRadius.full,
                };
            case "button":
                return {
                    width: (width || "100%") as any,
                    height: height || Spacing.buttonHeight,
                    borderRadius: borderRadius ?? BorderRadius.lg,
                };
            default:
                return {
                    width: (width || 100) as any,
                    height: height || 20,
                    borderRadius: borderRadius ?? BorderRadius.sm,
                };
        }
    };

    const variantStyles = getVariantStyles();
    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <View style={[styles.container, count > 1 && styles.multiContainer]}>
            {items.map((index) => (
                <View
                    key={index}
                    style={[
                        styles.skeletonBase,
                        variantStyles,
                        { backgroundColor: theme.backgroundTertiary },
                        count > 1 && index < count - 1 && styles.itemSpacing,
                        style,
                    ]}
                >
                    <AnimatedLinearGradient
                        colors={[
                            "transparent",
                            `${theme.backgroundSecondary}80`,
                            "transparent",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[styles.shimmer, animatedStyle]}
                    />
                </View>
            ))}
        </View>
    );
}

// Pre-built skeleton patterns for common use cases
export function OrderCardSkeleton() {
    const { theme } = useTheme();

    return (
        <View style={[styles.orderCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.orderCardHeader}>
                <SkeletonLoader variant="text" width={120} height={14} />
                <SkeletonLoader variant="custom" width={70} height={24} borderRadius={12} />
            </View>
            <SkeletonLoader variant="text" width="80%" height={12} style={{ marginTop: 12 }} />
            <SkeletonLoader variant="text" width="60%" height={12} style={{ marginTop: 8 }} />
            <View style={styles.orderCardFooter}>
                <SkeletonLoader variant="text" width={80} height={20} />
                <SkeletonLoader variant="text" width={60} height={14} />
            </View>
        </View>
    );
}

export function StatsCardSkeleton() {
    const { theme } = useTheme();

    return (
        <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}>
            <SkeletonLoader variant="avatar" width={40} height={40} />
            <View style={styles.statsContent}>
                <SkeletonLoader variant="text" width={60} height={24} />
                <SkeletonLoader variant="text" width={80} height={12} style={{ marginTop: 4 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
    },
    multiContainer: {
        gap: Spacing.sm,
    },
    skeletonBase: {
        overflow: "hidden",
        position: "relative",
    },
    shimmer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 200,
    },
    itemSpacing: {
        marginBottom: Spacing.sm,
    },
    orderCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
    },
    orderCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderCardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: Spacing.lg,
    },
    statsCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    statsContent: {
        flex: 1,
    },
});
