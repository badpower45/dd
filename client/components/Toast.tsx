import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { StyleSheet, View, Pressable, I18nManager } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from "react-native-reanimated";
import { Check, X, AlertTriangle, Info } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { haptics } from "@/lib/haptics";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type ToastType = "success" | "error" | "warning" | "info";

interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const { theme } = useTheme();

  const showToast = useCallback((config: ToastConfig) => {
    setToast(config);

    // Trigger haptic based on type
    switch (config.type) {
      case "success":
        haptics.success();
        break;
      case "error":
        haptics.error();
        break;
      case "warning":
        haptics.warning();
        break;
      default:
        haptics.light();
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getIcon = (type: ToastType) => {
    const iconProps = { size: 20, color: "#FFFFFF" };
    switch (type) {
      case "success":
        return <Check {...iconProps} />;
      case "error":
        return <X {...iconProps} />;
      case "warning":
        return <AlertTriangle {...iconProps} />;
      case "info":
        return <Info {...iconProps} />;
    }
  };

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return theme.success;
      case "error":
        return theme.danger;
      case "warning":
        return theme.warning;
      case "info":
        return theme.primary;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          entering={SlideInUp.duration(300)}
          exiting={SlideOutUp.duration(200)}
          style={[
            styles.container,
            {
              backgroundColor: getBackgroundColor(toast.type),
              ...Shadows.lg,
            },
          ]}
        >
          <Pressable style={styles.content} onPress={() => setToast(null)}>
            <View style={styles.iconContainer}>{getIcon(toast.type)}</View>
            <ThemedText type="body" style={styles.message}>
              {toast.message}
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.lg,
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
