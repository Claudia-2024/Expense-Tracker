// components/Cards/TransactionCard.tsx - FIXED DATE DISPLAY
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/globals";
import { useExpenseContext } from "@/app/context/expenseContext";
import { useIncomeContext } from "@/app/context/incomeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCurrency } from "@/utils/currency";
import { router } from "expo-router";

type TransactionCardProps = {
    cardBackgroundColor?: string;
    expenseColor?: string;
    incomeColor?: string;
};

type Transaction = {
    id: number;
    amount: number;
    note: string;
    type: "income" | "expense";
    date?: string;
    userId: number;
};

const TransactionCard = ({
                             cardBackgroundColor,
                             expenseColor,
                             incomeColor
                         }: TransactionCardProps) => {
    const theme = useTheme();
    const { typography, colors } = theme;
    const { expenses } = useExpenseContext();
    const { incomes } = useIncomeContext();
    const { format } = useCurrency();

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const bgColor = cardBackgroundColor || colors.card;
    const expColor = expenseColor || colors.red;
    const incColor = incomeColor || colors.green;

    useEffect(() => {
        const loadUserId = async () => {
            try {
                const userIdStr = await AsyncStorage.getItem('userId');
                if (userIdStr) {
                    const userId = parseInt(userIdStr);
                    setCurrentUserId(userId);
                }
            } catch (error) {
                console.error("Error loading user ID:", error);
            }
        };
        loadUserId();
    }, []);

    const allTransactions: Transaction[] = [
        ...expenses
            .filter(exp => !exp.userId || exp.userId === currentUserId)
            .map(exp => ({
                id: exp.id,
                amount: exp.amount,
                note: exp.note || "Expense",
                type: "expense" as const,
                date: exp.date,
                userId: exp.userId || currentUserId || 0,
            })),
        ...incomes
            .filter(inc => inc.userId === currentUserId)
            .map(inc => ({
                id: inc.id,
                amount: inc.amount,
                note: inc.note || "Income",
                type: "income" as const,
                date: inc.date,
                userId: inc.userId,
            })),
    ];

    const recentTransactions = allTransactions
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    // 🔥 FIXED: Use actual date field, not id
    const formatDate = (transaction: Transaction) => {
        // First try to use the date field if it exists
        let dateObj: Date;

        if (transaction.date) {
            // If date is in format "YYYY-MM-DD", parse it
            dateObj = new Date(transaction.date);
        } else {
            // Fallback to id timestamp
            dateObj = new Date(transaction.id);
        }

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const timeStr = dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        if (dateObj.toDateString() === today.toDateString()) {
            return `Today, ${timeStr}`;
        } else if (dateObj.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${timeStr}`;
        } else {
            return `${dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })}, ${timeStr}`;
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const isExpense = item.type === "expense";
        const amount = isExpense ? -item.amount : item.amount;

        return (
            <TouchableOpacity
                style={[styles.transactionItem, { borderBottomColor: colors.muted }]}
                onPress={() => {
                    router.push({
                        pathname: "/TransactionDetails",
                        params: {
                            id: item.id.toString(),
                            type: item.type
                        }
                    });
                }}
            >
                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.gray }]}>
                        <Ionicons
                            name={isExpense ? "arrow-down-outline" : "arrow-up-outline"}
                            size={20}
                            color={isExpense ? expColor : incColor}
                        />
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                                fontFamily: typography.fontFamily.body,
                                fontSize: typography.fontSize.sm
                            }
                        ]}
                        numberOfLines={1}
                    >
                        {item.note}
                    </Text>
                    <Text
                        style={[
                            styles.category,
                            {
                                color: colors.muted,
                                fontFamily: typography.fontFamily.body,
                                fontSize: typography.fontSize.xs
                            }
                        ]}
                    >
                        {isExpense ? "Expense" : "Income"}
                    </Text>
                    <Text
                        style={[
                            styles.dateTime,
                            {
                                color: colors.muted,
                                fontFamily: typography.fontFamily.body,
                                fontSize: typography.fontSize.xs
                            }
                        ]}
                    >
                        {formatDate(item)}
                    </Text>
                </View>

                <Text
                    style={[
                        styles.amount,
                        {
                            color: isExpense ? expColor : incColor,
                            fontFamily: typography.fontFamily.buttonText,
                            fontSize: typography.fontSize.md
                        }
                    ]}
                >
                    {isExpense ? '-' : '+'}{format(Math.abs(amount))}
                </Text>
            </TouchableOpacity>
        );
    };

    if (currentUserId === null) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerText,
                            {
                                color: colors.text,
                                fontFamily: typography.fontFamily.boldHeading,
                                fontSize: typography.fontSize.lg
                            }
                        ]}
                    >
                        Recent Transactions
                    </Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.muted }]}>
                        Loading...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <Text
                    style={[
                        styles.headerText,
                        {
                            color: colors.text,
                            fontFamily: typography.fontFamily.boldHeading,
                            fontSize: typography.fontSize.lg
                        }
                    ]}
                >
                    Recent Transactions
                </Text>
            </View>

            {recentTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={40} color={colors.muted} />
                    <Text
                        style={[
                            styles.emptyText,
                            {
                                color: colors.muted,
                                fontFamily: typography.fontFamily.body,
                                fontSize: typography.fontSize.sm
                            }
                        ]}
                    >
                        No transactions yet
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={recentTransactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => `${item.type}-${item.id}`}
                    scrollEnabled={false}
                />
            )}
        </View>
    );
};

export default TransactionCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: 15,
        padding: 16,
        marginTop: 20,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        marginBottom: 16,
    },
    headerText: {
        fontWeight: "400",
    },
    transactionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconContainer: {
        marginRight: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    detailsContainer: {
        flex: 1,
    },
    title: {
        fontWeight: "500",
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        marginBottom: 2,
    },
    dateTime: {
        fontSize: 12,
    },
    amount: {
        fontWeight: "300",
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
    },
});