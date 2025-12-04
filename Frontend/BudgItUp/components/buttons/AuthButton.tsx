// components/buttons/AuthButton.tsx
import { useTheme } from "@/theme/globals";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const PRIMARY = "#348DDB";

export default function AuthButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
       const theme = useTheme();
  const { typography } = theme;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={[{fontFamily: typography.fontFamily.buttonText},styles.text]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 18,
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
