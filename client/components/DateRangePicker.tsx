import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import { Calendar as CalendarIcon } from "lucide-react-native";
import { Calendar, DateData } from "react-native-calendars";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DateRangePickerProps {
    onSelectRange: (startDate: string, endDate: string) => void;
    initialStartDate?: string;
    initialEndDate?: string;
}

export function DateRangePicker({
    onSelectRange,
    initialStartDate,
    initialEndDate,
}: DateRangePickerProps) {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const [startDate, setStartDate] = useState<string | undefined>(
        initialStartDate,
    );
    const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);

    const handleDayPress = (day: DateData) => {
        if (!startDate || (startDate && endDate)) {
            // Start new selection
            setStartDate(day.dateString);
            setEndDate(undefined);
        } else {
            // Complete the range
            if (day.dateString < startDate) {
                setEndDate(startDate);
                setStartDate(day.dateString);
            } else {
                setEndDate(day.dateString);
            }
        }
    };

    const handleApply = () => {
        if (startDate && endDate) {
            onSelectRange(startDate, endDate);
            setVisible(false);
        }
    };

    const handleClear = () => {
        setStartDate(undefined);
        setEndDate(undefined);
    };

    const getMarkedDates = () => {
        if (!startDate) return {};

        const marked: any = {
            [startDate]: {
                startingDay: true,
                color: theme.primary,
                textColor: "#FFFFFF",
            },
        };

        if (endDate) {
            marked[endDate] = {
                endingDay: true,
                color: theme.primary,
                textColor: "#FFFFFF",
            };

            // Mark days in between
            const start = new Date(startDate);
            const end = new Date(endDate);
            const current = new Date(start);
            current.setDate(current.getDate() + 1);

            while (current < end) {
                const dateStr = current.toISOString().split("T")[0];
                marked[dateStr] = {
                    color: theme.primary + "40",
                    textColor: theme.text,
                };
                current.setDate(current.getDate() + 1);
            }
        }

        return marked;
    };

    return (
        <>
            <Pressable
                onPress={() => setVisible(true)}
                style={({ pressed }) => [
                    styles.trigger,
                    {
                        backgroundColor: theme.backgroundSecondary,
                        borderColor: theme.border,
                        opacity: pressed ? 0.7 : 1,
                    },
                ]}
            >
                <CalendarIcon size={20} color={theme.text} />
                <ThemedText type="small" style={{ marginLeft: Spacing.sm }}>
                    {startDate && endDate
                        ? `${startDate} - ${endDate}`
                        : "اختر فترة زمنية"}
                </ThemedText>
            </Pressable>

            <Modal
                visible={visible}
                animationType="slide"
                transparent
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}
                    >
                        <ThemedText type="h3" style={styles.modalTitle}>
                            اختر فترة زمنية
                        </ThemedText>

                        <Calendar
                            onDayPress={handleDayPress}
                            markingType="period"
                            markedDates={getMarkedDates()}
                            theme={{
                                backgroundColor: theme.backgroundDefault,
                                calendarBackground: theme.backgroundDefault,
                                textSectionTitleColor: theme.textSecondary,
                                selectedDayBackgroundColor: theme.primary,
                                selectedDayTextColor: "#FFFFFF",
                                todayTextColor: theme.primary,
                                dayTextColor: theme.text,
                                textDisabledColor: theme.textSecondary,
                                monthTextColor: theme.text,
                                arrowColor: theme.primary,
                            }}
                        />

                        <View style={styles.actions}>
                            <Button
                                onPress={handleClear}
                                variant="outline"
                                style={{ flex: 1 }}
                            >
                                مسح
                            </Button>
                            <Button
                                onPress={handleApply}
                                disabled={!startDate || !endDate}
                                style={{ flex: 1, marginRight: Spacing.md }}
                            >
                                تطبيق
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: Spacing.lg,
    },
    modalContent: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
    },
    modalTitle: {
        marginBottom: Spacing.lg,
        textAlign: "center",
    },
    actions: {
        flexDirection: "row",
        gap: Spacing.md,
        marginTop: Spacing.xl,
    },
});
