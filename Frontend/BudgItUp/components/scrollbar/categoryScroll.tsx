// components/scrollbar/categoryScroll.tsx
// REPLACE ENTIRE FILE

import React, { useState, useEffect } from "react";
import { Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useCategoryContext } from "../../app/context/categoryContext";
import { useExpenseContext } from "../../app/context/expenseContext";
import { router } from "expo-router";
import ApiService from "../../services/api";

export default function CategoryScroll() {
  const theme = useTheme();
  const { colors, typography } = theme;
  const { customCategories, defaultCategories, selectedCategories, loading } = useCategoryContext();
  const { expenses } = useExpenseContext();
  const [categoryTotals, setCategoryTotals] = useState<{ [key: number]: number }>({});

  // Combine custom categories + selected default categories
  const displayedCategories = [
    ...customCategories,
    ...defaultCategories.filter(defCat => selectedCategories.includes(defCat.name))
  ];

  // Load totals for all categories
  useEffect(() => {
    const loadTotals = async () => {
      const totals: { [key: number]: number } = {};

      for (const cat of displayedCategories) {
        try {
          const total = await ApiService.getCategoryTotal(cat.id);
          totals[cat.id] = total;
        } catch (error) {
          console.error(`Error loading total for category ${cat.id}:`, error);
          totals[cat.id] = 0;
        }
      }

      setCategoryTotals(totals);
    };

    if (displayedCategories.length > 0) {
      loadTotals();
    }
  }, [displayedCategories.length, expenses]);

  if (loading) {
    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
    );
  }

  if (displayedCategories.length === 0) {
    return (
        <View style={{ padding: 20 }}>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>
            No categories yet. Add some from the category selector!
          </Text>
        </View>
    );
  }

  return (
      <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {displayedCategories.map(cat => {
          const total = categoryTotals[cat.id] || 0;
          const icon = cat.icon || getIconForCategory(cat.name);

          return (
              <TouchableOpacity
                  key={cat.id}
                  style={[styles.card, { backgroundColor: cat.color }]}
                  onPress={() =>
                      router.push({
                        pathname: "/categories/[id]",
                        params: { id: cat.id.toString() },
                      })
                  }
              >
                <Ionicons name={icon as any} size={22} color="#fff" />
                <Text style={[styles.text, { color: "#fff", fontFamily: typography.fontFamily.boldHeading }]}>
                  {cat.name}
                </Text>
                <Text style={[styles.text, { color: "#fff", fontFamily: typography.fontFamily.buttonText, fontSize: 12 }]}>
                  {total.toLocaleString("en-US")} XAF
                </Text>
              </TouchableOpacity>
          );
        })}
      </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  card: {
    width: 110,
    height: 110,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  text: {
    marginTop: 4,
    fontSize: 14,
    textAlign: "center",
  },
});