// app/(tabs)/add.tsx
import React, { useState } from "react";
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
import { useTheme } from "@/theme/global";
import { useCategoryContext } from "../context/categoryContext";
import { useExpenseContext } from "../context/expenseContext";
import { useIncomeContext } from "../context/incomeContext";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddTransactionPage() {
    const theme = useTheme();
    const { colors, typography } = theme;
    const { customCategories, selectedCategories, defaultCategories } = useCategoryContext();
    const { addExpense, refreshExpenses } = useExpenseContext();
    const { addIncome, refreshIncomes } = useIncomeContext();

    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<{ name: string; id: number } | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);

    // Combine custom categories + selected default categories
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

    const handleSave = async () => {
        console.log("=== HANDLE SAVE CALLED ===");
        console.log("Type:", type);
        console.log("Amount:", amount);
        console.log("Selected Category:", selectedCategory);

        // Validate amount
        if (!amount || amount.trim() === "") {
            Alert.alert("Error", "Please enter an amount");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        // CRITICAL: For EXPENSE ONLY, category is required
        if (type === "expense" && !selectedCategory) {
            Alert.alert("Error", "Please select a category for expense");
            return;
        }

        // For INCOME, category is OPTIONAL - no validation needed

        setSaving(true);

        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) {
                throw new Error('User not logged in');
            }
            const userId = parseInt(userIdStr);

            if (type === "income") {
                // ============== INCOME PATH ==============
                console.log("=== TAKING INCOME PATH ===");
                console.log("Calling addIncome with:", {
                    amount: amountNum,
                    note: description || (selectedCategory ? `Income for ${selectedCategory.name}` : "Monthly Budget"),
                    categoryId: selectedCategory?.id || null,
                    date: date.toISOString().split('T')[0],
                });

                await addIncome({
                    id: Date.now(),
                    amount: amountNum,
                    note: description || (selectedCategory ? `Income for ${selectedCategory.name}` : "Monthly Budget"),
                    categoryId: selectedCategory?.id || null,
                    date: date.toISOString().split('T')[0],
                });

                console.log("✅ Income added successfully");

                Alert.alert(
                    "Success",
                    selectedCategory
                        ? `Income allocated to ${selectedCategory.name}`
                        : "Overall monthly budget updated"
                );
            } else {
                // ============== EXPENSE PATH ==============
                console.log("=== TAKING EXPENSE PATH ===");
                console.log("Calling addExpense with:", {
                    amount: amountNum,
                    category: selectedCategory!.name,
                    categoryId: selectedCategory!.id,
                    note: description || "Expense",
                    date: date.toISOString().split('T')[0],
                });

                await addExpense({
                    id: Date.now(),
                    amount: amountNum,
                    category: selectedCategory!.name,
                    categoryId: selectedCategory!.id,
                    note: description || "Expense",
                    type: "expense",
                    date: date.toISOString().split('T')[0],
                });

                console.log("✅ Expense added successfully");

                Alert.alert("Success", "Expense added successfully");
            }

            // Refresh both data sources
            await refreshExpenses();
            await refreshIncomes();

            // Reset form
            setAmount("");
            setDescription("");
            setSelectedCategory(null);
            setType("expense");
            setDate(new Date());

            // Go back to Home
            router.replace("/");
        } catch (error: any) {
            console.error("❌ Save error:", error);
            Alert.alert("Error", error.message || "Failed to add transaction");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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

            {/* Info text */}
            <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text, fontFamily: typography.fontFamily.body }]}>
                    {type === "income"
                        ? "Select a category to allocate income, or leave blank to add to overall budget"
                        : "Select a category to record your expense"}
                </Text>
            </View>

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

            {/* Description / Reason */}
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

            {/* Date picker */}
            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                Date (Required)
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
                    onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    typeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
    typeButton: { flex: 1, marginHorizontal: 5, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    infoBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
    },
    label: { fontSize: 16, marginBottom: 6, marginTop: 10 },
    input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
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
        marginBottom: 12,
        marginRight: 12,
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
        marginBottom: 20
    },
    saveButton: { paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 10, marginBottom: 30 },
});
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useCategoryContext, Expense } from "../context/categoryContext";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddTransactionPage() {
  const theme = useTheme();
  const { colors, typography } = theme;
  const { categories, addExpenseToCategory, addIncome } = useCategoryContext();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Only show expense categories
  const availableCategories = categories;

  const handleSave = () => {
    if (!amount) return;
    if (type === "income" && !description) return;
    if (type === "expense" && !selectedCategory) return;

    const transaction: Expense = {
      id: Date.now(),
      title: description || (type === "income" ? "Income" : "Expense"),
      amount: parseFloat(amount),
      category: type === "expense" ? selectedCategory! : "Income",
      type: type,
      date: date.toISOString(),
    };

    if (type === "income") {
      addIncome(transaction); // ✅ Add to incomes array
    } else {
      addExpenseToCategory(selectedCategory!, transaction); // ✅ Add to selected expense category
    }

    // Reset fields
    setAmount("");
    setDescription("");
    setSelectedCategory(null);
    setType("expense");
    setDate(new Date());

    router.replace("/");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Type selector */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { backgroundColor: type === "income" ? colors.primary : colors.muted },
          ]}
          onPress={() => setType("income")}
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
          onPress={() => setType("expense")}
        >
          <Text style={{ color: "#fff", fontFamily: typography.fontFamily.boldHeading }}>
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        Amount
      </Text>
      <TextInput
        style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
        placeholder="0.00"
        placeholderTextColor={colors.muted}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Description / Reason */}
      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        {type === "income" ? "Reason" : "Description (optional)"}
      </Text>
      <TextInput
        style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
        placeholder={type === "income" ? "Enter reason" : "Enter description"}
        placeholderTextColor={colors.muted}
        value={description}
        onChangeText={setDescription}
      />

      {/* Category selector (ONLY for expense) */}
      {type === "expense" && (
        <>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Category
          </Text>
          <FlatList
            data={availableCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryBox,
                  { backgroundColor: selectedCategory === item.name ? item.color : "#eee" },
                ]}
                onPress={() => setSelectedCategory(item.name)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={selectedCategory === item.name ? "#fff" : "#000"}
                />
                <Text
                  style={{
                    color: selectedCategory === item.name ? "#fff" : "#000",
                    marginTop: 4,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* Date picker */}
      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        Date
      </Text>
      <TouchableOpacity
        style={[styles.dateButton, { borderColor: colors.primary }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: colors.text }}>{date.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={{ color: "#fff", fontFamily: typography.fontFamily.boldHeading }}>
          Save {type === "income" ? "Income" : "Expense"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  typeRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  typeButton: { flex: 1, marginHorizontal: 5, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  label: { fontSize: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  categoryBox: { width: 90, height: 90, borderRadius: 12, marginRight: 12, justifyContent: "center", alignItems: "center" },
  dateButton: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 20 },
  saveButton: { paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center" },
});
