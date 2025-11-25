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
  const { categories, addExpenseToCategory } = useCategoryContext();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Only show categories for expense
  const availableCategories = categories.filter(c => c.isDefault || !c.isDefault);

  const handleSave = () => {
    if (!amount) return;
    if (type === "income" && !description) return;
    if (type === "expense" && !selectedCategory) return;

    // Create an Expense object, even for incomes (stored in "Income" category)
    const expense: Expense = {
      id: Date.now(),
      title: description || type,
      amount: parseFloat(amount),
      category: type === "expense" ? selectedCategory! : "Income",
      type: "expense", // always "expense" for the context
    };

    // Add to the correct category
    addExpenseToCategory(expense.category, expense);

    // Reset form
    setAmount("");
    setDescription("");
    setSelectedCategory(null);
    setType("expense");

    // Go back to Home
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

      {/* Category selector only for expense */}
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
      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>Date</Text>
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
          onChange={(event, selectedDate) => selectedDate && setDate(selectedDate)}

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
