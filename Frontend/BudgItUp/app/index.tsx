// app/get-started-minimal.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import Button from "@/components/buttons/button";

export default function GetStartedMinimal() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#FFF" }]}>
      <Image source={require("../assets/images/icon.png")} style={styles.hero} resizeMode="contain" />
      <Text style={[styles.title, { color: isDark ? "#FFF" : "#0B1220" }]}>Track your spending simply</Text>
      <Text style={[styles.subtitle, { color: isDark ? "#AAA" : "#6B7280" }]}>
        Clean insights, no clutter. Start tracking your expenses in seconds.
      </Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: isDark ? "#1F2937" : "#111827" }]} onPress={() => router.push("/auth/signup")}>
        <Text style={[styles.buttonText, { color: "#FFF" }]}>Get Started</Text>
      </TouchableOpacity>
        <Button title="Get Started" />

    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:"center",justifyContent:"space-between",paddingTop:80,paddingBottom:80},
  hero:{width:"70%",height:260,marginTop:20},
  title:{fontSize:28,fontWeight:"700",textAlign:"center"},
  subtitle:{fontSize:15,textAlign:"center",width:"78%",lineHeight:22, marginTop:8},
  button:{paddingVertical:14,paddingHorizontal:36,borderRadius:12,shadowColor:"#000",elevation:4},
  buttonText:{fontSize:16,fontWeight:"700"}
});
