// app/(tabs)/index.tsx - FIXED with Button-styled "View All Categories"
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
import { useTutorial } from "@/app/context/tutorialContext";
import TutorialOverlay from "@/components/TutorialOverlay";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import { useCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";

const Home = () => {
    const theme = useTheme();
    const { typography, colors } = theme;

    const { refreshCategories, customCategories } = useCategoryContext();
    const { refreshExpenses, expenses } = useExpenseContext();
    const { hasSeenTutorial, markTutorialAsSeen } = useTutorial();

    const { format } = useCurrency();

    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [userName, setUserName] = useState("");
    const [budgetAlertCount, setBudgetAlertCount] = useState(0);
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

    const NOTIFICATIONS_STORAGE_KEY = 'read_notifications';

    const tutorialSteps = [
        {
            id: 'home_income',
            title: 'Income Card',
            description: 'This shows your total monthly income or budget that you\'ve set up for the month.',
            position: 'top' as const,
        },
        {
            id: 'home_expenses',
            title: 'Expenses Card',
            description: 'Track all your spending here. This displays the total amount you\'ve spent this month.',
            position: 'top' as const,
        },
        {
            id: 'home_remaining',
            title: 'Remaining Budget',
            description: 'See how much money you have left from your budget. Green means you\'re within budget, red means you\'ve exceeded it.',
            position: 'center' as const,
        },
        {
            id: 'home_quick_actions',
            title: 'Quick Actions',
            description: 'Access all transactions, notifications, and category management from these quick action buttons.',
            position: 'center' as const,
        },
        {
            id: 'home_categories',
            title: 'Your Categories',
            description: 'Scroll through your spending categories. Tap "View All Categories" to see detailed breakdowns and manage your categories.',
            position: 'center' as const,
        },
        {
            id: 'home_transactions',
            title: 'Recent Transactions',
            description: 'Your latest income and expense transactions appear here. Tap any transaction to view details.',
            position: 'bottom' as const,
        },
    ];

    const loadData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');

            if (userId) {
                const profile = await ApiService.getUserProfile(parseInt(userId));
                setUserName(profile.name);

                const readNotifStr = await AsyncStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
                if (readNotifStr) {
                    setReadNotifications(new Set(JSON.parse(readNotifStr)));
                }

                await refreshCategories();
                await refreshExpenses();

                const dashboardStats = await ApiService.getDashboardStats(parseInt(userId));
                setStats(dashboardStats);
            }
        } catch (error) {
            console.error("Error loading home data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkWelcomeAndTutorial = async () => {
            if (loading) return;

            const seenWelcome = await hasSeenTutorial('home_welcome');

            if (!seenWelcome) {
                setShowWelcome(true);
            } else {
                const seenTutorial = await hasSeenTutorial('home');
                if (!seenTutorial) {
                    setTimeout(() => setShowTutorial(true), 500);
                }
            }
        };
        checkWelcomeAndTutorial();
    }, [loading]);

    const handleWelcomeComplete = async () => {
        setShowWelcome(false);
        await markTutorialAsSeen('home_welcome');

        const seenTutorial = await hasSeenTutorial('home');
        if (!seenTutorial) {
            setTimeout(() => setShowTutorial(true), 300);
        }
    };

    const handleTutorialComplete = async () => {
        await markTutorialAsSeen('home');
        setShowTutorial(false);
    };

    const handleTutorialSkip = async () => {
        await markTutorialAsSeen('home');
        setShowTutorial(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const reloadReadNotifications = async () => {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const readNotifStr = await AsyncStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
                    if (readNotifStr) {
                        setReadNotifications(new Set(JSON.parse(readNotifStr)));
                    }
                }
            };
            reloadReadNotifications();
        }, [])
    );

    useEffect(() => {
        const calculateBudgetAlerts = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                const budgets = await ApiService.getUserBudgets(parseInt(userId));
                let unreadAlertCount = 0;

                budgets.forEach(budget => {
                    const categoryExpenses = expenses.filter(exp => exp.categoryId === budget.categoryId);
                    const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

                    if (totalSpent > budget.amount * 0.8) {
                        let notifId: string;
                        if (totalSpent > budget.amount) {
                            notifId = `budget-exceeded-${budget.categoryId}`;
                        } else {
                            notifId = `high-spending-${budget.categoryId}`;
                        }

                        if (!readNotifications.has(notifId)) {
                            unreadAlertCount++;
                        }
                    }
                });

                setBudgetAlertCount(unreadAlertCount);
            } catch (error) {
                console.error("Error calculating budget alerts:", error);
            }
        };

        calculateBudgetAlerts();
    }, [expenses, customCategories, readNotifications]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
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
                            {format(stats.remainingBudget)}
                        </Text>
                    </View>
                )}

                {/* Quick Action Buttons */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                        onPress={() => router.push("/AllTransactions")}
                    >
                        <Ionicons name="list-outline" size={24} color={colors.primary} />
                        <Text style={[styles.quickActionText, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            All Transactions
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                        onPress={() => router.push("/Notifications")}
                    >
                        <View style={styles.notificationIconContainer}>
                            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                            {budgetAlertCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: colors.red }]}>
                                    <Text style={styles.badgeText}>{budgetAlertCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.quickActionText, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            Notifications
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* View All Categories button - NOW STYLED AS A BUTTON */}
                <TouchableOpacity
                    onPress={() => router.push("/category-selector/allCategories")}
                    style={[styles.viewAllButton, {
                        backgroundColor: colors.card,
                        borderColor: colors.primary,
                    }]}
                >
                    <Ionicons name="grid-outline" size={20} color={colors.primary} />
                    <Text
                        style={[
                            styles.viewAllText,
                            {
                                color: colors.primary,
                                fontFamily: typography.fontFamily.boldHeading,
                                fontSize: typography.fontSize.sm,
                            },
                        ]}
                    >
                        View All Categories
                    </Text>
                    <Ionicons name="chevron-forward-outline" size={20} color={colors.primary} />
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

            <WelcomeOverlay
                visible={showWelcome}
                userName={userName}
                onComplete={handleWelcomeComplete}
            />

            <TutorialOverlay
                visible={showTutorial}
                steps={tutorialSteps}
                onComplete={handleTutorialComplete}
                onSkip={handleTutorialSkip}
            />
        </>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
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
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 6,
        marginVertical: 10,
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    notificationIconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginHorizontal: 6,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 2,
        gap: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    viewAllText: {
        fontWeight: "600",
        flex: 1,
    },
});