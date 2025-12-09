import { Platform } from "react-native";

const tintColorLight = "#2563EB";
const tintColorDark = "#3B82F6";

export const Colors = {
  light: {
    text: "#111827",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorLight,
    link: "#2563EB",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F9FAFB",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    border: "#E5E7EB",
    primary: "#2563EB",
    success: "#10B981",
    warning: "#EAB308",
    danger: "#EF4444",
    info: "#3B82F6",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: "#3B82F6",
    backgroundRoot: "#1F2937",
    backgroundDefault: "#374151",
    backgroundSecondary: "#4B5563",
    backgroundTertiary: "#6B7280",
    border: "#4B5563",
    primary: "#3B82F6",
    success: "#10B981",
    warning: "#EAB308",
    danger: "#EF4444",
    info: "#3B82F6",
  },
};

export const StatusColors = {
  pending: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308" },
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
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 48,
  buttonHeight: 48,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "600" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
