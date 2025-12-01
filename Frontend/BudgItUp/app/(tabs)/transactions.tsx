// app/(tabs)/transactions.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTheme } from '@/theme/global';
import { useExpenseContext } from '@/app/context/expenseContext';
import { useIncomeContext } from '@/app/context/incomeContext'; // NEW: Import income context
import { Ionicons } from '@expo/vector-icons';

type Transaction = {
  id: number;
  amount: number;
  note: string;
  type: "income" | "expense";
  category?: string;
  date?: string;
};

const Transactions = () => {
  const theme = useTheme();
  const { colors, typography } = theme;
  const { expenses } = useExpenseContext();
  const { incomes } = useIncomeContext(); // NEW: Get incomes

  // Combine expenses and incomes
  const allTransactions: Transaction[] = [
    ...expenses.map(exp => ({
      id: exp.id,
      amount: exp.amount,
      note: exp.note || "Expense",
      type: "expense" as const,
      category: exp.category,
      date: exp.date,
    })),
    ...incomes.map(inc => ({
      id: inc.id,
      amount: inc.amount,
      note: inc.note || "Income",
      type: "income" as const,
      date: inc.date,
    })),
  ];

  // Sort by ID (most recent first)
  const sortedTransactions = allTransactions.sort((a, b) => b.id - a.id);

  console.log("=== TRANSACTIONS PAGE ===");
  console.log("Total transactions:", sortedTransactions.length);
  console.log("Expenses:", expenses.length);
  console.log("Incomes:", incomes.length);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', {
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
            style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.muted }]}
            activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: isExpense ? colors.red + '20' : colors.green + '20' }]}>
              <Ionicons
                  name={isExpense ? "arrow-down-outline" : "arrow-up-outline"}
                  size={20}
                  color={isExpense ? colors.red : colors.green}
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
              {item.category || (isExpense ? "Expense" : "Income")}
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
              {formatDate(item.id)}
            </Text>
          </View>

          <Text
              style={[
                styles.amount,
                {
                  color: isExpense ? colors.red : colors.green,
                  fontFamily: typography.fontFamily.buttonText,
                  fontSize: typography.fontSize.md
                }
              ]}
          >
            {isExpense ? '-' : '+'}${item.amount.toFixed(2)}
          </Text>
        </TouchableOpacity>
    );
  };

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.boldHeading }]}>
            Transaction History
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted, fontFamily: typography.fontFamily.body }]}>
            {sortedTransactions.length} {sortedTransactions.length === 1 ? 'transaction' : 'transactions'}
          </Text>
        </View>

        {sortedTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color={colors.muted} />
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
              <Text
                  style={[
                    styles.emptySubtext,
                    {
                      color: colors.muted,
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.fontSize.xs
                    }
                  ]}
              >
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
};

export default Transactions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    flex: 1,
  },
  category: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 11,
  },
  amount: {
    fontWeight: "700",
    marginLeft: 8,
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