import { Platform } from "react-native";

// Fresh Teal/Cyan theme - Modern and friendly
const tintColorLight = "#0D9488"; // Teal 600
const tintColorDark = "#2DD4BF"; // Teal 400

export const Colors = {
  light: {
    text: "#1E293B", // Slate 800 - slightly softer
    textSecondary: "#64748B", // Slate 500
    buttonText: "#FFFFFF",
    tabIconDefault: "#94A3B8", // Slate 400
    tabIconSelected: tintColorLight,
    link: "#0D9488", // Teal 600
    backgroundRoot: "#F0FDFA", // Teal 50 - subtle tint
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F5F9", // Slate 100
    backgroundTertiary: "#E2E8F0", // Slate 200
    border: "#E2E8F0", // Slate 200
    primary: "#0D9488", // Teal 600
    success: "#059669", // Emerald 600
    warning: "#EA580C", // Orange 600
    danger: "#DC2626", // Red 600
    info: "#0891B2", // Cyan 600
  },
  dark: {
    text: "#F8FAFC", // Slate 50
    textSecondary: "#94A3B8", // Slate 400
    buttonText: "#FFFFFF",
    tabIconDefault: "#64748B", // Slate 500
    tabIconSelected: tintColorDark,
    link: "#2DD4BF", // Teal 400
    backgroundRoot: "#0F172A", // Slate 900
    backgroundDefault: "#1E293B", // Slate 800
    backgroundSecondary: "#334155", // Slate 700
    backgroundTertiary: "#475569", // Slate 600
    border: "#334155", // Slate 700
    primary: "#14B8A6", // Teal 500
    success: "#10B981", // Emerald 500
    warning: "#F97316", // Orange 500
    danger: "#EF4444", // Red 500
    info: "#06B6D4", // Cyan 500
  },
};

export const StatusColors = {
  pending: { bg: "rgba(249, 115, 22, 0.1)", text: "#F97316" }, // Orange
  assigned: { bg: "rgba(6, 182, 212, 0.1)", text: "#06B6D4" }, // Cyan
  picked_up: { bg: "rgba(139, 92, 246, 0.1)", text: "#8B5CF6" }, // Violet
  delivered: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" }, // Emerald
  cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" }, // Red
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

// Gradient presets for GradientCard and backgrounds - Fresh Teal theme
export const Gradients = {
  primary: ["#0D9488", "#14B8A6", "#2DD4BF"] as const, // Teal
  success: ["#059669", "#10B981", "#34D399"] as const, // Emerald
  warning: ["#EA580C", "#F97316", "#FB923C"] as const, // Orange
  danger: ["#DC2626", "#EF4444", "#F87171"] as const, // Red
  info: ["#0891B2", "#06B6D4", "#22D3EE"] as const, // Cyan
  purple: ["#7C3AED", "#8B5CF6", "#A78BFA"] as const, // Violet
  mint: ["#0D9488", "#10B981", "#6EE7B7"] as const, // Teal to Emerald
  dark: ["#0F172A", "#1E293B", "#334155"] as const, // Slate
};

// Animation timing presets for react-native-reanimated
export const Animations = {
  spring: {
    default: { damping: 15, stiffness: 150, mass: 0.5 },
    gentle: { damping: 20, stiffness: 100, mass: 0.8 },
    bouncy: { damping: 10, stiffness: 180, mass: 0.4 },
    stiff: { damping: 20, stiffness: 300, mass: 0.3 },
  },
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  stagger: {
    fast: 50,
    normal: 100,
    slow: 150,
  },
};

// Glassmorphism effect styles
export const Glassmorphism = {
  light: {
    blur: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  dark: {
    blur: 15,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
  },
  frosted: {
    blur: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
  },
};
