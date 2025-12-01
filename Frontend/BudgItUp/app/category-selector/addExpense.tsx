import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCategoryContext } from "../context/categoryContext";
import { useExpenseContext, Expense } from "../context/expenseContext";
import { useTheme } from "@/theme/global";

export default function AddExpense() {
    const { selectedCategories, customCategories, defaultCategories } = useCategoryContext();
    const { addExpense } = useExpenseContext();
    const theme = useTheme();
    const { colors, typography } = theme;

    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<{ name: string; id: number } | null>(null);
    const [type, setType] = useState<"income" | "expense">("expense");
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
            case "Food": return "fast-food";
            case "Transport": return "car";
            case "Airtime": return "phone-portrait";
            case "Social Events": return "people";
            case "Shopping": return "cart";
            case "Rent": return "home";
            case "Bills": return "document-text";
            case "Emergency": return "alert-circle";
            case "Medical expenses": return "medkit";
            default: return "pricetag";
        }
    }

    const handleSave = async () => {
        if (!selectedCategory || !amount) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        setSaving(true);

        try {
            const newExpense: Expense = {
                id: Date.now(),
                amount: amountNum,
                category: selectedCategory.name,
                categoryId: selectedCategory.id,
                note,
                type,
                date: new Date().toISOString().split('T')[0],
            };

            await addExpense(newExpense);

            Alert.alert("Success", `${type === "income" ? "Income" : "Expense"} added successfully`);

            // Reset fields
            setAmount("");
            setNote("");
            setSelectedCategory(null);
            setType("expense");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add expense");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text
                style={[
                    styles.title,
                    { color: colors.text, fontFamily: typography.fontFamily.heading },
                ]}
            >
                Add New {type === "income" ? "Income" : "Expense"}
            </Text>

            {/* Income / Expense Toggle */}
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        {
                            backgroundColor: type === "income" ? colors.primary : colors.background,
                        },
                    ]}
                    onPress={() => setType("income")}
                >
                    <Text
                        style={{
                            color: type === "income" ? "#fff" : colors.text,
                            fontFamily: typography.fontFamily.buttonText,
                        }}
                    >
                        Income
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        {
                            backgroundColor: type === "expense" ? colors.primary : colors.background,
                        },
                    ]}
                    onPress={() => setType("expense")}
                >
                    <Text
                        style={{
                            color: type === "expense" ? "#fff" : colors.text,
                            fontFamily: typography.fontFamily.buttonText,
                        }}
                    >
                        Expense
                    </Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={[
                    styles.input,
                    { borderColor: colors.primary, color: colors.text, fontFamily: typography.fontFamily.body },
                ]}
                placeholder="Amount"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />

            <TextInput
                style={[
                    styles.input,
                    { borderColor: colors.primary, color: colors.text, fontFamily: typography.fontFamily.body },
                ]}
                placeholder="Note (optional)"
                placeholderTextColor={colors.muted}
                value={note}
                onChangeText={setNote}
            />

            <Text
                style={[
                    styles.label,
                    { color: colors.text, fontFamily: typography.fontFamily.boldHeading },
                ]}
            >
                Select Category
            </Text>

            <FlatList
                data={displayedCategories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isSelected = selectedCategory?.id === item.id;
                    return (
                        <TouchableOpacity
                            style={[
                                styles.categoryCard,
                                { backgroundColor: isSelected ? colors.primary : item.color },
                            ]}
                            onPress={() => setSelectedCategory({ name: item.name, id: item.id })}
                        >
                            <Ionicons name={item.icon as any} size={28} color="#fff" />
                            <Text style={[styles.categoryText, { fontFamily: typography.fontFamily.body }]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={[styles.saveText, { fontFamily: typography.fontFamily.boldHeading }]}>
                        Save {type === "income" ? "Income" : "Expense"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
    toggleButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: "center",
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
    categoryCard: {
        width: 100,
        height: 100,
        borderRadius: 16,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    categoryText: {
        marginTop: 6,
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    saveButton: {
        marginTop: 30,
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
