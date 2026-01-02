import { Platform } from "react-native";

// Modern Indigo Theme - High-End Professional UI
const tintColorLight = "#2563EB";
const tintColorDark = "#60A5FA";

export const Colors = {
  light: {
    text: "#0F172A",
    textSecondary: "#475569",
    buttonText: "#FFFFFF",
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintColorLight,
    link: "#2563EB",
    backgroundRoot: "#F8FAFC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F5F9",
    backgroundTertiary: "#E2E8F0",
    border: "#E2E8F0",
    primary: "#2563EB",
    success: "#059669",
    warning: "#D97706",
    danger: "#DC2626",
    info: "#0284C7",
  },
  dark: {
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#475569",
    tabIconSelected: tintColorDark,
    link: "#60A5FA",
    backgroundRoot: "#020617",
    backgroundDefault: "#0F172A",
    backgroundSecondary: "#1E293B",
    backgroundTertiary: "#334155",
    border: "#1E293B",
    primary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#0EA5E9",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
  inputHeight: 56,
  buttonHeight: 56,
};

export const StatusColors = {
  pending: {
    bg: "#FEF3C7",
    text: "#D97706",
    border: "#F59E0B",
  },
  assigned: {
    bg: "#DBEAFE",
    text: "#1E40AF",
    border: "#3B82F6",
  },
  picked_up: {
    bg: "#EDE9FE",
    text: "#6B21A8",
    border: "#8B5CF6",
  },
  delivered: {
    bg: "#D1FAE5",
    text: "#047857",
    border: "#10B981",
  },
  cancelled: {
    bg: "#FEE2E2",
    text: "#B91C1C",
    border: "#EF4444",
  },
};

export const Fonts = {
  regular: Platform.OS === "ios" ? "System" : "Roboto",
  medium: Platform.OS === "ios" ? "System" : "Roboto-Medium",
  bold: Platform.OS === "ios" ? "System" : "Roboto-Bold",
  mono: Platform.OS === "ios" ? "Courier" : "monospace",
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
};

// Poppins integration via Font Weight and Style
export const Typography = {
  h1: {
    fontSize: 30,
    fontWeight: "800" as const,
    fontFamily: Platform.OS === "ios" ? "Poppins-Bold" : "sans-serif-condensed", // Fallback for Expo
  },
  h2: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};
