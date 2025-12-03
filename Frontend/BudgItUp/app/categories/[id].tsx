// app/categories/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useCategoryContext } from "../context/categoryContext";
import { useExpenseContext } from "../context/expenseContext";
import ApiService, { IncomeDto } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { typography, colors } = theme;

  const { customCategories, deleteCustomCategory } = useCategoryContext();
  const { addExpense, expenses, refreshExpenses } = useExpenseContext();

  // EXPENSE MODAL
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState<IncomeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const category = customCategories.find(c => c.id.toString() === id);
  const categoryName = category?.name ?? "Category";
  const icon = category?.icon ?? "pricetag-outline";
  const color = category?.color ?? "#348DDB";

  const categoryExpenses = expenses.filter(exp => exp.categoryId === category?.id);

  const loadCategoryData = async () => {
    if (category) {
      try {
        const userIdStr = await AsyncStorage.getItem('userId');
        if (!userIdStr) return;
        const userId = parseInt(userIdStr);

        // Load expense total
        const total = await ApiService.getCategoryTotal(category.id);
        setCategoryTotal(total);

        // Load income allocation for this category
        const income = await ApiService.getCategoryIncome(userId, category.id);
        setCategoryIncome(income);
      } catch (error) {
        console.error('Error loading category data:', error);
        setCategoryTotal(0);
        setCategoryIncome(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategoryData();
  }, [category, expenses]);

  // BUDGET MODAL
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget?.toString() || "");

  const handleSaveExpense = () => {
    if (!expenseName || !expenseAmount) return;
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshExpenses();
    await loadCategoryData();
    setRefreshing(false);
  };

  const handleSaveExpense = async () => {
    if (!expenseName || !expenseAmount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!category) {
      Alert.alert("Error", "Category not found");
      return;
    }

    setSaving(true);

    try {
      await addExpense({
        id: Date.now(),
        title: expenseName,
        amount: amountNum,
        category: categoryName,
        categoryId: category.id,
        type: "expense",
        note: expenseName,
        date: expenseDate.toISOString().split('T')[0],
      });

      Alert.alert("Success", "Expense added successfully");
      setExpenseName("");
      setExpenseAmount("");
      setExpenseDate(new Date());
      setModalVisible(false);

      await loadCategoryData();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add expense");
    } finally {
      setSaving(false);
    }
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
    if (!category) return;

    Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${categoryName}"? This will also delete all expenses in this category and cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteCustomCategory(category.id);
                Alert.alert("Success", "Category deleted");
                router.replace("/category-selector/allCategories");
              } catch (error: any) {
                Alert.alert("Error", error.message || "Failed to delete category");
              }
            },
          },
        ]
    );
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const progress = budget ? Math.min(totalExpenses / budget, 1) : 0;
  if (!category) {
    return (
        <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
          <Text style={{ color: colors.text }}>Category not found</Text>
          <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary, marginTop: 20 }]}
              onPress={() => router.back()}
          >
            <Text style={{ color: '#fff' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
      >
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

          {/* Show Income Allocation - MOVED BELOW CATEGORY NAME */}
          {categoryIncome && (
              <View style={styles.incomeContainer}>
                <Text style={styles.incomeLabel}>Income Allocated</Text>
                <Text style={styles.incomeAmount}>
                  {categoryIncome.amount.toFixed(2)} XAF
                </Text>
              </View>
          )}

          {/* Show Expense Total */}
          <Text style={{ fontSize: 16, color: "#fff", marginTop: 10 }}>
            Total Expenses: {categoryTotal.toFixed(2)} XAF
          </Text>

          {/* Show Remaining Budget if income is allocated */}
          {categoryIncome && (
              <Text style={{
                fontSize: 16,
                color: categoryIncome.amount - categoryTotal >= 0 ? "#90EE90" : "#FF6B6B",
                marginTop: 5,
                fontWeight: '600'
              }}>
                Remaining: {(categoryIncome.amount - categoryTotal).toFixed(2)} XAF
              </Text>
          )}
        </View>

        {/* BODY */}
        <View style={styles.container}>
          <Text
              style={{
                fontSize: 18,
                marginBottom: 15,
                fontFamily: typography.fontFamily.heading,
                color: colors.text,
              }}
          >
            Expenses in {categoryName}
          </Text>

          {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
          ) : categoryExpenses.length > 0 ? (
              categoryExpenses.map((exp) => (
                  <View
                      key={exp.id}
                      style={[
                        styles.expenseItem,
                        {
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: colors.muted
                        }
                      ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
                        {exp.note || 'Expense'}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
                        {exp.date ? new Date(exp.date).toLocaleDateString() : 'No date'}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>
                      {exp.amount.toFixed(2)} XAF
                    </Text>
                  </View>
              ))
          ) : (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={60} color={colors.muted} />
                <Text style={{ color: colors.muted, marginTop: 10, textAlign: 'center' }}>
                  No expenses recorded for this category yet. Add one using the button below.
                </Text>
              </View>
          )}
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

          {/* Add Expense Button */}
          <TouchableOpacity
              style={[styles.addButton, { backgroundColor: color }]}
              onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>

          {/* Delete Category Button - only for non-default categories */}
          {!category.isDefault && (
              <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: color }]}
                  onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color={color} />
                <Text style={[styles.deleteText, { color }]}>Delete Category</Text>
              </TouchableOpacity>
          )}
        </View>

        {/* Modal for Adding Expense */}
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
              <View style={styles.modalHeader}>
                <Text
                    style={{
                      fontSize: 18,
                      fontFamily: typography.fontFamily.boldHeading,
                      color: colors.text,
                      flex: 1,
                    }}
                >
                  Add Expense to {categoryName}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                  placeholder="Expense description"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                  value={expenseName}
                  onChangeText={setExpenseName}
              />

              <TextInput
                  placeholder="Amount (XAF)"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                  value={expenseAmount}
                  keyboardType="numeric"
                  onChangeText={setExpenseAmount}
              />

              {/* Date picker for expense */}
              <Text style={[styles.dateLabel, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                Date
              </Text>
              <TouchableOpacity
                  style={[styles.dateButton, { borderColor: colors.primary }]}
                  onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.text }}>{expenseDate.toDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                  <DateTimePicker
                      value={expenseDate}
                      mode="date"
                      display="default"
                      onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setExpenseDate(selectedDate);
                      }}
                  />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.muted }]}
                    onPress={() => {
                      setExpenseName("");
                      setExpenseAmount("");
                      setModalVisible(false);
                    }}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                      styles.modalButton,
                      {
                        backgroundColor: color,
                        opacity: saving ? 0.6 : 1
                      }
                    ]}
                    onPress={handleSaveExpense}
                    disabled={saving}
                >
                  {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                  ) : (
                      <Text style={{ color: "#fff", fontWeight: '600' }}>Save</Text>
                  )}
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
  header: {
    width: "100%",
    paddingVertical: 40,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  incomeContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  incomeLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  incomeAmount: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  container: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  addButton: {
    marginTop: 25,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 20,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: 15,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
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