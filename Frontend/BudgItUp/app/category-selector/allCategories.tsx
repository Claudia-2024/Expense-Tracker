import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCategoryContext } from "../context/categoryContext";
import { useTheme } from "@/theme/globals";

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
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Your Categories
          </Text>

          <FlatList
              numColumns={2}
              data={displayedCategories}
              scrollEnabled={false}
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
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
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
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    elevation: 4,
  },
});