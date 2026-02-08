import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/globals";
import { useCategoryContext } from "../context/categoryContext";
import { useExpenseContext } from "../context/expenseContext";
import { useIncomeContext } from "../context/incomeContext";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService, { DashboardStatsDto } from "@/services/api";
import { useTutorial } from "../context/tutorialContext";
import TutorialOverlay from "@/components/TutorialOverlay";
import { useCurrency } from "@/utils/currency";

export default function AddTransactionPage() {
    const theme = useTheme();
    const { colors, typography } = theme;
    const { customCategories, selectedCategories, defaultCategories } = useCategoryContext();
    const { addExpense, refreshExpenses } = useExpenseContext();
    const { addIncome, refreshIncomes } = useIncomeContext();
    const { hasSeenTutorial, markTutorialAsSeen } = useTutorial();
    const { format } = useCurrency();

    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<{ name: string; id: number } | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    const tutorialSteps = [
        {
            id: 'add_type',
            title: 'Transaction Type',
            description: 'Choose whether you\'re adding Income (money received) or an Expense (money spent).',
            position: 'top' as const,
        },
        {
            id: 'add_amount',
            title: 'Enter Amount',
            description: 'Type the amount of money for this transaction. This is required.',
            position: 'center' as const,
        },
        {
            id: 'add_description',
            title: 'Add Description',
            description: 'Optionally add a note to remember what this transaction was for (e.g., "Groceries" or "Salary").',
            position: 'center' as const,
        },
        {
            id: 'add_date',
            title: 'Select Date',
            description: 'Choose a date for this transaction. You can only select dates from this month up to today.',
            position: 'center' as const,
        },
        {
            id: 'add_category',
            title: 'Choose Category',
            description: 'For expenses, select a category (required). For income, you can allocate to a category or leave blank to add to overall budget.',
            position: 'center' as const,
        },
        {
            id: 'add_save',
            title: 'Save Transaction',
            description: 'Tap Save to record your transaction. Your data will be synced and reflected in your dashboard.',
            position: 'bottom' as const,
        },
    ];

    // 🔥 NEW: Get valid date range (first day of current month to today)
    const getDateRange = () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { minDate: firstDayOfMonth, maxDate: today };
    };

    // 🔥 NEW: Validate if date is within allowed range
    const isDateValid = (selectedDate: Date): boolean => {
        const { minDate, maxDate } = getDateRange();
        return selectedDate >= minDate && selectedDate <= maxDate;
    };

    useEffect(() => {
        const checkTutorial = async () => {
            const seen = await hasSeenTutorial('add');
            if (!seen) {
                setTimeout(() => setShowTutorial(true), 500);
            }
        };
        checkTutorial();
    }, []);

    const handleTutorialComplete = async () => {
        await markTutorialAsSeen('add');
        setShowTutorial(false);
    };

    const handleTutorialSkip = async () => {
        await markTutorialAsSeen('add');
        setShowTutorial(false);
    };

    useEffect(() => {
        if (type === "income") {
            loadStats();
        }
    }, [type]);

    const loadStats = async () => {
        try {
            setLoadingStats(true);
            const userIdStr = await AsyncStorage.getItem('userId');
            if (userIdStr) {
                const dashboardStats = await ApiService.getDashboardStats(parseInt(userIdStr));
                setStats(dashboardStats);
            }
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const displayedCategories = [
        ...customCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
        })),
        ...defaultCategories
            .filter(defCat => selectedCategories.includes(defCat.name))
            .map(defCat => ({
                id: defCat.id,
                name: defCat.name,
                icon: getIconForCategory(defCat.name),
                color: defCat.color,
            })),
    ];

    function getIconForCategory(name: string) {
        switch (name) {
            case "Food": return "fast-food-outline";
            case "Transport": return "car-outline";
            case "Airtime": return "phone-portrait-outline";
            case "Social Events": return "people-outline";
            case "Shopping": return "cart-outline";
            case "Rent": return "home-outline";
            case "Bills": return "document-text-outline";
            case "Emergency": return "alert-circle-outline";
            case "Medical expenses": return "medkit-outline";
            default: return "pricetag-outline";
        }
    }

    // 🔥 NEW: Handle date change with validation
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);

        if (selectedDate) {
            if (!isDateValid(selectedDate)) {
                const { minDate, maxDate } = getDateRange();
                const minDateStr = minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const maxDateStr = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                Alert.alert(
                    "Invalid Date",
                    `Please select a date between ${minDateStr} and ${maxDateStr} (current month only, no future dates).`,
                    [{ text: "OK" }]
                );
                return;
            }
            setDate(selectedDate);
        }
    };

    const handleSave = async () => {
        console.log("=== HANDLE SAVE CALLED ===");
        console.log("Type:", type);
        console.log("Amount:", amount);
        console.log("Selected Category:", selectedCategory);
        console.log("Date:", date);

        // 🔥 NEW: Validate date before saving
        if (!isDateValid(date)) {
            const { minDate, maxDate } = getDateRange();
            const minDateStr = minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const maxDateStr = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            Alert.alert(
                "Invalid Date",
                `Transaction date must be between ${minDateStr} and ${maxDateStr}.\n\nFuture dates and dates from previous months are not allowed.`
            );
            return;
        }

        if (!amount || amount.trim() === "") {
            Alert.alert("Error", "Please enter an amount");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        if (type === "expense" && !selectedCategory) {
            Alert.alert("Error", "Please select a category for expense");
            return;
        }

        if (type === "income" && selectedCategory) {
            if (!stats || stats.totalIncome === 0) {
                Alert.alert(
                    "Set Overall Budget First",
                    "Before allocating income to categories, you need to set your overall monthly budget.\n\nWould you like to do that now?",
                    [
                        {
                            text: "Cancel",
                            style: "cancel"
                        },
                        {
                            text: "Set Budget Now",
                            onPress: () => {
                                setSelectedCategory(null);
                                Alert.alert(
                                    "How to Set Your Budget",
                                    "Enter your total monthly income in the amount field without selecting any category, then tap Save.",
                                    [{ text: "Got it!" }]
                                );
                            }
                        }
                    ]
                );
                return;
            }

            const currentAllocated = stats.allocatedIncome || 0;
            const newTotal = currentAllocated + amountNum;

            if (newTotal > stats.totalIncome) {
                Alert.alert(
                    "Exceeds Budget",
                    `Cannot allocate ${format(amountNum)} to ${selectedCategory.name}.\n\n` +
                    `📊 Overall Budget: ${format(stats.totalIncome)}\n` +
                    `✅ Already Allocated: ${format(currentAllocated)}\n` +
                    `💰 Available: ${format(stats.totalIncome - currentAllocated)}\n\n` +
                    `Please enter an amount of ${format(stats.totalIncome - currentAllocated)} or less.`
                );
                return;
            }
        }

        setSaving(true);

        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) {
                throw new Error('User not logged in');
            }
            const userId = parseInt(userIdStr);

            if (type === "income") {
                console.log("=== TAKING INCOME PATH ===");
                console.log("Calling addIncome with:", {
                    amount: amountNum,
                    note: description || (selectedCategory ? `Income for ${selectedCategory.name}` : "Monthly Budget"),
                    categoryId: selectedCategory?.id || null,
                    date: date.toISOString(),
                });

                await addIncome({
                    id: Date.now(),
                    amount: amountNum,
                    note: description || (selectedCategory ? `Income for ${selectedCategory.name}` : "Monthly Budget"),
                    categoryId: selectedCategory?.id || null,
                    date: date.toISOString(),
                });

                console.log("✅ Income added successfully");

                Alert.alert(
                    "Success",
                    selectedCategory
                        ? `${format(amountNum)} allocated to ${selectedCategory.name}`
                        : `Overall monthly budget set/updated with ${format(amountNum)}`
                );
            } else {
                console.log("=== TAKING EXPENSE PATH ===");
                console.log("Calling addExpense with:", {
                    amount: amountNum,
                    category: selectedCategory!.name,
                    categoryId: selectedCategory!.id,
                    note: description || "Expense",
                    date: date.toISOString(),
                });

                await addExpense({
                    id: Date.now(),
                    amount: amountNum,
                    category: selectedCategory!.name,
                    categoryId: selectedCategory!.id,
                    note: description || "Expense",
                    type: "expense",
                    date: date.toISOString(),
                });

                console.log("✅ Expense added successfully");

                Alert.alert("Success", "Expense added successfully");
            }

            await refreshExpenses();
            await refreshIncomes();

            setAmount("");
            setDescription("");
            setSelectedCategory(null);
            setType("expense");
            setDate(new Date());

            if (type === "income") {
                await loadStats();
            }

            router.replace("/");
        } catch (error: any) {
            console.error("❌ Save error:", error);
            Alert.alert("Error", error.message || "Failed to add transaction");
        } finally {
            setSaving(false);
        }
    };

    // 🔥 NEW: Format date range for display
    const getDateRangeText = () => {
        const { minDate, maxDate } = getDateRange();
        const minDateStr = minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const maxDateStr = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${minDateStr} - ${maxDateStr}`;
    };

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Type selector */}
                <View style={styles.typeRow}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            { backgroundColor: type === "income" ? colors.primary : colors.muted },
                        ]}
                        onPress={() => {
                            console.log("Switching to INCOME mode");
                            setType("income");
                        }}
                    >
                        <Text style={{ color: "#fff", fontFamily: typography.fontFamily.boldHeading }}>
                            Income
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            { backgroundColor: type === "expense" ? colors.primary : colors.muted },
                        ]}
                        onPress={() => {
                            console.log("Switching to EXPENSE mode");
                            setType("expense");
                        }}
                    >
                        <Text style={{ color: "#fff", fontFamily: typography.fontFamily.boldHeading }}>
                            Expense
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Budget Info Box - Only show for income mode */}
                {type === "income" && (
                    <>
                        {loadingStats ? (
                            <View style={[styles.budgetInfoBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={{ color: colors.text, marginLeft: 10 }}>Loading budget info...</Text>
                            </View>
                        ) : stats ? (
                            <View style={[styles.budgetInfoBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                                <Text style={[styles.budgetInfoTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                                    📊 Budget Overview
                                </Text>
                                <View style={styles.budgetInfoRow}>
                                    <Text style={{ color: colors.text }}>Overall Budget:</Text>
                                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                                        {format(stats.totalIncome)}
                                    </Text>
                                </View>
                                <View style={styles.budgetInfoRow}>
                                    <Text style={{ color: colors.text }}>Already Allocated:</Text>
                                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                                        {format(stats.allocatedIncome || 0)}
                                    </Text>
                                </View>
                                <View style={styles.budgetInfoRow}>
                                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Available to Allocate:</Text>
                                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>
                                        {format(stats.totalIncome - (stats.allocatedIncome || 0))}
                                    </Text>
                                </View>

                                {stats.totalIncome === 0 && (
                                    <View style={[styles.warningBox, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
                                        <Ionicons name="warning-outline" size={20} color="#856404" />
                                        <Text style={{ color: '#856404', fontSize: 12, marginLeft: 8, flex: 1 }}>
                                            ⚠️ Set your overall monthly budget first by leaving the category unselected
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : null}
                    </>
                )}

                {/* Amount */}
                <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                    Amount (Required)
                </Text>
                <TextInput
                    style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                {/* Description */}
                <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                    Description (Optional)
                </Text>
                <TextInput
                    style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
                    placeholder="Enter description"
                    placeholderTextColor={colors.muted}
                    value={description}
                    onChangeText={setDescription}
                />

                {/* Date picker with constraint info */}
                <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                    Date (Required)
                </Text>
                <Text style={[styles.dateHint, { color: colors.muted, fontFamily: typography.fontFamily.body }]}>
                    📅 Valid range: {getDateRangeText()} (Current month only)
                </Text>
                <TouchableOpacity
                    style={[styles.dateButton, { borderColor: colors.primary }]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.text }}>{date.toDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()} // 🔥 NEW: No future dates
                        minimumDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)} // 🔥 NEW: First day of current month
                    />
                )}

                {/* Category selector */}
                <View style={styles.categoryHeader}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                        Category {type === "income" ? "(Optional)" : "(Required)"}
                    </Text>
                    {selectedCategory && (
                        <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                            <Text style={[styles.clearText, { color: colors.red }]}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Overall Budget Card - Only for Income */}
                {type === "income" && (
                    <TouchableOpacity
                        style={[
                            styles.overallBudgetCard,
                            {
                                backgroundColor: !selectedCategory ? colors.primary : colors.card,
                                borderColor: colors.primary,
                            },
                        ]}
                        onPress={() => {
                            console.log("Selected: Overall Budget (no category)");
                            setSelectedCategory(null);
                        }}
                    >
                        <Ionicons
                            name="wallet-outline"
                            size={32}
                            color={!selectedCategory ? "#fff" : colors.text}
                        />
                        <Text
                            style={{
                                color: !selectedCategory ? "#fff" : colors.text,
                                marginTop: 8,
                                fontSize: 14,
                                fontWeight: "600",
                                textAlign: 'center',
                            }}
                        >
                            Overall Budget
                        </Text>
                    </TouchableOpacity>
                )}

                <FlatList
                    data={displayedCategories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryBox,
                                { backgroundColor: selectedCategory?.id === item.id ? item.color : "#eee" },
                            ]}
                            onPress={() => {
                                console.log("Selected category:", item.name, "ID:", item.id);
                                setSelectedCategory({ name: item.name, id: item.id });
                            }}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={24}
                                color={selectedCategory?.id === item.id ? "#fff" : "#000"}
                            />
                            <Text
                                style={{
                                    color: selectedCategory?.id === item.id ? "#fff" : "#000",
                                    marginTop: 4,
                                    fontSize: 12,
                                    textAlign: 'center',
                                }}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                {/* Save button */}
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{ color: "#fff", fontFamily: typography.fontFamily.boldHeading }}>
                            Save {type === "income" ? "Income" : "Expense"}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <TutorialOverlay
                visible={showTutorial}
                steps={tutorialSteps}
                onComplete={handleTutorialComplete}
                onSkip={handleTutorialSkip}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 40,
        paddingBottom: 120,
    },
    typeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
    typeButton: { flex: 1, marginHorizontal: 5, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    budgetInfoBox: {
        padding: 10,
        borderRadius: 12,
        marginBottom: 5,
        borderWidth: 1,
    },
    budgetInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    budgetInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    warningBox: {
        flexDirection: 'row',
        padding: 7,
        borderRadius: 8,
        marginTop: 6,
        borderWidth: 1,
        alignItems: 'center',
    },
    label: { fontSize: 16, marginBottom: 6, marginTop: 10 },
    dateHint: {
        fontSize: 12,
        marginBottom: 6,
        fontStyle: 'italic',
    },
    input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 5 },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    clearText: {
        fontSize: 14,
        fontWeight: '600',
    },
    overallBudgetCard: {
        width: 120,
        height: 100,
        borderRadius: 12,
        marginBottom: 10,
        marginRight: 5,
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
        borderWidth: 2,
    },
    categoryBox: {
        width: 90,
        height: 90,
        borderRadius: 12,
        marginRight: 12,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10
    },
    saveButton: {
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
});