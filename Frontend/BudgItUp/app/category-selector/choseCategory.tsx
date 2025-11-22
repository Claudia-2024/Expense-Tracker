import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import CategoryCard from "../../components/Cards/categoryCard";
import { useTheme } from "@/theme/global";
import Button from "@/components/buttons/button";
import { useCategoryContext } from "../context/categoryContext";

export default function ChooseCategory() {
    const { selectedCategories, toggleCategory, defaultCategories, loading } = useCategoryContext();
    const router = useRouter();
    const theme = useTheme();
    const { colors, typography } = theme;
    const [refreshing, setRefreshing] = useState(false);

    const handleContinue = () => {
        router.replace("/(tabs)");
    };

    if (loading || refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 10 }}>Loading categories...</Text>
            </View>
        );
    }

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
                data={defaultCategories}
                numColumns={3}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => (
                    <CategoryCard
                        category={{ name: item.name }}
                        selected={selectedCategories.includes(item.name)}
                        onPress={() => toggleCategory(item.name)}
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