// app/category-selector/choseCategory.tsx
// COPY AND PASTE THIS ENTIRE FILE

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import CategoryCard from "../../components/Cards/categoryCard";
import { useTheme } from "@/theme/global";
import Button from "@/components/buttons/button";
import { useCategoryContext } from "../context/categoryContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../../services/api";

export default function ChooseCategory() {
    // FOr choosing the categories
    const { defaultCategories, loading, refreshCategories } = useCategoryContext();
    const router = useRouter();
    const theme = useTheme();
    const { colors, typography } = theme;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const loadDefaults = async () => {
            await refreshCategories();
        };
        loadDefaults();
    }, []);

    const handleToggle = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(catId => catId !== id)
                : [...prev, id]
        );
    };

    const handleContinue = async () => {
        if (selectedIds.length === 0) {
            Alert.alert("Error", "Please select at least one category");
            return;
        }

        setRegistering(true);

        try {
            // Get stored credentials
            const email = await AsyncStorage.getItem('tempEmail');
            const password = await AsyncStorage.getItem('tempPassword');

            if (!email || !password) {
                Alert.alert("Error", "Registration data not found. Please try again.");
                await AsyncStorage.removeItem('tempEmail');
                await AsyncStorage.removeItem('tempPassword');
                router.replace("/auth/signup");
                return;
            }

            console.log("=== STARTING REGISTRATION ===");
            console.log("Email:", email);
            console.log("Selected category IDs:", selectedIds);

            // CALL THE BACKEND API TO REGISTER
            const response = await ApiService.register({
                email: email,
                password: password,
                defaultCategoryIds: selectedIds,
            });

            console.log("=== REGISTRATION SUCCESSFUL ===");
            console.log("User ID:", response.userId);
            console.log("Token received:", response.token ? "Yes" : "No");

            // Clear temporary storage
            await AsyncStorage.removeItem('tempEmail');
            await AsyncStorage.removeItem('tempPassword');
            await AsyncStorage.removeItem('tempName');
            await AsyncStorage.removeItem('tempPhone');

            // Refresh categories to load user's newly created categories
            await refreshCategories();

            Alert.alert(
                "Success",
                "Account created successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/(tabs)")
                    }
                ]
            );
        } catch (error: any) {
            console.error("=== REGISTRATION FAILED ===");
            console.error("Error:", error);
            console.error("Error message:", error.message);

            // Clear temp data on error
            await AsyncStorage.removeItem('tempEmail');
            await AsyncStorage.removeItem('tempPassword');
            await AsyncStorage.removeItem('tempName');
            await AsyncStorage.removeItem('tempPhone');

            Alert.alert(
                "Registration Failed",
                error.message || "Unable to create account. Please try again.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/auth/signup")
                    }
                ]
            );
        } finally {
            setRegistering(false);
        }
    };

    if (loading || registering) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 10 }}>
                    {registering ? "Creating your account..." : "Loading categories..."}
                </Text>
            </View>
        );
    }

    if (defaultCategories.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>
                    Unable to load categories. Please check your connection.
                </Text>
                <Button
                    title="Retry"
                    onPress={refreshCategories}
                />
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
                    marginTop: 20,
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
                    marginBottom: 10,
                }}
            >
                Select at least one category to track your expenses
            </Text>

            <FlatList
                data={defaultCategories}
                numColumns={3}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => (
                    <CategoryCard
                        category={{ name: item.name }}
                        selected={selectedIds.includes(item.id)}
                        onPress={() => handleToggle(item.id)}
                    />
                )}
            />

            <Button
                title={selectedIds.length === 0 ? "Select at least one category" : `Continue (${selectedIds.length} selected)`}
                disabled={selectedIds.length === 0 || registering}
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