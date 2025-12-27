// app/AllTransactions.tsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/theme/globals";
import { useExpenseContext } from "./context/expenseContext";
import { useIncomeContext } from "./context/incomeContext";
import { useCurrency } from "@/utils/currency";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Transaction = {
    id: number;
    amount: number;
    note: string;
    type: "income" | "expense";
    category?: string;
    date?: string;
    userId: number;
};

export default function AllTransactions() {
    const theme = useTheme();
    const { colors, typography } = theme;
    const { expenses } = useExpenseContext();
    const { incomes } = useIncomeContext();
    const { format } = useCurrency();

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserId = async () => {
            try {
                const userIdStr = await AsyncStorage.getItem('userId');
                if (userIdStr) {
                    setCurrentUserId(parseInt(userIdStr));
                }
            } catch (error) {
                console.error("Error loading user ID:", error);
            } finally {
                setLoading(false);
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
                category: exp.category,
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

    const sortedTransactions = allTransactions.sort((a, b) => b.id - a.id);

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
                day: 'numeric',
                year: 'numeric'
            })}, ${timeStr}`;
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const isExpense = item.type === "expense";

        return (
            <TouchableOpacity
                style={[styles.transactionCard, { backgroundColor: colors.card }]}
                onPress={() => {
                    // Navigate to transaction details page
                    router.push({
                        pathname: "/TransactionDetails",
                        params: {
                            id: item.id.toString(),
                            type: item.type
                        }
                    });
                }}
            >
                <View style={[styles.iconCircle, {
                    backgroundColor: isExpense ? colors.red + '20' : colors.green + '20'
                }]}>
                    <Ionicons
                        name={isExpense ? "arrow-down-outline" : "arrow-up-outline"}
                        size={24}
                        color={isExpense ? colors.red : colors.green}
                    />
                </View>

                <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, {
                        color: colors.text,
                        fontFamily: typography.fontFamily.body
                    }]}>
                        {item.note}
                    </Text>
                    <Text style={[styles.transactionCategory, {
                        color: colors.muted,
                        fontFamily: typography.fontFamily.body
                    }]}>
                        {item.category || (isExpense ? "Expense" : "Income")}
                    </Text>
                    <Text style={[styles.transactionDate, {
                        color: colors.muted,
                        fontFamily: typography.fontFamily.body
                    }]}>
                        {formatDate(item)}
                    </Text>
                </View>

                <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, {
                        color: isExpense ? colors.red : colors.green,
                        fontFamily: typography.fontFamily.buttonText
                    }]}>
                        {isExpense ? '-' : '+'}{format(item.amount)}
                    </Text>
                    <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color={colors.muted}
                        style={{ marginTop: 4 }}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {
                        color: colors.text,
                        fontFamily: typography.fontFamily.boldHeading
                    }]}>
                        All Transactions
                    </Text>
                    <View style={{ width: 56 }} />
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {
                    color: colors.text,
                    fontFamily: typography.fontFamily.boldHeading
                }]}>
                    All Transactions
                </Text>
                <View style={{ width: 56 }} />
            </View>

            {sortedTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={60} color={colors.muted} />
                    <Text style={[styles.emptyText, {
                        color: colors.muted,
                        fontFamily: typography.fontFamily.body
                    }]}>
                        No transactions yet
                    </Text>
                    <Text style={[styles.emptySubtext, {
                        color: colors.muted,
                        fontFamily: typography.fontFamily.body
                    }]}>
                        Start adding your income and expenses
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sortedTransactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => `${item.type}-${item.id}`}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        flex: 1,
        textAlign: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    transactionCard: {
        flexDirection: "row",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    transactionCategory: {
        fontSize: 14,
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
    },
    transactionRight: {
        alignItems: "flex-end",
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
    },
});