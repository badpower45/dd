import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";

import MyTasksScreen from "@/screens/driver/MyTasksScreen";
import WalletScreen from "@/screens/driver/WalletScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { useTheme } from "@/hooks/useTheme";
import { HeaderTitle } from "@/components/HeaderTitle";

export type DriverTabParamList = {
  TasksTab: undefined;
  WalletTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<DriverTabParamList>();

export default function DriverNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: true,
        headerTransparent: true,
        headerBlurEffect: isDark ? "dark" : "light",
        headerTintColor: theme.text,
      }}
    >
      <Tab.Screen
        name="TasksTab"
        component={MyTasksScreen}
        options={{
          title: "Tasks",
          headerTitle: () => <HeaderTitle title="DeliverEase" />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{
          title: "Wallet",
          headerTitle: "My Wallet",
          tabBarIcon: ({ color, size }) => (
            <Feather name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerTitle: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
