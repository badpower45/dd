import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const screenWidth = Dimensions.get("window").width;

interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor?: string;
}

interface BarChartData {
    labels: string[];
    datasets: Array<{ data: number[] }>;
}

export function OrdersPieChart({ data }: { data: PieChartData[] }) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <ThemedText type="h4" style={styles.title}>
                توزيع الطلبات
            </ThemedText>
            <PieChart
                data={data}
                width={screenWidth - Spacing.lg * 2}
                height={220}
                chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
            />
        </View>
    );
}

export function PerformanceBarChart({
    title,
    data,
}: {
    title: string;
    data: BarChartData;
}) {
    const { theme } = useTheme();

    const chartConfig = {
        backgroundColor: theme.backgroundDefault,
        backgroundGradientFrom: theme.backgroundSecondary,
        backgroundGradientTo: theme.backgroundSecondary,
        decimalPlaces: 0,
        color: (opacity = 1) => theme.primary,
        labelColor: (opacity = 1) => theme.text,
        style: {
            borderRadius: BorderRadius.lg,
        },
        propsForLabels: {
            fontSize: 12,
        },
    };

    return (
        <View style={styles.container}>
            <ThemedText type="h4" style={styles.title}>
                {title}
            </ThemedText>
            <BarChart
                data={data}
                width={screenWidth - Spacing.lg * 2}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.md,
    },
    title: {
        marginBottom: Spacing.md,
    },
    chart: {
        borderRadius: BorderRadius.lg,
    },
});
