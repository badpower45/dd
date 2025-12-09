import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";

import MapScreen from "@/screens/dispatcher/MapScreen";
import OrdersListScreen from "@/screens/dispatcher/OrdersListScreen";
import AssignOrderScreen from "@/screens/dispatcher/AssignOrderScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { useTheme } from "@/hooks/useTheme";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import { Order } from "@/lib/types";

export type DispatcherTabParamList = {
  MapTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type DispatcherStackParamList = {
  DispatcherTabs: undefined;
  AssignOrder: { order: Order };
};

const Tab = createBottomTabNavigator<DispatcherTabParamList>();
const Stack = createNativeStackNavigator<DispatcherStackParamList>();

function DispatcherTabs() {
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
        headerTintColor: theme.text,
      }}
    >
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: "Map",
          headerTitle: () => <HeaderTitle title="DeliverEase" />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersListScreen}
        options={{
          title: "Orders",
          headerTitle: "Pending Orders",
          tabBarIcon: ({ color, size }) => (
            <Feather name="package" size={size} color={color} />
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

export default function DispatcherNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DispatcherTabs"
        component={DispatcherTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AssignOrder"
        component={AssignOrderScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
