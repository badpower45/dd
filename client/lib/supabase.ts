import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * يتم الآن قراءة مفاتيح Supabase من متغيرات البيئة / إعدادات Expo
 * يجب ضبط EXPO_PUBLIC_SUPABASE_URL و EXPO_PUBLIC_SUPABASE_ANON_KEY في .env
 */
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_SUPABASE_URL ||
  "";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://"),
  );
};

const showConfigError = () => {
  const message =
    "Supabase غير مهيأ. يرجى التأكد من ضبط EXPO_PUBLIC_SUPABASE_URL و EXPO_PUBLIC_SUPABASE_ANON_KEY في .env ثم إعادة تشغيل الخادم";

  if (Platform.OS === "web") {
    console.error("⚠️ " + message);
  } else {
    console.warn(message);
  }
};

const createSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    showConfigError();
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    showConfigError();
    return null;
  }
};

const supabaseInstance = createSupabaseClient();

// Safe mock to prevent "Cannot read property of null" if initialization fails
const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: () => Promise.reject("Supabase not configured"),
    signUp: () => Promise.reject("Supabase not configured"),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.reject("Supabase not configured"),
        order: () => Promise.reject("Supabase not configured"),
      }),
      order: () => Promise.reject("Supabase not configured"),
      insert: () => Promise.reject("Supabase not configured"),
      update: () => Promise.reject("Supabase not configured"),
      delete: () => Promise.reject("Supabase not configured"),
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.reject("Supabase not configured"),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.reject("Supabase not configured"),
        }),
      }),
    }),
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => {},
    }),
  }),
} as unknown as SupabaseClient;

// Use the real client if configured, otherwise use the mock
export const supabase = (supabaseInstance || mockClient) as SupabaseClient;

export const getSupabase = (): SupabaseClient => {
  return supabase;
};
