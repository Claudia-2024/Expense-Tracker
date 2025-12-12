// app/Notifications.tsx - UPDATED VERSION with Read Status
import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/theme/globals";
import { useCategoryContext } from "./context/categoryContext";
import { useExpenseContext } from "./context/expenseContext";
import { useCurrency } from "@/utils/currency";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "@/services/api";

type Notification = {
    id: string;
    title: string;
    message: string;
    time: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    read: boolean;
    type: 'budget_exceeded' | 'high_spending' | 'info';
};

const NOTIFICATIONS_STORAGE_KEY = 'read_notifications';

export default function Notifications() {
    const theme = useTheme();
    const { colors, typography } = theme;
    const { customCategories } = useCategoryContext();
    const { expenses } = useExpenseContext();
    const { format } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<{ categoryId: number; amount: number }[]>([]);
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load budgets
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const userBudgets = await ApiService.getUserBudgets(parseInt(userId));
                    setBudgets(userBudgets.map(b => ({
                        categoryId: b.categoryId!,
                        amount: b.amount
                    })));

                    // Load read notifications
                    const readNotifStr = await AsyncStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
                    if (readNotifStr) {
                        setReadNotifications(new Set(JSON.parse(readNotifStr)));
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Generate notifications from budget data
    const notifications: Notification[] = useMemo(() => {
        const notifs: Notification[] = [];

        budgets.forEach(budget => {
            const category = customCategories.find(cat => cat.id === budget.categoryId);
            if (!category) return;

            // Calculate total spent in this category
            const categoryExpenses = expenses.filter(exp => exp.categoryId === budget.categoryId);
            const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            if (totalSpent > budget.amount) {
                const overAmount = totalSpent - budget.amount;
                const percentOver = ((overAmount / budget.amount) * 100).toFixed(0);
                const notifId = `budget-exceeded-${budget.categoryId}`;

                notifs.push({
                    id: notifId,
                    title: "Budget limit exceeded",
                    message: `Your ${category.name} budget of ${format(budget.amount)} has been exceeded by ${format(overAmount)} (${percentOver}% over)`,
                    time: "Recent",
                    icon: "alert-circle",
                    color: colors.red,
                    read: readNotifications.has(notifId),
                    type: 'budget_exceeded',
                });
            } else if (totalSpent > budget.amount * 0.8) {
                // Warning when 80% of budget is used
                const percentUsed = ((totalSpent / budget.amount) * 100).toFixed(0);
                const notifId = `high-spending-${budget.categoryId}`;

                notifs.push({
                    id: notifId,
                    title: "High spending alert",
                    message: `You've spent ${format(totalSpent)} on ${category.name} - ${percentUsed}% of your ${format(budget.amount)} budget`,
                    time: "Recent",
                    icon: "alert-triangle",
                    color: "#F59E0B",
                    read: readNotifications.has(notifId),
                    type: 'high_spending',
                });
            }
        });

        // Add a welcome notification if no budget notifications
        if (notifs.length === 0) {
            notifs.push({
                id: 'welcome',
                title: "Welcome to BudgitUp!",
                message: "Set budgets for your categories to receive spending alerts and stay on track with your finances.",
                time: "Just now",
                icon: "information-circle",
                color: colors.primary,
                read: readNotifications.has('welcome'),
                type: 'info',
            });
        }

        return notifs.sort((a, b) => {
            // Unread first, then by type priority
            if (a.read !== b.read) return a.read ? 1 : -1;
            const typePriority = {
                'budget_exceeded': 0,
                'high_spending': 1,
                'info': 2
            };
            return typePriority[a.type] - typePriority[b.type];
        });
    }, [budgets, customCategories, expenses, format, colors, readNotifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const newReadNotifications = new Set(readNotifications);
            newReadNotifications.add(notificationId);
            setReadNotifications(newReadNotifications);

            // Save to AsyncStorage
            await AsyncStorage.setItem(
                `${NOTIFICATIONS_STORAGE_KEY}_${userId}`,
                JSON.stringify(Array.from(newReadNotifications))
            );

            console.log('✅ Notification marked as read:', notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                { backgroundColor: colors.card },
                !item.read && styles.unreadCard,
                !item.read && { borderLeftColor: colors.primary }
            ]}
            onPress={() => {
                // Mark as read when tapped
                if (!item.read) {
                    markAsRead(item.id);
                }

                // Navigate to statistics page where they can see budget details
                router.push("/(tabs)/statistics");
            }}
        >
            <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.title, {
                    color: colors.text,
                    fontFamily: typography.fontFamily.body
                }]}>
                    {item.title}
                </Text>
                <Text style={[styles.message, {
                    color: colors.text,
                    fontFamily: typography.fontFamily.body
                }]}>
                    {item.message}
                </Text>
                <Text style={[styles.time, {
                    color: colors.muted,
                    fontFamily: typography.fontFamily.body
                }]}>
                    {item.time}
                </Text>
            </View>

            {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {
                        color: colors.text,
                        fontFamily: typography.fontFamily.boldHeading
                    }]}>
                        Notifications
                    </Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {
                    color: colors.text,
                    fontFamily: typography.fontFamily.boldHeading
                }]}>
                    Notifications
                </Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    notificationCard: {
        flexDirection: "row",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    unreadCard: {
        borderLeftWidth: 4,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
    },
    unreadDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});