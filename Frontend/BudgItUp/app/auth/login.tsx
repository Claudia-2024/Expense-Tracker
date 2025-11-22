// app/auth/login.tsx
import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import AuthScreenWrapper from "../../components/auth/AuthScreenWrapper";
import InputField from "../../components/InputField";
import AuthButton from "../../components/buttons/AuthButton";

const PRIMARY = "#348DDB";

export default function LoginScreen() {
  const router = useRouter();

  const goToSignUp = () => router.push("/auth/signup");
  const handleLogin = () => router.push("/(tabs)");

  return (
    <AuthScreenWrapper>
      {/* Centered illustration */}
      <View style={styles.illustrationWrapper}>
        <Image
          source={require("../../assets/images/auth1.png")}
          style={styles.illustrationImage}
        />
      </View>

      {/* Clean Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Log In</Text>
        <Text style={styles.cardSubtitle}>Welcome back!</Text>

        <InputField
          placeholder="Email"
          icon={require("../../assets/icons/email.png")}
        />
        <InputField
          placeholder="Password"
          secureTextEntry
          icon={require("../../assets/icons/lock.png")}
        />

        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <AuthButton label="Log In" onPress={handleLogin} />

        <TouchableOpacity onPress={goToSignUp}>
          <Text style={styles.switchText}>
            Don't have an account?{" "}
            <Text style={styles.switchHighlight}>Sign up</Text>
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