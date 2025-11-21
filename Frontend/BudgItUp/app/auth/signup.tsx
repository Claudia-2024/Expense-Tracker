// app/auth/signup.tsx
import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AuthScreenWrapper from "../../components/auth/AuthScreenWrapper";
import InputField from "../../components/InputField";
import AuthButton from "../../components/buttons/AuthButton";
import { useTheme } from "@/theme/global";

const PRIMARY = "#348DDB";

export default function SignUpScreen() {
  const router = useRouter();

  const goToLogin = () => router.push("/auth/login");
  const handleSubmit = () => router.push("/category-selector/choseCategory");

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
        <Text style={styles.cardTitle}>Sign Up</Text>
        <Text style={styles.cardSubtitle}>Create your account</Text>

        <InputField
          placeholder="Name"
          icon={require("../../assets/icons/user.png")}
        />
        <InputField
          placeholder="Email"
          icon={require("../../assets/icons/email.png")}
        />
        <InputField
          placeholder="Phone number"
          icon={require("../../assets/icons/phone.png")}
        />
        <InputField
          placeholder="Password"
          secureTextEntry
          icon={require("../../assets/icons/lock.png")}
        />
        <InputField
          placeholder="Confirm password"
          secureTextEntry
          icon={require("../../assets/icons/lock.png")}
        />

        <AuthButton label="Create account" onPress={handleSubmit} />

        <TouchableOpacity onPress={goToLogin}>
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
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: PRIMARY,
    textAlign: "left",
    marginBottom: 12,
  },

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
