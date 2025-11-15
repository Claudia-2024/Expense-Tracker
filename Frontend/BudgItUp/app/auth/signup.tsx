// app/auth/signup.tsx
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AuthScreenWrapper from "../../components/auth/AuthScreenWrapper";
import InputField from "../../components/InputField";
import AuthButton from "../../components/buttons/AuthButton";

export default function SignUpScreen() {
  const router = useRouter();

  const goToLogin = () => router.push("/auth/login");

  const handleSubmit = () => {
    console.log("Sign up submit");

    // 👉 Navigate to choose category screen
    router.push("/category-selector/choseCategory");
  };

  return (
    <AuthScreenWrapper variant="signup" behindLabel="LOGIN" onBehindPress={goToLogin}>
      <Text style={styles.brand}>BUDGITUP!</Text>
      <Text style={styles.title}>SIGN UP</Text>

      <InputField placeholder="Name" icon={require("../../assets/icons/user.png")} />
      <InputField placeholder="Email" icon={require("../../assets/icons/email.png")} />
      <InputField placeholder="Phone Number" icon={require("../../assets/icons/phone.png")} />
      <InputField placeholder="Password" secureTextEntry icon={require("../../assets/icons/lock.png")} />
      <InputField placeholder="Confirm Password" secureTextEntry icon={require("../../assets/icons/lock.png")} />

      <AuthButton label="Submit" onPress={handleSubmit} />

      <TouchableOpacity onPress={goToLogin}>
        <Text style={styles.login}>Already have an account?</Text>
      </TouchableOpacity>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontSize: 40,
    fontWeight: "700",
    color: "rgba(10,126,164,0.77)",
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FCB53B",
    marginBottom: 18,
    alignSelf: "flex-start",
  },
  login: {
    marginTop: 14,
    color: "rgba(0,0,0,0.34)",
    textDecorationLine: "underline",
    alignSelf: "flex-start",
  },
});
