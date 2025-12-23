import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity status
 */
export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState(true);
    const [connectionType, setConnectionType] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected ?? true);
            setConnectionType(state.type);
        });

        // Get initial state
        NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected ?? true);
            setConnectionType(state.type);
        });

        return () => unsubscribe();
    }, []);

    return { isConnected, connectionType };
}

/**
 * Validate Egyptian phone number format
 */
export function validateEgyptianPhone(phone: string): boolean {
    // Egyptian mobile numbers: 010, 011, 012, 015 followed by 8 digits
    const egyptianMobileRegex = /^01[0125][0-9]{8}$/;
    return egyptianMobileRegex.test(phone.replace(/\s|-/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Validate and parse amount (returns cents)
 */
export function parseAmount(amount: string): number | null {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || parsed < 0) {
        return null;
    }
    return Math.round(parsed * 100); // Convert to cents
}

/**
 * Format amount from cents to display string
 */
export function formatAmount(cents: number, currency = 'ج.م'): string {
    return `${(cents / 100).toFixed(2)} ${currency}`;
}
