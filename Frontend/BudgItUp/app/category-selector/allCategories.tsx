// app/category-selector/myCategories.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCategoryContext } from "../context/categoryContext";
import { useTheme } from "@/theme/global";
import { router } from "expo-router";

export default function MyCategories() {
  const { colors, typography } = useTheme();
  const { categories, selectedCategories } = useCategoryContext();

  // Show custom categories + selected default categories
  const visibleCategories = categories.filter(
    c => !c.isDefault || selectedCategories.includes(c.name)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={{
          fontSize: 22,
          marginBottom: 18,
          color: colors.text,
          fontFamily: typography.fontFamily.boldHeading,
        }}
      >
        My Categories
      </Text>

      <FlatList
        numColumns={2}
        data={visibleCategories}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const total = item.expenses.reduce((sum, e) => sum + e.amount, 0);

          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() =>
                router.push({
                  pathname: "/categories/[id]",
                  params: { id: item.name }, // you use name as id in CategoryPage
                })
              }
            >
              <Ionicons name={item.icon as any} size={26} color="#fff" />
              <Text style={[styles.label, { fontFamily: typography.fontFamily.body }]}>
                {item.name}
              </Text>
              <Text
                style={[
                  styles.amountText,
                  { fontFamily: typography.fontFamily.buttonText },
                ]}
              >
                {total.toLocaleString("en-US")} XAF
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Add Category Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/category-selector/addCategory")}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <Text
          style={{
            color: "#fff",
            marginLeft: 6,
            fontFamily: typography.fontFamily.boldHeading,
          }}
        >
          Add Category
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// -------------------------------
// Styles
// -------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 55,
  },
  card: {
    width: "47%",
    height: 140,
    borderRadius: 18,
    margin: "1.5%",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  amountText: {
    marginTop: 4,
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 4,
  },
});
