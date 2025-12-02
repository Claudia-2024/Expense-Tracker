import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useCategoryContext } from "../context/categoryContext";

export default function CategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryName = id ?? "";

  const theme = useTheme();
  const { typography, colors } = theme;

  const {
    categories,
    addExpenseToCategory,
    deleteCustomCategory,
    setCategoryBudget,
  } = useCategoryContext();

  const category = categories.find((c) => c.name === categoryName);

  if (!category) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Category not found</Text>
      </View>
    );
  }

  const { icon, color, expenses, isDefault, id: catId, budget } = category;
  const isCustom = !isDefault;

  // EXPENSE MODAL
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // BUDGET MODAL
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget?.toString() || "");

  const handleSaveExpense = () => {
    if (!expenseName || !expenseAmount) return;

    addExpenseToCategory(categoryName, {
      id: Date.now(),
      title: expenseName,
      amount: parseFloat(expenseAmount),
      category: categoryName,
      type: "expense",
      date: "",
    });

    setExpenseName("");
    setExpenseAmount("");
    setModalVisible(false);
  };

  const handleSaveBudget = () => {
    const value = parseFloat(budgetInput);
    if (isNaN(value)) {
      Alert.alert("Invalid Budget", "Please enter a valid number.");
      return;
    }
    setCategoryBudget(catId, value);
    setBudgetModalVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCustomCategory(catId);
            router.replace("/category-selector/allCategories");
          },
        },
      ]
    );
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const progress = budget ? Math.min(totalExpenses / budget, 1) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={40} color="#fff" />
        <Text
          style={{
            fontSize: 28,
            color: "#fff",
            marginTop: 10,
            fontFamily: typography.fontFamily.boldHeading,
          }}
        >
          {categoryName}
        </Text>
      </View>

      <View style={styles.container}>
        {/* Budget Display */}
        {budget && (
          <View style={styles.budgetContainer}>
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              Budget: {budget.toLocaleString()} XAF
            </Text>
            <Text style={{ color: colors.text }}>
              Spent: {totalExpenses.toLocaleString()} XAF
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: progress >= 1 ? "#FF4D4D" : color,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Set / Update Budget Button */}
        <TouchableOpacity
          style={[styles.setBudgetButton, { backgroundColor: color }]}
          onPress={() => setBudgetModalVisible(true)}
        >
          <Ionicons name="cash-outline" size={20} color="#fff" />
          <Text style={styles.setBudgetText}>
            {budget ? "Update Budget" : "Set Budget"}
          </Text>
        </TouchableOpacity>

        {/* Expenses List */}
        <Text
          style={{
            fontSize: 18,
            marginVertical: 15,
            fontFamily: typography.fontFamily.heading,
            color: colors.text,
          }}
        >
          Expenses in {categoryName}
        </Text>

        {expenses.length ? (
          expenses.map((exp) => (
            <View key={exp.id} style={styles.expenseItem}>
              <Text style={{ color: colors.text, flex: 1, flexWrap: "wrap" }}>
                {exp.title}
              </Text>
              <Text style={{ color: colors.text }}>{exp.amount} XAF</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.muted, marginLeft: 10 }}>
            No expenses yet. Add one using the button below.
          </Text>
        )}

        {/* ADD EXPENSE BUTTON */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: color }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>

        {/* DELETE CATEGORY (CUSTOM ONLY) */}
        {isCustom && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: color }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={color} />
            <Text style={[styles.deleteText, { color }]}>Delete Category</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Expense Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: colors.background }]}
          >
            <Text style={styles.modalTitle}>Add New Expense</Text>
            <TextInput
              placeholder="Expense Name"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
              value={expenseName}
              onChangeText={setExpenseName}
            />
            <TextInput
              placeholder="Amount"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
              value={expenseAmount}
              keyboardType="numeric"
              onChangeText={setExpenseAmount}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: color }]}
                onPress={handleSaveExpense}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal
        visible={budgetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: colors.background }]}
          >
            <Text style={styles.modalTitle}>
              {budget ? "Update Budget" : "Set Budget"}
            </Text>
            <TextInput
              placeholder="Enter budget"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setBudgetModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: color }]}
                onPress={handleSaveBudget}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { width: "100%", paddingVertical: 40, alignItems: "center", justifyContent: "center", borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  container: { padding: 20 },
  budgetContainer: { marginBottom: 20 },
  progressBarBackground: { width: "100%", height: 10, backgroundColor: "#eee", borderRadius: 5, marginTop: 6 },
  progressBarFill: { height: "100%", borderRadius: 5 },
  setBudgetButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, marginBottom: 20 },
  setBudgetText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  expenseItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: "#f2f2f2" },
  addButton: { marginTop: 25, width: "100%", paddingVertical: 14, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteButton: { marginTop: 20, width: "100%", paddingVertical: 14, borderRadius: 12, borderWidth: 2, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  deleteText: { fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  modalButtonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  modalButton: { flex: 0.48, paddingVertical: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
});
