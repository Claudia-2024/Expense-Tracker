import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import InputField from "@/components/InputField";
import { useTheme } from "@/theme/global";

export default function ProfilePage() {
  const theme = useTheme();
  const { typography, colors, themeMode, setThemeMode, colorScheme } = theme;

  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [currency, setCurrency] = useState("XAF");

  const handleLogout = () => {
    console.log("Logged out");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { fontFamily: typography.fontFamily.boldHeading, color: colors.main }]}>
          Profile Settings
        </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        

        {/* Username */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Username
          </Text>
          <InputField placeholder="Name" icon={require("../../assets/icons/user.png")} value={username} onChangeText={setUsername} />
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>Email</Text>
          <InputField placeholder="Email" icon={require("../../assets/icons/email.png")} value={email} onChangeText={setEmail} />
        </View>

        {/* Phone Number */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>Phone Number</Text>
          <InputField placeholder="Phone number" icon={require("../../assets/icons/phone.png")} />
        </View>

        {/* Theme Preference */}
        <View style={{marginBottom: 8}}>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>Theme</Text>
          <View style={[{borderColor: colors.main },styles.pickerWrapper]}>
            <Image
              source={require("../../assets/icons/check.png")}
              style={[styles.pickerIcon, { tintColor: colors.primary }]}
            />
            <Picker
              selectedValue={themeMode}
              style={[styles.picker, { color: colors.text, backgroundColor: colors.card, fontFamily: typography.fontFamily.body }]}
              onValueChange={(value: "light" | "dark" | "system") => {
                if (value === "system") {
                  const systemTheme = colorScheme === "dark" ? "dark" : "light";
                  setThemeMode(systemTheme);
                } else {
                  setThemeMode(value);
                }
              }}
            >
              <Picker.Item label="Light" value="light" />
              <Picker.Item label="Dark" value="dark" />
              <Picker.Item label="System Default" value="system" />
            </Picker>
          </View>
        </View>

        {/* Currency Preference */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>Currency</Text>
          <View style={[{borderColor: colors.main },styles.pickerWrapper]}>
            <Image
              source={require("../../assets/icons/user.png")}
              style={[styles.pickerIcon, { tintColor: colors.primary }]}
            />
            <Picker
              selectedValue={currency}
              style={[styles.picker, { color: colors.text, backgroundColor: colors.card, fontFamily: typography.fontFamily.body }]}
              onValueChange={(v) => setCurrency(v)}
            >
              <Picker.Item label="US Dollar ($)" value="USD" />
              <Picker.Item label="Euro (€)" value="EUR" />
              <Picker.Item label="Franc CFA (XAF)" value="XAF" />
              <Picker.Item label="British Pound (£)" value="GBP" />
            </Picker>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.red }]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, alignItems: "center", paddingTop: 60 },
  card: { width: "100%", padding: 20, borderRadius: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 20 },
  field: { marginBottom: 8 },
  label: {marginBottom:10},
  pickerWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: 40, overflow: "hidden" },
  pickerIcon: { width: 24, height: 24, marginLeft: 10 },
  picker: { flex: 1, height: 54 },
  logoutBtn: { marginTop: 24, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  logoutText: { color: "white", fontWeight: "600", fontSize: 16 },
});
