/**
 * Main application configuration
 */

import Constants from "expo-constants";

// Environment variables
export const ENV = {
  SUPABASE_URL:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,
};

// App constants
export const APP_CONFIG = {
  NAME: "DeliverEase",
  VERSION: "1.0.0",
  BUILD: "1",

  // Features flags
  FEATURES: {
    REALTIME_ENABLED: true,
    NOTIFICATIONS_ENABLED: true,
    OFFLINE_MODE: false,
    ANALYTICS_ENABLED: false,
  },

  // Limits
  LIMITS: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_ORDER_NOTES_LENGTH: 500,
    MAX_RATING_COMMENT_LENGTH: 200,
  },

  // Default values
  DEFAULTS: {
    DELIVERY_FEE: 20, // EGP
    CURRENCY: "ر.س",
    LOCALE: "ar-SA",
    PHONE_PREFIX: "+966",
  },

  // Intervals (in milliseconds)
  INTERVALS: {
    LOCATION_UPDATE: 30000, // 30 seconds
    HEARTBEAT: 60000, // 1 minute
    SESSION_REFRESH: 3600000, // 1 hour
  },
};

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_REGION: {
    latitude: 24.7136, // Riyadh
    longitude: 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },

  MARKER_COLORS: {
    RESTAURANT: "#3b82f6",
    DRIVER: "#22c55e",
    CUSTOMER: "#ef4444",
  },
};

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_NEW: "order_new",
  ORDER_ASSIGNED: "order_assigned",
  ORDER_PICKED_UP: "order_picked_up",
  ORDER_DELIVERED: "order_delivered",
  ORDER_CANCELLED: "order_cancelled",
  PAYMENT_RECEIVED: "payment_received",
  RATING_RECEIVED: "rating_received",
} as const;

// Order status translations
export const ORDER_STATUS = {
  pending: { label: "قيد الانتظار", color: "#f59e0b" },
  assigned: { label: "تم التعيين", color: "#3b82f6" },
  picked_up: { label: "تم الاستلام", color: "#8b5cf6" },
  delivered: { label: "تم التوصيل", color: "#22c55e" },
  cancelled: { label: "ملغي", color: "#ef4444" },
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  DISPATCHER: "dispatcher",
  RESTAURANT: "restaurant",
  DRIVER: "driver",
} as const;

// Validation rules
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(05|5)[0-9]{8}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "خطأ في الاتصال بالإنترنت",
  UNAUTHORIZED: "يجب تسجيل الدخول أولاً",
  FORBIDDEN: "ليس لديك صلاحية للقيام بهذا الإجراء",
  NOT_FOUND: "العنصر المطلوب غير موجود",
  VALIDATION_ERROR: "البيانات المدخلة غير صحيحة",
  SERVER_ERROR: "حدث خطأ في الخادم",
  UNKNOWN_ERROR: "حدث خطأ غير متوقع",
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: "تم تسجيل الدخول بنجاح",
  LOGOUT: "تم تسجيل الخروج بنجاح",
  ORDER_CREATED: "تم إنشاء الطلب بنجاح",
  ORDER_UPDATED: "تم تحديث الطلب بنجاح",
  PROFILE_UPDATED: "تم تحديث الملف الشخصي بنجاح",
  RATING_SUBMITTED: "تم إرسال التقييم بنجاح",
};

// Check if app is configured
export function isAppConfigured(): boolean {
  return !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
}

// Get configuration errors
export function getConfigErrors(): string[] {
  const errors: string[] = [];

  if (!ENV.SUPABASE_URL) {
    errors.push("EXPO_PUBLIC_SUPABASE_URL is not set");
  }

  if (!ENV.SUPABASE_ANON_KEY) {
    errors.push("EXPO_PUBLIC_SUPABASE_ANON_KEY is not set");
  }

  return errors;
}
