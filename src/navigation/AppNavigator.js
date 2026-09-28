// src/navigation/AppNavigator.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";

// Navigators
import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import OTPScreen from "../screens/Auth/OTPScreen";
import AuthStack from "./AuthStack";
import MainTabStack from "./MainTabStack";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, isLoading, profile, user } = useAuth();

  // 1. Show Loading while Auth initializes
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 2. Handle "Logged In but Profile Not Ready"
  if (isLoggedIn && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // --- LOGGED IN FLOW ---

          // CHECK 1: Is Email Verified? (AND NOT ADMIN)
          // We added "&& profile?.role !== 'admin'" to allow admins to bypass OTP
          !user?.emailVerified && profile?.role !== "admin" ? (
            // User is logged in, NOT verified, and NOT an admin. Force OTP.
            <Stack.Screen
              name="OTPVerification"
              component={OTPScreen}
              initialParams={{ email: user?.email }}
            />
          ) : // CHECK 2: Role Based Routing
          profile?.role === "admin" ? (
            // Admin goes straight here, even if email is not verified
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
            />
          ) : (
            <Stack.Screen name="MainApp" component={MainTabStack} />
          )
        ) : (
          // --- LOGGED OUT FLOW ---
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background || "#F5F5DC",
  },
});

export default AppNavigator;
