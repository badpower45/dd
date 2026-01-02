import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { Platform } from "react-native";

interface Session {
  id: string;
  user_id: number;
  device_name: string;
  device_type: string;
  ip_address: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
}

/**
 * Create new session
 */
export async function createSession(userId: number): Promise<Session | null> {
  try {
    const deviceInfo = {
      device_name: Device.deviceName || "Unknown Device",
      device_type: Platform.OS,
      ip_address: "auto", // Will be filled by backend
    };

    const { data, error } = await supabase
      .from("user_sessions")
      .insert({
        user_id: userId,
        ...deviceInfo,
        is_active: true,
        last_activity: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Store session ID locally
    if (data) {
      await AsyncStorage.setItem("session_id", data.id);
    }

    return data;
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
}

/**
 * Get active sessions for user
 */
export async function getUserSessions(userId: number): Promise<Session[]> {
  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("last_activity", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

/**
 * Update session activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("user_sessions")
      .update({
        last_activity: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating session:", error);
  }
}

/**
 * End session (logout)
 */
export async function endSession(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("user_sessions")
      .update({
        is_active: false,
      })
      .eq("id", sessionId);

    if (error) throw error;

    // Remove session ID from storage
    await AsyncStorage.removeItem("session_id");
  } catch (error) {
    console.error("Error ending session:", error);
  }
}

/**
 * End all other sessions except current
 */
export async function endOtherSessions(
  userId: number,
  currentSessionId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("user_sessions")
      .update({
        is_active: false,
      })
      .eq("user_id", userId)
      .neq("id", currentSessionId);

    if (error) throw error;
  } catch (error) {
    console.error("Error ending other sessions:", error);
  }
}

/**
 * Log activity
 */
export async function logActivity(
  userId: number,
  action: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      details,
      ip_address: "auto",
      user_agent: `${Platform.OS}/${Device.osVersion}`,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

/**
 * Get user activity logs
 */
export async function getUserActivityLogs(
  userId: number,
  limit: number = 50,
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}
