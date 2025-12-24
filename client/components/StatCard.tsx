import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface StatCardProps {
    value: string | number;
    label: string;
    icon: React.ReactNode;
    iconColor?: string;
    iconBgColor?: string;
    delay?: number;
    style?: ViewStyle;
}

export function StatCard({
    value,
    label,
    icon,
    iconColor,
    iconBgColor,
    delay = 0,
    style,
}: StatCardProps) {
    const { theme } = useTheme();

    const bgColor = iconBgColor || `${iconColor || theme.primary}15`;

    return (
        <Animated.View
            entering={FadeInUp.duration(400).delay(delay)}
            style={[
                styles.container,
                {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                },
                Shadows.sm,
                style,
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                {icon}
            </View>
            <ThemedText type="h2" style={styles.value}>
                {typeof value === "number" ? value.toLocaleString("ar-EG") : value}
            </ThemedText>
            <ThemedText
                type="small"
                style={[styles.label, { color: theme.textSecondary }]}
            >
                {label}
            </ThemedText>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: "center",
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.sm,
    },
    value: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: Spacing.xs,
    },
    label: {
        textAlign: "center",
    },
});
