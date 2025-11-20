import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

export default function HorizontalScroll() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}  // hide default bar if you want custom styling
      contentContainerStyle={styles.container}
    >
      {["Food", "Transport", "Rent", "School", "Savings"].map((item, index) => (
        <View style={styles.card} key={index}>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#5A67D8",
    padding: 20,
    borderRadius: 12,
    marginRight: 12,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
