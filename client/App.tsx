import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import { AuthProvider } from "@/contexts/AuthContext";
import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Login: "login",
      RestaurantMain: {
        path: "restaurant",
        screens: {
          Orders: "orders",
          NewOrder: "new-order",
          Profile: "profile",
        },
      },
      DispatcherMain: {
        path: "dispatcher",
        screens: {
          Dashboard: "dashboard",
          Orders: "orders",
          Drivers: "drivers",
          Profile: "profile",
        },
      },
      DriverMain: {
        path: "driver",
        screens: {
          Orders: "orders",
          Map: "map",
          Profile: "profile",
        },
      },
      AdminMain: {
        path: "admin",
        screens: {
          Dashboard: "dashboard",
          Users: "users",
          Settings: "settings",
        },
      },
    },
  },
};

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <NavigationContainer linking={linking}>
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="auto" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
