import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform, Alert } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://"));
};

const showConfigError = () => {
  const message = "Supabase is not configured. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment secrets.";
  
  if (Platform.OS === "web") {
    console.error("⚠️ " + message);
  } else {
    Alert.alert("Configuration Missing", message);
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

export const supabase = supabaseInstance as SupabaseClient;

export const getSupabase = (): SupabaseClient | null => {
  return supabaseInstance;
};
