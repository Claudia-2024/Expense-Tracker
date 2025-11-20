import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import categories from "../data/categories";

export default function ViewAllCategories() {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0d0d0d" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        All Categories
      </Text>

      <FlatList
        numColumns={2}
        data={[...categories, { createNew: true }]} // Add the plus square
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) =>
          item.createNew ? (
            <TouchableOpacity
              style={[styles.createCard, { backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0" }]}
              onPress={() => alert("Create Category")}
            >
              <Ionicons name="add" size={40} color="#555" />
              <Text style={{ marginTop: 10, color: isDark ? "#ccc" : "#555" }}>
                New Category
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() => router.push(`/categories/${item.id}`)}
            >
              <Ionicons name={item.icon} size={32} color="#fff" />
              <Text style={styles.label}>{item.name}</Text>
            </TouchableOpacity>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    width: "47%",
    height: 120,
    borderRadius: 20,
    margin: "1.5%",
    justifyContent: "center",
    alignItems: "center",
  },
  createCard: {
    width: "47%",
    height: 120,
    borderRadius: 20,
    margin: "1.5%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#aaa",
  },
  label: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
