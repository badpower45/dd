import { Platform } from "react-native";

const tintColorLight = "#1E40AF"; // Deep Royal Blue
const tintColorDark = "#60A5FA"; // Lighter Blue for Dark Mode

export const Colors = {
  light: {
    text: "#0F172A", // Slate 900
    textSecondary: "#64748B", // Slate 500
    buttonText: "#FFFFFF",
    tabIconDefault: "#94A3B8", // Slate 400
    tabIconSelected: tintColorLight,
    link: "#1E40AF",
    backgroundRoot: "#F8FAFC", // Slate 50
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F5F9", // Slate 100
    backgroundTertiary: "#E2E8F0", // Slate 200
    border: "#E2E8F0", // Slate 200
    primary: "#1E40AF", // Deep Royal Blue
    success: "#059669", // Emerald 600
    warning: "#D97706", // Amber 600
    danger: "#DC2626", // Red 600
    info: "#2563EB", // Blue 600
  },
  dark: {
    text: "#F8FAFC", // Slate 50
    textSecondary: "#94A3B8", // Slate 400
    buttonText: "#FFFFFF",
    tabIconDefault: "#64748B", // Slate 500
    tabIconSelected: tintColorDark,
    link: "#60A5FA",
    backgroundRoot: "#0F172A", // Slate 900
    backgroundDefault: "#1E293B", // Slate 800
    backgroundSecondary: "#334155", // Slate 700
    backgroundTertiary: "#475569", // Slate 600
    border: "#334155", // Slate 700
    primary: "#3B82F6", // Blue 500
    success: "#10B981", // Emerald 500
    warning: "#F59E0B", // Amber 500
    danger: "#EF4444", // Red 500
    info: "#3B82F6", // Blue 500
  },
};

export const StatusColors = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" },
  assigned: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" },
  picked_up: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" },
  delivered: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
  cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 52, // Slightly taller for better touch target
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Times New Roman",
    rounded: "System",
    mono: "Menlo",
  },
  default: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif-rounded",
    mono: "monospace",
  },
  web: {
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
