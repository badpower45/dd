import React from 'react';
import { StyleSheet, View, Pressable, I18nManager } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp
} from 'react-native-reanimated';
import { WifiOff, RefreshCw } from 'lucide-react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useNetworkStatus } from '@/lib/validation';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface NetworkStatusBarProps {
    onRetry?: () => void;
}

export function NetworkStatusBar({ onRetry }: NetworkStatusBarProps) {
    const { theme } = useTheme();
    const { isConnected } = useNetworkStatus();

    if (isConnected) {
        return null;
    }

    return (
        <Animated.View
            entering={SlideInUp.duration(300)}
            exiting={FadeOut.duration(200)}
            style={[
                styles.container,
                {
                    backgroundColor: theme.danger,
                    ...Shadows.md,
                },
            ]}
        >
            <View style={styles.content}>
                <WifiOff size={18} color="#FFFFFF" />
                <ThemedText type="small" style={styles.text}>
                    لا يوجد اتصال بالإنترنت
                </ThemedText>
            </View>
            {onRetry && (
                <Pressable
                    style={styles.retryButton}
                    onPress={onRetry}
                >
                    <RefreshCw size={16} color="#FFFFFF" />
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    retryButton: {
        padding: Spacing.sm,
    },
});
