// app/(tabs)/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import BalanceCard from "@/components/Cards/balanceCard";
import CategoryScroll from "@/components/scrollbar/categoryScroll";
import TransactionCard from "@/components/Cards/TransactionCard";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/theme/globals";
import { useCategoryContext } from "@/app/context/categoryContext";
import { useExpenseContext } from "@/app/context/expenseContext";
import ApiService, { DashboardStatsDto } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = () => {
    const theme = useTheme();
    const { typography, colors } = theme;

    const { refreshCategories } = useCategoryContext();
    const { refreshExpenses } = useExpenseContext();

    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');

            if (userId) {
                // Refresh categories and expenses
                await refreshCategories();
                await refreshExpenses();

                // Fetch dashboard stats from backend
                const dashboardStats = await ApiService.getDashboardStats(parseInt(userId));
                setStats(dashboardStats);
            }
        } catch (error) {
            console.error("Error loading home data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Use useFocusEffect to refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Top row: Income & Expenses */}
            <View style={styles.row}>
                <BalanceCard
                    title="Income"
                    icon="trending-up-outline"
                    amount={stats?.totalIncome || 0}
                />
                <BalanceCard
                    title="Expenses"
                    icon="trending-down-outline"
                    amount={stats?.totalExpenses || 0}
                />
            </View>

            {/* Remaining Budget Card */}
            {stats && stats.remainingBudget !== undefined && (
                <View style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.boxBorder }]}>
                    <Text style={[styles.budgetLabel, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                        Remaining Budget
                    </Text>
                    <Text style={[styles.budgetAmount, {
                        color: stats.remainingBudget >= 0 ? colors.green : colors.red,
                        fontFamily: typography.fontFamily.boldHeading
                    }]}>
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "XAF",
                        }).format(stats.remainingBudget)}
                    </Text>
                </View>
            )}

            {/* View All Categories button */}
            <TouchableOpacity
                onPress={() => router.push("/category-selector/allCategories")}
                style={{ marginLeft: 16, marginBottom: 10, marginTop: 10 }}
            >
                <Text
                    style={[
                        styles.viewAllText,
                        {
                            color: colors.text,
                            fontFamily: typography.fontFamily.boldHeading,
                            fontSize: typography.fontSize.md,
                        },
                    ]}
                >
                    View All Categories
                </Text>
            </TouchableOpacity>

            {/* Horizontal Scroll: Selected + Custom Categories */}
            <CategoryScroll />

            {/* Recent Transactions Card */}
            <TransactionCard
                cardBackgroundColor="rgba(244, 244, 244, 0.69)"
                expenseColor="#ff1f3dff"
                incomeColor="#32d33dff"
            />
        </ScrollView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    budgetCard: {
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 6,
        marginVertical: 10,
        borderWidth: 2,
        alignItems: 'center',
    },
    budgetLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    budgetAmount: {
        fontSize: 24,
        fontWeight: '700',
    },
    viewAllText: {
        fontWeight: "600",
        fontSize: 16,
        paddingTop: 5,
    },
});