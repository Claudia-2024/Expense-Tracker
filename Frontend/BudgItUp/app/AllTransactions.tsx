// app/AllTransactions.tsx
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
import { useNavigation } from "@react-navigation/native";

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

const allTransactions: Transaction[] = [
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
    {
        id: "5",
        title: "Netflix Subscription",
        category: "Entertainment",
        amount: "-$15.99",
        date: "Nov 28",
        icon: "tv",
        color: "#E11D48",
        description: "Monthly streaming subscription",
    },
    {
        id: "6",
        title: "Electric Bill",
        category: "Utilities",
        amount: "-$85.00",
        date: "Nov 25",
        icon: "zap",
        color: "#F59E0B",
        description: "Monthly electricity bill",
    },
];

export default function AllTransactions() {
    const navigation = useNavigation<any>(); // or use typed navigation if preferred

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

            {/* Header with Back Arrow */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Transactions</Text>
                <View style={{ width: 56 }} />
            </View>

            {/* Full Transaction List */}
            <FlatList
                data={allTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DBEAFE",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
        marginRight: 56,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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