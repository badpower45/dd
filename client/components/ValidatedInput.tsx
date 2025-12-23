import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ViewStyle, TextInputProps, I18nManager } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AlertCircle, Check } from 'lucide-react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface ValidatedInputProps extends Omit<TextInputProps, 'onChangeText'> {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    validator?: (value: string) => boolean;
    errorMessage?: string;
    required?: boolean;
    style?: ViewStyle;
}

export function ValidatedInput({
    label,
    value,
    onChangeText,
    validator,
    errorMessage = 'قيمة غير صحيحة',
    required = false,
    style,
    ...textInputProps
}: ValidatedInputProps) {
    const { theme } = useTheme();
    const [touched, setTouched] = useState(false);

    const isValid = !validator || validator(value);
    const showError = touched && !isValid && value.length > 0;
    const showSuccess = touched && isValid && value.length > 0;

    const borderColor = showError
        ? theme.danger
        : showSuccess
            ? theme.success
            : theme.border;

    return (
        <View style={[styles.container, style]}>
            <ThemedText type="small" style={styles.label}>
                {label} {required && '*'}
            </ThemedText>
            <View style={styles.inputWrapper}>
                <TextInput
                    {...textInputProps}
                    value={value}
                    onChangeText={onChangeText}
                    onBlur={() => setTouched(true)}
                    style={[
                        styles.input,
                        {
                            backgroundColor: theme.backgroundDefault,
                            borderColor,
                            color: theme.text,
                        },
                    ]}
                    placeholderTextColor={theme.textSecondary}
                />
                {showSuccess && (
                    <View style={styles.iconContainer}>
                        <Check size={18} color={theme.success} />
                    </View>
                )}
                {showError && (
                    <View style={styles.iconContainer}>
                        <AlertCircle size={18} color={theme.danger} />
                    </View>
                )}
            </View>
            {showError && (
                <ThemedText type="caption" style={[styles.error, { color: theme.danger }]}>
                    {errorMessage}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    label: {
        marginBottom: Spacing.sm,
        fontWeight: '500',
        textAlign: 'right',
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        height: Spacing.inputHeight,
        borderRadius: BorderRadius.xs,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        paddingRight: Spacing['2xl'], // Space for icon
        fontSize: 16,
        textAlign: 'right',
    },
    iconContainer: {
        position: 'absolute',
        left: Spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    error: {
        marginTop: Spacing.xs,
        textAlign: 'right',
    },
});
