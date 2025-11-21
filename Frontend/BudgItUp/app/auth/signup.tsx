// app/auth/signup.tsx
import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AuthScreenWrapper from "../../components/auth/AuthScreenWrapper";
import InputField from "../../components/InputField";
import AuthButton from "../../components/buttons/AuthButton";
import ApiService from "../../services/api";

const PRIMARY = "#348DDB";

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // For now, we'll register without categories and let them choose later
      // You can modify this to include default categories if needed
      const response = await ApiService.register({
        email: email.trim().toLowerCase(),
        password: password,
        defaultCategoryIds: [1, 2, 3, 4, 5], // Default categories IDs from your backend
      });

      console.log("Registration successful:", response);

      Alert.alert(
          "Success",
          "Account created successfully!",
          [
            {
              text: "OK",
              onPress: () => router.push("/category-selector/choseCategory"),
            },
          ]
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
          "Registration Failed",
          error.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.push("/auth/login");

  return (
      <AuthScreenWrapper>
        <View style={styles.illustrationWrapper}>
          <Image
              source={require("../../assets/images/auth1.png")}
              style={styles.illustrationImage}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign Up</Text>
          <Text style={styles.cardSubtitle}>Create your account</Text>

          <InputField
              placeholder="Name"
              icon={require("../../assets/icons/user.png")}
              value={name}
              onChangeText={setName}
          />
          <InputField
              placeholder="Email"
              icon={require("../../assets/icons/email.png")}
              value={email}
              onChangeText={setEmail}
          />
          <InputField
              placeholder="Phone number"
              icon={require("../../assets/icons/phone.png")}
              value={phone}
              onChangeText={setPhone}
          />
          <InputField
              placeholder="Password"
              secureTextEntry
              icon={require("../../assets/icons/lock.png")}
              value={password}
              onChangeText={setPassword}
          />
          <InputField
              placeholder="Confirm password"
              secureTextEntry
              icon={require("../../assets/icons/lock.png")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
          />

          <AuthButton
              label={loading ? "Creating account..." : "Create account"}
              onPress={handleSubmit}
              disabled={loading}
          />

          <TouchableOpacity onPress={goToLogin} disabled={loading}>
            <Text style={styles.switchText}>
              Already have an account?{" "}
              <Text style={styles.switchHighlight}>Log in</Text>
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