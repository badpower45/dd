import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Plus } from "lucide-react-native";

import MyOrdersScreen from "@/screens/restaurant/MyOrdersScreen";
import CreateOrderScreen from "@/screens/restaurant/CreateOrderScreen";
import DashboardScreen from "@/screens/restaurant/DashboardScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { useTheme } from "@/hooks/useTheme";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

export type RestaurantTabParamList = {
  DashboardTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RestaurantStackParamList = {
  RestaurantTabs: undefined;
  CreateOrder: undefined;
};

const Tab = createBottomTabNavigator<RestaurantTabParamList>();
const Stack = createNativeStackNavigator<RestaurantStackParamList>();

function FloatingActionButton({ onPress, bottomOffset }: { onPress: () => void; bottomOffset: number }) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[
        styles.fab,
        {
          bottom: bottomOffset,
          backgroundColor: theme.link,
          ...Shadows.lg,
        },
      ]}
      onPress={onPress}
    >
      <Plus size={28} color="#FFFFFF" />
    </Pressable>
  );
}

function RestaurantTabs({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();

  // Calculate FAB position: tab bar height + spacing
  const fabBottomOffset = tabBarHeight + Spacing.lg;

  return (
    <View style={{ flex: 1 }}>
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
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            title: "الرئيسية",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="OrdersTab"
          component={MyOrdersScreen}
          options={{
            title: "طلباتي",
            headerTitle: () => <HeaderTitle title="ديليفر إيز" />,
            tabBarIcon: ({ color, size }) => (
              <Feather name="package" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: "الملف",
            headerTitle: "الملف الشخصي",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <FloatingActionButton
        onPress={() => navigation.navigate("CreateOrder")}
        bottomOffset={fabBottomOffset}
      />
    </View>
  );
}

export default function RestaurantNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="RestaurantTabs"
        component={RestaurantTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
