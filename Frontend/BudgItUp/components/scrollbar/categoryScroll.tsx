// components/scrollbar/categoryScroll.tsx
import React from "react";
import { Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useCategoryContext } from "../../app/context/categoryContext";
import { router } from "expo-router";

export default function CategoryScroll() {
  const theme = useTheme();
  const { colors, typography } = theme;
  const { categories, selectedCategories } = useCategoryContext();

  const displayedCategories = categories.filter(
    c => !c.isDefault || selectedCategories.includes(c.name)
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
      {displayedCategories.map(cat => {
        const total = cat.expenses.reduce((sum, e) => sum + e.amount, 0);

        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { backgroundColor: cat.color }]}
            onPress={() =>
              router.push({
                pathname: "/categories/[id]",
                params: { id: cat.name },
              })
            }
          >
            <Ionicons name={cat.icon as any} size={22} color="#fff" />
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

const styles = StyleSheet.create({
  card: { width: 110, height: 110, borderRadius: 16, marginRight: 12, justifyContent: "center", alignItems: "center" },
  text: { marginTop: 4, fontSize: 14, textAlign: "center" },
});
