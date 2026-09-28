// src/screens/Auth/OTPScreen.js
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { authService } from "../../api/authService";
import Button from "../../components/common/Button";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";

const OTPScreen = ({ route, navigation }) => {
  const { user, refetchProfile } = useAuth();

  // If we came from Login/Register (logged in), get email from user object
  // If we came from elsewhere, check params
  const email = user?.email || route.params?.email;

  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!user) {
      Alert.alert("Error", "Sign in again to verify your email.");
      return;
    }
    setIsLoading(true);
    const { verified, error } = await authService.checkEmailVerification();
    if (error || !verified) {
      setIsLoading(false);
      Alert.alert(
        "Email Not Verified",
        error || "Open the verification link in your email, then try again.",
      );
      return;
    }
    await refetchProfile();
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    const { success, error } = await authService.sendVerificationEmail();
    setIsLoading(false);
    Alert.alert(
      success ? "Sent" : "Could Not Send",
      success ? "A new verification email was sent." : error,
    );
  };

  const handleLogout = async () => {
    await authService.logout();
    // AppNavigator will switch to AuthStack -> Login
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Open the verification link sent to:</Text>
        <Text style={styles.emailText}>{email}</Text>

        <Button
          title="I've Verified My Email"
          onPress={handleVerify}
          loading={isLoading}
          style={styles.verifyButton}
        />

        <TouchableOpacity onPress={handleResend} disabled={isLoading}>
          <Text style={styles.resendLink}>
            Didn&apos;t receive a verification email?{" "}
            <Text style={styles.linkText}>Resend</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 30 }}>
          <Text style={{ textAlign: "center", color: COLORS.danger }}>
            Log Out / Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background || "#F5F5DC" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: COLORS.greyDark, textAlign: "center" },
  emailText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkText,
    textAlign: "center",
    marginBottom: 32,
    marginTop: 5,
  },
  otpInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 24,
  },
  verifyButton: { marginTop: 16 },
  resendLink: { marginTop: 24, textAlign: "center", color: COLORS.greyDark },
  linkText: { color: COLORS.primary, fontWeight: "bold" },
});

export default OTPScreen;
