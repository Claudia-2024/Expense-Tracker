// app/auth/login.tsx
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AuthScreenWrapper from "../../components/auth/AuthScreenWrapper";
import InputField from "../../components/InputField";
import AuthButton from "../../components/buttons/AuthButton";

export default function LoginScreen() {
  const router = useRouter();

  const goToSignUp = () => router.push("/auth/signup");
  const handleLogin = () => router.push("/(tabs)");

  return (
    <AuthScreenWrapper variant="login" behindLabel="SIGN UP" onBehindPress={goToSignUp}>
      <Text style={styles.title}>LOGIN</Text>

      <InputField placeholder="Email" icon={require("../../assets/icons/email.png")} />
      <InputField placeholder="Password" secureTextEntry icon={require("../../assets/icons/lock.png")} />

      <AuthButton label="Log In" onPress={handleLogin} />

      <TouchableOpacity onPress={goToSignUp}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FCB53B",
    marginBottom: 18,
    alignSelf: "flex-start",
  },
  link: {
    marginTop: 14,
    color: "rgba(0,0,0,0.35)",
    textDecorationLine: "underline",
    alignSelf: "flex-start",
  },
});
