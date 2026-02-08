import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/theme/globals";
import { useExpenseContext } from "./context/expenseContext";
import { useIncomeContext } from "./context/incomeContext";
import { useCurrency } from "@/utils/currency";
import { useCategoryContext } from "./context/categoryContext";

export default function TransactionDetails() {
    const theme = useTheme();
    const { colors, typography } = theme;
    const { expenses, deleteExpense } = useExpenseContext();
    const { incomes } = useIncomeContext();
    const { customCategories } = useCategoryContext();
    const { format } = useCurrency();
    const params = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadTransaction();
    }, [params.id, params.type]);

    const loadTransaction = () => {
        try {
            const id = parseInt(params.id as string);
            const type = params.type as 'income' | 'expense';

            if (type === 'expense') {
                const expense = expenses.find(e => e.id === id);
                if (expense) {
                    setTransaction({
                        ...expense,
                        type: 'expense',
                        categoryName: expense.category,
                    });
                }
            } else {
                const income = incomes.find(i => i.id === id);
                if (income) {
                    const category = customCategories.find(c => c.id === income.categoryId);
                    setTransaction({
                        ...income,
                        type: 'income',
                        categoryName: category?.name || 'Overall Budget',
                    });
                }
            }
        } catch (error) {
            console.error('Error loading transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            if (transaction.type === 'expense') {
                                await deleteExpense(transaction.id);
                            }
                            // TODO: Add delete for income if needed

                            Alert.alert("Success", "Transaction deleted successfully");
                            router.back();
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Failed to delete transaction");
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    // 🔥 FIXED: Use actual date field
    const formatDate = (transaction: any) => {
        let dateObj: Date;

        if (transaction.date) {
            dateObj = new Date(transaction.date);
        } else {
            dateObj = new Date(transaction.id);
        }

        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (transaction: any) => {
        let dateObj: Date;

        if (transaction.date) {
            dateObj = new Date(transaction.date);
        } else {
            dateObj = new Date(transaction.id);
        }

        return dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={theme.themeMode === 'dark' ? "light-content" : "dark-content"} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {
                        color: colors.text,
                        fontFamily: typography.fontFamily.boldHeading
                    }]}>
                        Transaction Details
                    </Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!transaction) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={theme.themeMode === 'dark' ? "light-content" : "dark-content"} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {
                        color: colors.text,
                        fontFamily: typography.fontFamily.boldHeading
                    }]}>
                        Transaction Details
                    </Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.muted }]}>
                        Transaction not found
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const isIncome = transaction.type === 'income';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme.themeMode === 'dark' ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {
                    color: colors.text,
                    fontFamily: typography.fontFamily.boldHeading
                }]}>
                    Transaction Details
                </Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Amount Card */}
                <View style={[styles.amountCard, {
                    backgroundColor: colors.card,
                    shadowColor: colors.text,
                }]}>
                    <Text style={[styles.amountLabel, {
                        color: colors.muted,
                        fontFamily: typography.fontFamily.body
                    }]}>
                        Amount
                    </Text>
                    <Text style={[styles.amount, {
                        color: isIncome ? colors.green : colors.red,
                        fontFamily: typography.fontFamily.boldHeading
                    }]}>
                        {isIncome ? '+' : '-'}{format(transaction.amount)}
                    </Text>
                </View>

                {/* Icon & Title */}
                <View style={styles.iconSection}>
                    <View style={[styles.iconCircleLarge, {
                        backgroundColor: isIncome ? colors.green + "20" : colors.red + "20"
                    }]}>
                        <Ionicons
                            name={isIncome ? "arrow-up-outline" : "arrow-down-outline"}
                            size={36}
                            color={isIncome ? colors.green : colors.red}
                        />
                    </View>
                    <Text style={[styles.transactionTitle, {
                        color: colors.text,
                        fontFamily: typography.fontFamily.boldHeading
                    }]}>
                        {transaction.note || (isIncome ? "Income" : "Expense")}
                    </Text>
                    <Text style={[styles.transactionCategory, {
                        color: colors.muted,
                        fontFamily: typography.fontFamily.body
                    }]}>
                        {transaction.categoryName || (isIncome ? "Income" : "Expense")}
                    </Text>
                </View>

                {/* Details List */}
                <View style={[styles.detailsCard, {
                    backgroundColor: colors.card,
                    shadowColor: colors.text,
                }]}>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            Date
                        </Text>
                        <Text style={[styles.detailValue, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            {formatDate(transaction)}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.muted + '30' }]} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            Time
                        </Text>
                        <Text style={[styles.detailValue, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            {formatTime(transaction)}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.muted + '30' }]} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            Status
                        </Text>
                        <View style={styles.statusContainer}>
                            <View style={[styles.statusDot, {
                                backgroundColor: isIncome ? colors.green : colors.red
                            }]} />
                            <Text style={[styles.detailValue, {
                                color: colors.text,
                                fontFamily: typography.fontFamily.body
                            }]}>
                                {isIncome ? "Completed (Income)" : "Completed"}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.muted + '30' }]} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            Reference ID
                        </Text>
                        <Text style={[styles.detailValue, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            #{transaction.id}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.muted + '30' }]} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            Type
                        </Text>
                        <Text style={[styles.detailValue, {
                            color: colors.text,
                            fontFamily: typography.fontFamily.body
                        }]}>
                            {isIncome ? "Income" : "Expense"}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {transaction.type === 'expense' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.deleteButton, {
                                backgroundColor: colors.red,
                                opacity: deleting ? 0.6 : 1
                            }]}
                            onPress={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="trash-outline" size={20} color="#fff" />
                                    <Text style={[styles.deleteText, {
                                        fontFamily: typography.fontFamily.boldHeading
                                    }]}>
                                        Delete Transaction
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    amountCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        marginBottom: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    amountLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    amount: {
        fontSize: 40,
        fontWeight: "800",
    },
    iconSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    iconCircleLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    transactionTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    transactionCategory: {
        fontSize: 16,
        marginTop: 4,
    },
    detailsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 16,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "right",
        flex: 1,
        marginLeft: 16,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1,
        marginLeft: 16,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    divider: {
        height: 1,
    },
    actionButtons: {
        marginBottom: 40,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    deleteText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});