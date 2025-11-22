import { View, Text, StyleSheet, FlatList } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useExpenseContext } from "@/app/context/expenseContext";

type TransactionCardProps = {
  cardBackgroundColor?: string;
  expenseColor?: string;
  incomeColor?: string;
};

const TransactionCard = ({ 
  cardBackgroundColor, 
  expenseColor, 
  incomeColor 
}: TransactionCardProps) => {
  const theme = useTheme();
  const { typography, colors, spacing, radius } = theme;
  const { expenses } = useExpenseContext();

  // Use custom colors or fall back to theme colors
  const bgColor = cardBackgroundColor || colors.card;
  const expColor = expenseColor || colors.red;
  const incColor = incomeColor || colors.green;

  // Get the 5 most recent transactions
  const recentTransactions = expenses
    .slice(-5)
    .reverse();

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
        day: 'numeric' 
      })}, ${timeStr}`;
    }
  };

  const renderTransaction = ({ item }: any) => {
    const isExpense = item.type === "expense";
    const amount = isExpense ? -item.amount : item.amount;

    return (
      <View style={[styles.transactionItem, { borderBottomColor: colors.muted }]}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.gray }]}>
            <Ionicons 
              name="receipt-outline" 
              size={20} 
              color={colors.primary} 
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
            {item.title || "Untitled"}
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
              color: isExpense ? expColor : incColor,
              fontFamily: typography.fontFamily.buttonText,
              fontSize: typography.fontSize.md
            }
          ]}
        >
          {isExpense ? '-' : '+'}${Math.abs(amount).toFixed(2)}
        </Text>
      </View>
    );
  };

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
          keyExtractor={(item) => item.id.toString()}
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