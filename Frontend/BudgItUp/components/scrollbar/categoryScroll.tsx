import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useCategoryContext, CustomCategory } from "../../app/context/categoryContext";
import { router } from "expo-router";

export default function CategoryScroll() {
  const theme = useTheme();
  const { colors, typography } = theme;

  const { selectedCategories, customCategories } = useCategoryContext();

  // Combine selected default categories with custom categories
const displayedCategories: CustomCategory[] = [
  ...customCategories,
  ...selectedCategories.map((name, index) => ({
    id: index + 1,
    name,
    icon: getIconForCategory(name),
    color: getColorForCategory(name),
    expenses: [],
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

  function getColorForCategory(name: string) {
    switch (name) {
      case "Food": return "#FFB3AB";
      case "Transport": return "#88C8FC";
      case "Airtime": return "#F7D07A";
      case "Social Events": return "#D291BC";
      case "Shopping": return "#E6A8D7";
      case "Rent": return "#A0CED9";
      case "Bills": return "#9F8AC2";
      case "Emergency": return "#FF9E9E";
      case "Medical expenses": return "#81C784";
      default: return "#348DDB";
    }
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10 }}
    >
      {displayedCategories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.card, { backgroundColor: cat.color }]}
          onPress={() =>
              router.push({
                pathname: "/categories/[id]",
                params: { id: String(cat.id) },
              })
          }

        >
          <Ionicons name={cat.icon as any} size={22} color="#fff" />

          <Text
            style={[
              styles.text,
              {
                color: "#fff",
                fontFamily: typography.fontFamily.boldHeading,
              },
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    height: 110,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});
