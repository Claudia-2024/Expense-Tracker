
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCategoryContext, CustomCategory } from "../context/categoryContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/theme/globals";

export default function AddCategory() {
    const { addCustomCategory, updateCustomCategory, customCategories } = useCategoryContext();
    const theme = useTheme();
    const { colors, typography } = theme;
    const router = useRouter();
    const params = useLocalSearchParams();

    const editingCategory: CustomCategory | undefined = params.category
        ? JSON.parse(params.category as string)
        : undefined;

    const [name, setName] = useState(editingCategory?.name || "");
    const [color, setColor] = useState(editingCategory?.color || "#348DDB");
    const [icon, setIcon] = useState(editingCategory?.icon || "pricetag-outline");
    const [saving, setSaving] = useState(false);

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

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a category name");
            return;
        }

        // Prevent duplicate names
        const nameExists = customCategories.some(
            c => c.name === name && c.id !== editingCategory?.id
        );
        if (nameExists) {
            Alert.alert("Error", "Category with this name already exists!");
            return;
        }

        setSaving(true);

        try {
            const newCategory: CustomCategory = {
                id: editingCategory ? editingCategory.id : Date.now(),
                name: name.trim(),
                color,
                icon,
                expenses: editingCategory?.expenses || [],
                isDefault: false
            };

            if (editingCategory) {
                await updateCustomCategory(newCategory);
                Alert.alert("Success", "Category updated successfully");
            } else {
                await addCustomCategory(newCategory);
                Alert.alert("Success", "Category created successfully");
            }

            router.back();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to save category");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, {
                fontFamily: typography.fontFamily.boldHeading,
                fontSize: typography.fontSize.lg,
                color: colors.text,
            }]}>
                {editingCategory ? "Edit Category" : "Add New Category"}
            </Text>

            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                Category Name
            </Text>
            <TextInput
                style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
                placeholder="Enter category name"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
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
                style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={[styles.saveText, { fontFamily: typography.fontFamily.boldHeading }]}>
                        {editingCategory ? "Update Category" : "Add Category"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },
    label: { fontSize: 16, fontWeight: "600", marginVertical: 10 },
    input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
    iconBox: { width: 60, height: 60, justifyContent: "center", alignItems: "center", borderWidth: 2, borderRadius: 12, marginRight: 10 },
    colorBox: { width: 50, height: 50, borderRadius: 12, marginRight: 10 },
    saveButton: { marginTop: 30, paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});