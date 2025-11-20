import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import CategoryCard, { CategoryName } from "../../components/Cards/categoryCard";
import { useTheme } from "@/theme/global";
import Button from "@/components/buttons/button";

const CATEGORIES: CategoryName[] = [
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
  const theme = useTheme();
  const {typography} = theme;
  const router = useRouter();

  const [selectedCategories, setSelectedCategories] = useState<CategoryName[]>([]);

  const toggleCategory = (category: CategoryName, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  const handleContinue = () => {
    // Later you can save this to user profile, async storage, API, etc.
    console.log("Selected:", selectedCategories);

    router.replace("/(tabs)"); // redirect to home tab
  };

  return (
    <View style={styles.container}>
      <Text style={{fontFamily: typography.fontFamily.boldHeading, fontSize: typography.fontSize.lg, fontWeight: "700",textAlign: "center",}}>Choose Your Spending Categories</Text>
      <Text style={{fontFamily: typography.fontFamily.buttonText, fontSize:typography.fontSize.sm}}>Select the categories you want to track</Text>

      <FlatList
        data={CATEGORIES}
        numColumns={3}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            selected={selectedCategories.includes(item)}
            onPress={(isSelected: boolean) => toggleCategory(item, isSelected)}
          />
        )}
      />

      {/* Continue Button */}
      <Button title="Continue" disabled={selectedCategories.length === 0}
        onPress={handleContinue} />
      {/* <Pressable
        style={[
          styles.continueButton,
          { opacity: selectedCategories.length === 0 ? 0.5 : 1 },
        ]}
        disabled={selectedCategories.length === 0}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#777",
  },
  continueButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
