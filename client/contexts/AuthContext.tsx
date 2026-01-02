import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabaseApi, { User } from "@/lib/supabaseApi";
import { registerForPushNotifications } from "@/lib/notifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@deliverease_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enable realtime notifications when user is authenticated
  useRealtimeNotifications(user?.id || null, !!user);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const { password: _ignored, ...safeParsed } = parsed;
        // Refresh user data from database
        try {
          const freshUser = await supabaseApi.users.get(parsed.id);
          setUser(freshUser);
          await AsyncStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(freshUser),
          );
        } catch (error) {
          // If refresh fails, use stored data
          setUser(safeParsed);
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

      const response = await supabaseApi.auth.login(email, password);

      if (response) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
        setUser(response);

        // Register for push notifications after login
        try {
          const pushToken = await registerForPushNotifications();
          if (pushToken && response.id) {
            await supabaseApi.users.update(response.id, {
              push_token: pushToken,
            });
          }
        } catch (error) {
          console.warn("Failed to register push notifications:", error);
        }

        return true;
      }

      return false;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during sign in";
      Alert.alert("Sign In Error", message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      // Remove push token before signing out
      if (user?.id) {
        try {
          await supabaseApi.users.update(user.id, { push_token: null });
        } catch (error) {
          console.warn("Failed to remove push token:", error);
        }
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
    if (user?.id) {
      try {
        const freshUser = await supabaseApi.users.get(user.id);
        setUser(freshUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user?.id) {
      try {
        const updatedUser = await supabaseApi.users.update(user.id, updates);
        setUser(updatedUser);
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(updatedUser),
        );
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
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
        updateUser,
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
