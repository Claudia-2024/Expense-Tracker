// components/buttons/AuthButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, Image } from "react-native";

export default function AuthButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.button}>
      <View style={styles.row}>
        <Image source={require("../../assets/icons/check.png")} style={styles.icon} />
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: "#2C7CA4",
    paddingVertical: 13,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 18,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: "#F7A428",
  },
  text: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },
});
