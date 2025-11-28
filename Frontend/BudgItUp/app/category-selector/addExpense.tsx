import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCategoryContext } from "../context/categoryContext";
import { useExpenseContext, Expense } from "../context/expenseContext";
import { useTheme } from "@/theme/global";

export default function AddExpense() {
  const { selectedCategories, customCategories } = useCategoryContext();
  const { addExpense } = useExpenseContext();
  const theme = useTheme();
  const { colors, typography } = theme;

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [type, setType] = useState<"income" | "expense">("expense");

  // Combine custom + default selected categories
  const displayedCategories = [
    ...customCategories,
    ...selectedCategories.map((name: string) => ({
      name,
      icon: getIconForCategory(name),
      color: "#348DDB", // fallback color
    })),
  ];

  function getIconForCategory(name: string) {
    switch (name) {
      case "Food":
        return "fast-food";
      case "Transport":
        return "car";
      case "Airtime":
        return "phone-portrait";
      case "Social Events":
        return "people";
      case "Shopping":
        return "cart";
      case "Rent":
        return "home";
      case "Bills":
        return "document-text";
      case "Emergency":
        return "alert-circle";
      case "Medical expenses":
        return "medkit";
      default:
        return "pricetag";
    }
  }

  const handleSave = () => {
    if (!selectedCategory || !amount) return;

    const newExpense: Expense = {
        id: Date.now(),
        amount: Number(amount),
        category: selectedCategory,
        note,
        type,
        title: undefined
    };

    addExpense(newExpense);

    // Reset fields
    setAmount("");
    setNote("");
    setSelectedCategory(null);
    setType("expense");
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
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item.name;
          return (
            <TouchableOpacity
              style={[
                styles.categoryCard,
                { backgroundColor: isSelected ? colors.primary : item.color },
              ]}
              onPress={() => setSelectedCategory(item.name)}
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
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveText, { fontFamily: typography.fontFamily.boldHeading }]}>
          Save {type === "income" ? "Income" : "Expense"}
        </Text>
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
