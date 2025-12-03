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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#DBEAFE" />

        {/* Notification Bell - Top Right */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.notificationButton} onPress={goToNotifications}>
            <Feather name="bell" size={26} color="#4B5563" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
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
}

const styles = StyleSheet.create({
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