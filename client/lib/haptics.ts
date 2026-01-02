import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Haptic feedback utilities for enhanced user experience
 */

// Only trigger haptics on devices that support it
const isHapticsAvailable = Platform.OS === "ios" || Platform.OS === "android";

/**
 * Light impact - for toggles, switches, selections
 */
export function lightImpact() {
  if (isHapticsAvailable) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

/**
 * Medium impact - for button presses, card taps
 */
export function mediumImpact() {
  if (isHapticsAvailable) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

/**
 * Heavy impact - for important actions, confirmations
 */
export function heavyImpact() {
  if (isHapticsAvailable) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}

/**
 * Selection feedback - for picker changes, slider adjustments
 */
export function selectionFeedback() {
  if (isHapticsAvailable) {
    Haptics.selectionAsync();
  }
}

/**
 * Success notification - for completed actions
 */
export function successNotification() {
  if (isHapticsAvailable) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/**
 * Warning notification - for alerts, warnings
 */
export function warningNotification() {
  if (isHapticsAvailable) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}

/**
 * Error notification - for errors, failures
 */
export function errorNotification() {
  if (isHapticsAvailable) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

// Export all as a haptics object for convenience
export const haptics = {
  light: lightImpact,
  medium: mediumImpact,
  heavy: heavyImpact,
  selection: selectionFeedback,
  success: successNotification,
  warning: warningNotification,
  error: errorNotification,
};
