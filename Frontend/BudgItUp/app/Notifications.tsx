// app/Notifications.tsx
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Sample notification data (replace with real data later)
const notifications = [
    {
        id: "1",
        title: "High spending alert",
        message: "You’ve spent $17,500 on Food this month — 48% of total",
        time: "2 hours ago",
        icon: "alert-triangle",
        color: "#EF4444",
        read: false,
    },
    {
        id: "2",
        title: "Budget limit reached",
        message: "Your Transport budget of $5,000 has been exceeded",
        time: "5 hours ago",
        icon: "alert-circle",
        color: "#F59E0B",
        read: false,
    },
    {
        id: "3",
        title: "Weekly summary",
        message: "You spent $82,100 this week. View details",
        time: "1 day ago",
        icon: "trending-up",
        color: "#10B981",
        read: true,
    },
    {
        id: "4",
        title: "New feature",
        message: "Dark mode is now available in Settings!",
        time: "3 days ago",
        icon: "moon",
        color: "#8B5CF6",
        read: true,
    },
];

export default function Notifications() {
    const navigation = useNavigation();

    const renderItem = ({ item }: { item: typeof notifications[0] }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.read && styles.unreadCard]}
            onPress={() => {
                // You can navigate to details or mark as read here
            }}
        >
            <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
                <Feather name={item.icon as any} size={24} color={item.color} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>

            {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#DBEAFE" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="bell-off" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                    <Text style={styles.emptySubtext}>We'll notify you when something important happens</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    notificationCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
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
        borderLeftColor: "#3B82F6",
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
        color: "#1F2937",
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 20,
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    unreadDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#3B82F6",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#4B5563",
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 8,
    },
});