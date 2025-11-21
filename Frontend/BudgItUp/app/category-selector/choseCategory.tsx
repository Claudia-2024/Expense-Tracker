import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import CategoryCard, { DefaultCategoryName } from "../../components/Cards/categoryCard";
import { useTheme } from "@/theme/global";
import Button from "@/components/buttons/button";
import { useCategoryContext } from "../context/categoryContext";

// List of default categories
const CATEGORIES: DefaultCategoryName[] = [
  "Food",
  "Transport",
  "Airtime",
  "Social Events",
  "Shopping",
  "Rent",
  "Bills",
  "Emergency",
  "Medical expenses",
];

export default function ChooseCategory() {
  const { selectedCategories, toggleCategory } = useCategoryContext();
  const router = useRouter();
  const theme = useTheme();
  const { colors, typography } = theme;

  const handleContinue = () => {
    router.replace("/(tabs)"); // Navigate to home
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={{
          fontFamily: typography.fontFamily.boldHeading,
          fontSize: typography.fontSize.lg,
          fontWeight: "700",
          textAlign: "center",
          color: colors.text,
        }}
      >
        Choose Your Spending Categories
      </Text>

      <Text
        style={{
          fontFamily: typography.fontFamily.buttonText,
          fontSize: typography.fontSize.md,
          padding: 5,
          color: colors.text,
          textAlign: "center",
        }}
      >
        Select the categories you want to track
      </Text>

      <FlatList
        data={CATEGORIES}
        numColumns={3}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <CategoryCard
            category={{ name: item }} // Pass default category as object
            selected={selectedCategories.includes(item)}
            onPress={() => toggleCategory(item)}
          />
        )}
      />

      <Button
        title="Continue"
        disabled={selectedCategories.length === 0}
        onPress={handleContinue}
        style={{ marginBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
});
