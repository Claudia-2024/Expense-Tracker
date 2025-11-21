// app/auth/login.tsx
import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import AuthScreenWrapper from "../../components/auth/AuthScreenWrapper";
import InputField from "../../components/InputField";
import AuthButton from "../../components/buttons/AuthButton";
import ApiService from "../../services/api";
import { useTheme } from "@/theme/global";
const PRIMARY = "#348DDB";


export default function LoginScreen() {

  const router = useRouter();
   const theme = useTheme();
  const { typography } = theme;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.login(
          email.trim().toLowerCase(),
          password
      );

      console.log("Login successful:", response);

      // Navigate basbed on onboarding status
      if (response.hasCompletedOnboarding) {
        router.replace("/(tabs)");
      } else {
        router.replace("/category-selector/choseCategory");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
          "Login Failed",
          error.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => router.push("/auth/signup");

  return (
      <AuthScreenWrapper>
        <View style={styles.illustrationWrapper}>
          <Image
              source={require("../../assets/images/auth1.png")}
              style={styles.illustrationImage}
          />
        </View>

        <View style={styles.card}>
          <Text style={[{fontFamily: typography.fontFamily.boldHeading},styles.cardTitle]}>Log In</Text>
          <Text style={[{fontFamily:typography.fontFamily.heading},styles.cardSubtitle]}>Welcome back!</Text>

          <InputField
              placeholder="Email"
              icon={require("../../assets/icons/email.png")}
              value={email}
              onChangeText={setEmail}
          />
          <InputField
              placeholder="Password"
              secureTextEntry
              icon={require("../../assets/icons/lock.png")}
              value={password}
              onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => {
            Alert.alert("Forgot Password", "Password reset feature coming soon!");
          }}>
            <Text style={[{fontFamily:typography.fontFamily.body},styles.forgot]}>Forgot password?</Text>
          </TouchableOpacity>

          <AuthButton
              label={loading ? "Logging in..." : "Log In"}
              onPress={handleLogin}
              disabled={loading}
          />

          <TouchableOpacity onPress={goToSignUp} disabled={loading}>
            <Text style={[{fontFamily:typography.fontFamily.body},styles.switchText]}>
              Dont have an account?{" "}
              <Text style={[{fontFamily:typography.fontFamily.body},styles.switchHighlight]}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  illustrationWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  illustrationImage: {
    width: 100,
    height: 100,
    borderRadius: 999,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 24,
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 40,
    fontWeight: "300",
    color: "#FCB53B",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    marginBottom: 20,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: 6,
    marginBottom: 8,
    fontSize: 12,
    color: PRIMARY,
  },
  switchText: {
    marginTop: 16,
    fontSize: 13,
    textAlign: "center",
    color: "#6B7280",
  },
  switchHighlight: {
    fontWeight: "700",
    color: PRIMARY,
  },
});