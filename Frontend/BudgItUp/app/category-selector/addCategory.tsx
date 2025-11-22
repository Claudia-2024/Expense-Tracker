// app/screens/AddCategory.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCategoryContext, CustomCategory } from "../context/categoryContext";
import { useTheme } from "@/theme/global";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AddCategory() {
  const { addCustomCategory, updateCustomCategory, categories } = useCategoryContext();
  const theme = useTheme();
  const { colors, typography } = theme;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // If editing, find the existing category
  const editingCategory: CustomCategory | undefined = id
    ? (categories.find(c => c.id.toString() === id) as CustomCategory)
    : undefined;

  const [name, setName] = useState(editingCategory?.name || "");
  const [color, setColor] = useState(editingCategory?.color || "#348DDB");
  const [icon, setIcon] = useState(editingCategory?.icon || "pricetag-outline");

  const icons = [
    "pricetag-outline",
    "fast-food-outline",
    "car-outline",
    "home-outline",
    "cart-outline",
    "medkit-outline",
    "alert-circle-outline",
    "people-outline",
  ];

  const colorsPalette = [
    "#FFB3AB",
    "#88C8FC",
    "#F7D07A",
    "#D291BC",
    "#E6A8D7",
    "#A0CED9",
    "#9F8AC2",
    "#FF9E9E",
    "#81C784",
  ];

  const handleSave = () => {
    if (!name) return;

    // Prevent duplicate names
    const nameExists = categories.some(
      c => c.name === name && c.id !== editingCategory?.id
    );
    if (nameExists) {
      alert("Category with this name already exists!");
      return;
    }

    const newCategory: CustomCategory = {
      id: editingCategory ? editingCategory.id : Date.now(),
      name,
      color,
      icon,
      expenses: editingCategory?.expenses ?? [],
      isDefault: false,
    };

    editingCategory ? updateCustomCategory(newCategory) : addCustomCategory(newCategory);

    // Navigate back to Home page
    router.push("/");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        Category Name
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter category name"
        placeholderTextColor={colors.muted}
        style={[styles.input, { borderColor: colors.primary, color: colors.text, fontFamily: typography.fontFamily.body }]}
      />

      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        Select Icon
      </Text>
      <FlatList
        data={icons}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.iconBox, { borderColor: icon === item ? colors.primary : colors.muted }]}
            onPress={() => setIcon(item)}
          >
            <Ionicons name={item as any} size={28} color={colors.text} />
          </TouchableOpacity>
        )}
      />

      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        Select Color
      </Text>
      <FlatList
        data={colorsPalette}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.colorBox, { backgroundColor: item, borderWidth: color === item ? 3 : 0, borderColor: colors.primary }]}
            onPress={() => setColor(item)}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveText, { fontFamily: typography.fontFamily.boldHeading }]}>
          {editingCategory ? "Update Category" : "Add Category"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: "600", marginVertical: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  iconBox: { width: 60, height: 60, justifyContent: "center", alignItems: "center", borderWidth: 2, borderRadius: 12, marginRight: 10 },
  colorBox: { width: 50, height: 50, borderRadius: 12, marginRight: 10 },
  saveButton: { marginTop: 30, paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
