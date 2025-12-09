import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Profile, UserRole } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { password: string; profile: Profile }> = {
  "admin@demo.com": {
    password: "demo123",
    profile: {
      id: "admin-001",
      role: "admin",
      full_name: "Admin User",
      phone_number: "+1234567890",
      email: "admin@demo.com",
    },
  },
  "dispatcher@demo.com": {
    password: "demo123",
    profile: {
      id: "dispatcher-001",
      role: "dispatcher",
      full_name: "Sarah Dispatcher",
      phone_number: "+1234567891",
      email: "dispatcher@demo.com",
    },
  },
  "restaurant@demo.com": {
    password: "demo123",
    profile: {
      id: "restaurant-001",
      role: "restaurant",
      full_name: "Pizza Palace",
      phone_number: "+1234567892",
      email: "restaurant@demo.com",
    },
  },
  "driver@demo.com": {
    password: "demo123",
    profile: {
      id: "driver-001",
      role: "driver",
      full_name: "John Driver",
      phone_number: "+1234567893",
      email: "driver@demo.com",
    },
  },
};

const AUTH_STORAGE_KEY = "@deliverease_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      if (isSupabaseConfigured()) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (profile) {
            setUser(profile as Profile);
          }
        }
      } else {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          Alert.alert("Sign In Error", error.message);
          return false;
        }

        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            Alert.alert("Error", "Could not fetch user profile");
            return false;
          }

          setUser(profile as Profile);
          return true;
        }
      } else {
        const demoUser = DEMO_USERS[email.toLowerCase()];
        if (demoUser && demoUser.password === password) {
          await AsyncStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(demoUser.profile),
          );
          setUser(demoUser.profile);
          return true;
        } else {
          Alert.alert(
            "Sign In Error",
            "Invalid credentials. Try demo accounts:\n\nadmin@demo.com\ndispatcher@demo.com\nrestaurant@demo.com\ndriver@demo.com\n\nPassword: demo123",
          );
          return false;
        }
      }

      return false;
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
