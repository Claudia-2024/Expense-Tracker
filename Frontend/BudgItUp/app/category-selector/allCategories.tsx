import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import defaultCategories from "../data/categories";
import { useCategoryContext } from "../context/categoryContext";
import { useTheme } from "@/theme/global";

export default function ViewAllCategories() {
  const { selectedCategories, customCategories } = useCategoryContext();
  const theme = useTheme();
  const { colors, typography } = theme;

  // Only selected default categories + custom categories
  const displayedCategories = [
    ...customCategories.map(cat => ({ ...cat, isDefault: false })),
    ...selectedCategories.map((name, index) => {
      const cat = defaultCategories.find(c => c.name === name);
      return {
        id: cat?.id ?? index, // unique id
        name,
        icon: cat?.icon ?? "pricetag-outline",
        color: cat?.color ?? "#348DDB",
        isDefault: true,
      };
    }),
  ];

  const handlePressCategory = (item: typeof displayedCategories[number]) => {
    if (item.isDefault) {
      router.push({
        pathname: "/categories/[id]",
        params: { id: item.id?.toString() ?? item.name },
      });
    } else {
      router.push({
        pathname: "/category-selector/editCategory",
        params: { id: item.id.toString() },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        Your Categories
      </Text>

      <FlatList
        numColumns={2}
        data={displayedCategories}
        keyExtractor={(item, index) => item.id?.toString() ?? item.name + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => handlePressCategory(item)}
          >
            <Ionicons name={item.icon as any} size={32} color="#fff" />
            <Text style={[styles.label, { fontFamily: typography.fontFamily.body }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/category-selector/addCategory")}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add New Category</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  card: {
    width: "47%",
    height: 120,
    borderRadius: 20,
    margin: "1.5%",
    justifyContent: "center",
    alignItems: "center",
  },
  label: { marginTop: 10, color: "#fff", fontSize: 16, fontWeight: "600" },
  addButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
});
