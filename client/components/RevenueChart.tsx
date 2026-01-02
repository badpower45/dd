import React, { useMemo } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

interface RevenueChartProps {
  data: ChartData;
  title?: string;
}

export function RevenueChart({
  data,
  title = "Revenue Trend",
}: RevenueChartProps) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  const chartConfig = useMemo(
    () => ({
      backgroundColor: theme.backgroundDefault,
      backgroundGradientFrom: theme.backgroundDefault,
      backgroundGradientTo: theme.backgroundSecondary,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
      labelColor: () => theme.text,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: theme.primary,
      },
      propsForBackgroundLines: {
        strokeDasharray: "",
        stroke: theme.border,
      },
    }),
    [theme],
  );

  return (
    <View style={styles.container}>
      {title && (
        <ThemedText type="h4" style={styles.title}>
          {title}
        </ThemedText>
      )}
      <LineChart
        data={data}
        width={screenWidth - Spacing.lg * 2}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines
        withVerticalLabels
        withHorizontalLabels
        withDots
        withShadow={false}
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
    marginLeft: Spacing.md,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: 16,
  },
});
