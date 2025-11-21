// app/get-started-minimal.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import Button from "@/components/buttons/button";
import { useTheme } from "@/theme/global";

export default function GetStartedMinimal() {
  const scheme = useColorScheme();
  const router = useRouter();
    const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require("../assets/images/light.png")} style={styles.hero} resizeMode="contain" />
      <Text style={[styles.title, { color: colors.text  }]}>Track your spending simply</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Clean insights, no clutter. Start tracking your expenses in seconds.
      </Text>
        <Button title="Get Started" onPress={() => router.push("/auth/signup")} />

    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:"center",justifyContent:"space-between",paddingTop:80,paddingBottom:80},
  hero:{width:"70%",height:280,marginTop:20},
  title:{fontSize:28,fontWeight:"700",textAlign:"center"},
  subtitle:{fontSize:15,textAlign:"center",width:"78%",lineHeight:22, marginTop:8},
  button:{paddingVertical:14,paddingHorizontal:36,borderRadius:12,shadowColor:"#000",elevation:4},
  buttonText:{fontSize:16,fontWeight:"700"}
});