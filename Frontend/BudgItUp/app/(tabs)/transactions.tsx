// app/(tabs)/transactions.tsx
// 🔥 FIXED VERSION - Only shows current user's transactions
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { useTheme } from '@/theme/globals';
import { useExpenseContext } from '@/app/context/expenseContext';
import { useIncomeContext } from '@/app/context/incomeContext';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '@/utils/currency';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Transaction = {
  id: number;
  amount: number;
  note: string;
  type: "income" | "expense";
  category?: string;
  date?: string;
  userId: number; // 🔥 ADDED: Track user ownership
};
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Import the typed navigation
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "(tabs)/transactions">;

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type Transaction = {
  id: string;
  title: string;
  category: string;
  amount: string;
  date: string;
  icon: FeatherIconName;
  color: string;
  description?: string;
};

const Transactions = () => {
  const theme = useTheme();
  const { colors, typography } = theme;
  const { expenses } = useExpenseContext();
  const { incomes } = useIncomeContext();
  const { format, reload: reloadCurrency } = useCurrency();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 🔥 Load current user ID
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userIdStr = await AsyncStorage.getItem('userId');
        if (userIdStr) {
          const userId = parseInt(userIdStr);
          setCurrentUserId(userId);
          console.log("✅ Transactions Page: Current user ID:", userId);
        }
      } catch (error) {
        console.error("❌ Error loading user ID:", error);
      }
    };
    loadUserId();
  }, []);

  useFocusEffect(useCallback(() => {
    reloadCurrency();
  }, []));

  console.log("=== TRANSACTIONS PAGE RENDER ===");
  console.log("Current User ID:", currentUserId);
  console.log("Total Expenses:", expenses.length);
  console.log("Total Incomes:", incomes.length);

  // 🔥 CRITICAL FIX: Filter transactions to only show current user's data
  const allTransactions: Transaction[] = [
    ...expenses
        .filter(exp => {
          // For expenses that don't have userId (old data), show them
          // For expenses with userId, only show if it matches current user
          const shouldShow = !exp.userId || exp.userId === currentUserId;
          if (!shouldShow) {
            console.log("🚫 Filtering out expense:", exp.id, "belongs to user:", exp.userId);
          }
          return shouldShow;
        })
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
        .filter(inc => {
          // 🔥 CRITICAL: Only show incomes that belong to current user
          const shouldShow = inc.userId === currentUserId;
          if (!shouldShow) {
            console.log("🚫 Filtering out income:", inc.id, "belongs to user:", inc.userId, "current user:", currentUserId);
          }
          return shouldShow;
        })
        .map(inc => ({
          id: inc.id,
          amount: inc.amount,
          note: inc.note || "Income",
          type: "income" as const,
          date: inc.date,
          userId: inc.userId,
        })),
  ];

  console.log("Filtered transactions for user", currentUserId, ":", allTransactions.length);

  const sortedTransactions = allTransactions.sort((a, b) => b.id - a.id);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isExpense = item.type === "expense";

    return (
        <TouchableOpacity style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.muted }]} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: isExpense ? colors.red + '20' : colors.green + '20' }]}>
              <Ionicons name={isExpense ? "arrow-down-outline" : "arrow-up-outline"} size={20} color={isExpense ? colors.red : colors.green} />
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.sm }]} numberOfLines={1}>
              {item.note}
            </Text>
            <Text style={[styles.category, { color: colors.muted, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.xs }]}>
              {item.category || (isExpense ? "Expense" : "Income")}
            </Text>
            <Text style={[styles.dateTime, { color: colors.muted, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.xs }]}>
              {formatDate(item.id)}
            </Text>
          </View>

          <Text style={[styles.amount, { color: isExpense ? colors.red : colors.green, fontFamily: typography.fontFamily.buttonText, fontSize: typography.fontSize.md }]}>
            {isExpense ? '-' : '+'}{format(item.amount)}
          </Text>
        </TouchableOpacity>
    );
  };

  // 🔥 Don't render until we have user ID
  if (currentUserId === null) {
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.boldHeading }]}>
              Transaction History
            </Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.muted, fontFamily: typography.fontFamily.body }]}>
              Loading...
            </Text>
          </View>
        </View>
    );
  }

const recentTransactions: Transaction[] = [
  {
    id: "1",
    title: "Spotify Subscription",
    category: "Entertainment",
    amount: "-$9.99",
    date: "Today",
    icon: "music",
    color: "#8B5CF6",
    description: "Monthly Premium subscription renewal",
  },
  {
    id: "2",
    title: "Grocery Store",
    category: "Food",
    amount: "-$124.50",
    date: "Yesterday",
    icon: "shopping-cart",
    color: "#EF4444",
    description: "Weekly groceries at Walmart",
  },
  {
    id: "3",
    title: "Salary Deposit",
    category: "Income",
    amount: "+$3,200.00",
    date: "Dec 1",
    icon: "dollar-sign",
    color: "#10B981",
    description: "Monthly salary",
  },
  {
    id: "4",
    title: "Uber Ride",
    category: "Transport",
    amount: "-$18.75",
    date: "Nov 30",
    icon: "truck",
    color: "#F59E0B",
    description: "Weekly ride with the car",
  },
];

export default function Transactions() {
  const navigation = useNavigation<NavigationProp>();

  const goToNotifications = () => {
    navigation.navigate("Notifications");
  };

  const goToAllTransactions = () => {
    navigation.navigate("AllTransactions");
    console.log("Opening full transactions list...");
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
      <TouchableOpacity
          style={styles.transactionCard}
          onPress={() => navigation.navigate("TransactionDetails", { transaction: item })}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
          <Feather name={item.icon} size={24} color={item.color} />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
        </View>

        <View style={styles.transactionRight}>
          <Text
              style={[
                styles.transactionAmount,
                { color: item.amount.startsWith("-") ? "#EF4444" : "#10B981" },
              ]}
          >
            {item.amount}
          </Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
  );

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.boldHeading }]}>
            Transaction History
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted, fontFamily: typography.fontFamily.body }]}>
            {sortedTransactions.length} {sortedTransactions.length === 1 ? 'transaction' : 'transactions'}
          </Text>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#DBEAFE" />

        {/* Notification Bell - Top Right */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.notificationButton} onPress={goToNotifications}>
            <Feather name="bell" size={26} color="#4B5563" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {sortedTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.sm }]}>
                No transactions yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.muted, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.xs }]}>
                Start adding your income and expenses
              </Text>
            </View>
        ) : (
            <FlatList data={sortedTransactions} renderItem={renderTransaction} keyExtractor={(item) => `${item.type}-${item.id}`} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} />
        )}
      </View>

        {/* Centered Top Section: "This month spend" to "Up 15.3%..." */}
        <View style={styles.topCenteredSection}>
          <Text style={styles.spendHeader}>This month spend</Text>
          <Text style={styles.amount}>$343.37k</Text>

          <View style={styles.comparisonRow}>
            <Feather name="trending-up" size={20} color="#10B981" />
            <Text style={styles.comparisonText}>Up 15.3% from last month</Text>
          </View>
        </View>

        {/* Transactions List Section */}
        <View style={styles.listSection}>
          {/* Transactions Header */}
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transactions</Text>

            <TouchableOpacity style={styles.viewAllButton} onPress={goToAllTransactions}>
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={18} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {/* Recent Transactions List */}
          <FlatList
              data={recentTransactions.slice(0, 4)}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
  );
};

export default Transactions;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { paddingHorizontal: 16, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  transactionItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  iconContainer: { marginRight: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  detailsContainer: { flex: 1 },
  category: { fontSize: 12, marginBottom: 2 },
  dateTime: { fontSize: 11 },
  amount: { fontWeight: "700", marginLeft: 8 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  emptySubtext: { marginTop: 8, fontSize: 14 },
});
  container: {
    flex: 1,
    backgroundColor: "#DBEAFE",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    zIndex: 10,
  },

  notificationButton: {
    padding: 8,
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#DBEAFE",
  },

  // Centered top section
  topCenteredSection: {
    alignItems: "center",
    paddingTop: 100, // Space below status bar + bell
    paddingHorizontal: 20,
    marginBottom: 32,
  },

  spendHeader: {
    fontSize: 18,
    color: "#4B5563",
    fontWeight: "500",
    marginBottom: 12,
  },

  amount: {
    fontSize: 56,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 16,
    letterSpacing: -1.5,
  },

  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  comparisonText: {
    marginLeft: 10,
    fontSize: 17,
    color: "#10B981",
    fontWeight: "600",
  },

  // List section below
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
  },

  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },

  transactionsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  viewAllText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6366F1",
    marginRight: 4,
  },

  transactionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
  },

  transactionCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  transactionRight: {
    alignItems: "flex-end",
  },

  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },

  transactionDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
});