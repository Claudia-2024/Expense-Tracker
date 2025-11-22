import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCategoryContext } from "../context/categoryContext";
import { useTheme } from "@/theme/global";

export default function ViewAllCategories() {
  const { selectedCategories, customCategories, defaultCategories, refreshCategories } = useCategoryContext();
  const theme = useTheme();
  const { colors, typography } = theme;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      setLoading(true);
      await refreshCategories();
      setLoading(false);
    };
    refresh();
  }, []);

  // Combine custom categories + selected default categories
  const displayedCategories = [
    ...customCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isDefault: false,
    })),
    ...defaultCategories
        .filter(defCat => selectedCategories.includes(defCat.name))
        .map(defCat => ({
          id: defCat.id,
          name: defCat.name,
          icon: getIconForCategory(defCat.name),
          color: defCat.color,
          isDefault: true,
        })),
  ];

  function getIconForCategory(name: string) {
    switch (name) {
      case "Food": return "fast-food-outline";
      case "Transport": return "car-outline";
      case "Airtime": return "phone-portrait-outline";
      case "Social Events": return "people-outline";
      case "Shopping": return "cart-outline";
      case "Rent": return "home-outline";
      case "Bills": return "document-text-outline";
      case "Emergency": return "alert-circle-outline";
      case "Medical expenses": return "medkit-outline";
      default: return "pricetag-outline";
    }
  }

  const handlePressCategory = (item: typeof displayedCategories[number]) => {
    // Navigate to the category page with the category ID
    router.push({
      pathname: "/categories/[id]",
      params: { id: item.id.toString() },
    });
  };

  if (loading) {
    return (
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Your Categories
        </Text>

        <FlatList
            numColumns={2}
            data={displayedCategories}
            keyExtractor={(item) => item.id.toString()}
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