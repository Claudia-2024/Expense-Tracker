// app/TransactionDetails.tsx
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
//import type { FeatherGlyphNames } from "@expo/vector-icons/build/Feather";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "./types/navigation";  // Adjust path if needed

type FeatherIconName = keyof typeof Feather.glyphMap;
// Define the route params type
type Transaction = {
    id: string;
    title: string;
    category: string;
    amount: string;
    date: string;
    icon: FeatherIconName;  // ← This fixes the error
    color: string;
    description?: string;
    status?: string;
    reference?: string;
};

type TransactionDetailsRouteProp = RouteProp<RootStackParamList, "TransactionDetails">;

export default function TransactionDetails() {
    const navigation = useNavigation();
    const route = useRoute<TransactionDetailsRouteProp>();
    const transaction = route.params?.transaction;

    // Safe fallback if no transaction
    if (!transaction) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>No transaction data</Text>
            </SafeAreaView>
        );
    }

    const isIncome = transaction.amount?.startsWith("+");

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#DBEAFE" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction Details</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Amount Card */}
                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={[styles.amount, { color: isIncome ? "#10B981" : "#EF4444" }]}>
                        {transaction.amount || "$0.00"}
                    </Text>
                </View>

                {/* Icon & Title */}
                <View style={styles.iconSection}>
                    <View style={[styles.iconCircleLarge, { backgroundColor: transaction.color + "20" }]}>
                        <Feather name={transaction.icon || "credit-card"} size={36} color={transaction.color || "#6366F1"} />
                    </View>
                    <Text style={styles.transactionTitle}>{transaction.title || "Unknown Transaction"}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category || "Uncategorized"}</Text>
                </View>

                {/* Details List */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{transaction.date || "N/A"}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View style={styles.statusContainer}>
                            <View style={[styles.statusDot, { backgroundColor: isIncome ? "#10B981" : "#EF4444" }]} />
                            <Text style={styles.detailValue}>{isIncome ? "Completed (Income)" : "Completed"}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Reference ID</Text>
                        <Text style={styles.detailValue}>#{transaction.id || "000000"}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Description</Text>
                        <Text style={styles.detailValue}>
                            {transaction.description || "No additional description provided."}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="share-2" size={20} color="#6366F1" />
                        <Text style={styles.actionText}>Share Receipt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="download" size={20} color="#6366F1" />
                        <Text style={styles.actionText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    amountCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    amountLabel: {
        fontSize: 16,
        color: "#6B7280",
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
        color: "#1F2937",
    },
    transactionCategory: {
        fontSize: 16,
        color: "#6B7280",
        marginTop: 4,
    },
    detailsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 16,
        color: "#4B5563",
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        textAlign: "right",
        flex: 1,
        marginLeft: 16,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 40,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "600",
        color: "#6366F1",
    },
});