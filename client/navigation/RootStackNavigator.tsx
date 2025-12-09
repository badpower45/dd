import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "@/screens/LoginScreen";
import RestaurantNavigator from "@/navigation/RestaurantTabNavigator";
import DispatcherNavigator from "@/navigation/DispatcherTabNavigator";
import DriverNavigator from "@/navigation/DriverTabNavigator";
import AdminNavigator from "@/navigation/AdminTabNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Login: undefined;
  RestaurantMain: undefined;
  DispatcherMain: undefined;
  DriverMain: undefined;
  AdminMain: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!isAuthenticated || !user) return "Login";

    switch (user.role) {
      case "admin":
        return "AdminMain";
      case "dispatcher":
        return "DispatcherMain";
      case "restaurant":
        return "RestaurantMain";
      case "driver":
        return "DriverMain";
      default:
        return "Login";
    }
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={getInitialRoute()}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="RestaurantMain"
            component={RestaurantNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DispatcherMain"
            component={DispatcherNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DriverMain"
            component={DriverNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdminMain"
            component={AdminNavigator}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
