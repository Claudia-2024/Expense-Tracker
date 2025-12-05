// app/categories/[id].tsx - COMPLETE with Edit/Delete Expense
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
import { useTheme } from "@/theme/globals";
import { useCategoryContext } from "../context/categoryContext";
import { useExpenseContext } from "../context/expenseContext";
import { useIncomeContext } from "../context/incomeContext";
import ApiService, { IncomeDto, BudgetDto } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCurrency } from "@/utils/currency";

export default function CategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { typography, colors } = theme;

  const { customCategories, deleteCustomCategory, refreshCategories } = useCategoryContext();
  const { addExpense, expenses, refreshExpenses, updateExpense, deleteExpense } = useExpenseContext();
  const { incomes } = useIncomeContext();
  const { format } = useCurrency();

  // ADD EXPENSE MODAL STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 🔥 EDIT EXPENSE MODAL STATE
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [editExpenseName, setEditExpenseName] = useState("");
  const [editExpenseAmount, setEditExpenseAmount] = useState("");
  const [editExpenseDate, setEditExpenseDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const [saving, setSaving] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  // CATEGORY DATA STATE
  const [category, setCategory] = useState<any>(null);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState<IncomeDto | null>(null);
  const [categoryBudget, setCategoryBudget] = useState<BudgetDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categoryName = category?.name ?? "Category";
  const icon = category?.icon ?? "pricetag-outline";
  const color = category?.color ?? "#348DDB";

  const categoryExpenses = expenses.filter(exp => exp.categoryId === category?.id);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const categoryId = parseInt(id);
      const foundCategory = customCategories.find(cat => cat.id === categoryId);

      if (!foundCategory) {
        Alert.alert("Error", "Category not found");
        router.back();
        return;
      }

      setCategory(foundCategory);

      const userIdStr = await AsyncStorage.getItem('userId');
      if (!userIdStr) return;
      const userId = parseInt(userIdStr);

      const categoryExpensesList = expenses.filter(exp => exp.categoryId === categoryId);
      const expensesTotal = categoryExpensesList.reduce((sum, exp) => sum + exp.amount, 0);
      setTotalExpenses(expensesTotal);

      const categoryIncomesList = incomes.filter(inc => inc.categoryId === categoryId);
      const incomesTotal = categoryIncomesList.reduce((sum, inc) => sum + inc.amount, 0);
      setTotalIncome(incomesTotal);

      const total = await ApiService.getCategoryTotal(userId, categoryId);
      setCategoryTotal(total);

      const income = await ApiService.getCategoryIncome(userId, categoryId);
      setCategoryIncome(income);

      const budget = await ApiService.getCategoryBudget(userId, categoryId);
      setCategoryBudget(budget);
      if (budget) {
        setBudgetInput(budget.amount.toString());
      }
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, [id, expenses, incomes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCategories();
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

    setSaving(true);
    try {
      await addExpense({
        id: Date.now(),
        amount: amountNum,
        category: categoryName,
        categoryId: category.id,
        note: expenseName,
        type: "expense",
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

  // 🔥 Open Edit Modal
  const handleExpensePress = (expense: any) => {
    setSelectedExpense(expense);
    setEditExpenseName(expense.note || "");
    setEditExpenseAmount(expense.amount.toString());
    setEditExpenseDate(expense.date ? new Date(expense.date) : new Date());
    setEditModalVisible(true);
  };

  // 🔥 Save Edited Expense
  const handleSaveEditedExpense = async () => {
    if (!editExpenseName || !editExpenseAmount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const amountNum = parseFloat(editExpenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      await updateExpense({
        id: selectedExpense.id,
        amount: amountNum,
        category: categoryName,
        categoryId: category.id,
        note: editExpenseName,
        type: "expense",
        date: editExpenseDate.toISOString().split('T')[0],
      });

      Alert.alert("Success", "Expense updated successfully");
      setEditModalVisible(false);
      await loadCategoryData();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update expense");
    } finally {
      setSaving(false);
    }
  };

  // 🔥 Delete Expense
  const handleDeleteExpense = () => {
    Alert.alert(
        "Delete Expense",
        "Are you sure you want to delete this expense?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setSaving(true);
              try {
                await deleteExpense(selectedExpense.id);
                Alert.alert("Success", "Expense deleted successfully");
                setEditModalVisible(false);
                await loadCategoryData();
              } catch (error: any) {
                Alert.alert("Error", error.message || "Failed to delete expense");
              } finally {
                setSaving(false);
              }
            },
          },
        ]
    );
  };

  const handleSaveBudget = async () => {
    if (!category) return;
    const value = parseFloat(budgetInput);
    if (isNaN(value) || value < 0) {
      Alert.alert("Invalid Budget", "Please enter a valid number.");
      return;
    }

    setSaving(true);
    try {
      const userIdStr = await AsyncStorage.getItem('userId');
      if (!userIdStr) throw new Error('User not logged in');
      const userId = parseInt(userIdStr);

      const updatedBudget = await ApiService.setCategoryBudget(userId, category.id, value);
      setCategoryBudget(updatedBudget);
      Alert.alert("Success", "Budget updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update budget");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (category) {
      router.push({
        pathname: "/category-selector/addCategory",
        params: { category: JSON.stringify(category) },
      });
    }
  };

  const handleDelete = () => {
    if (!category) return;
    if (category.isDefault) {
      Alert.alert("Cannot Delete", "Default categories cannot be deleted.");
      return;
    }

    Alert.alert(
        "Delete Category",
        `Delete "${categoryName}"? All expenses will be deleted.`,
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
                Alert.alert("Error", error.message);
              }
            },
          },
        ]
    );
  };

  if (loading) {
    return (
        <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  if (!category) {
    return (
        <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
          <Text style={{ color: colors.text }}>Category not found</Text>
        </View>
    );
  }

  const remaining = totalIncome - totalExpenses;
  const budgetAmount = categoryBudget?.amount || 0;
  const budgetRemaining = budgetAmount - totalExpenses;
  const budgetProgress = budgetAmount > 0 ? Math.min(totalExpenses / budgetAmount, 1) : 0;

  return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={[styles.header, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={48} color="#fff" />
          <Text style={[styles.categoryName, { fontFamily: typography.fontFamily.boldHeading }]}>{categoryName}</Text>
          {categoryIncome && (
              <View style={styles.incomeContainer}>
                <Text style={styles.incomeLabel}>Income Allocated</Text>
                <Text style={styles.incomeAmount}>{format(categoryIncome.amount)}</Text>
              </View>
          )}
          <Text style={{ fontSize: 16, color: "#fff", marginTop: 10 }}>Total Expenses: {format(categoryTotal)}</Text>
        </View>

        <View style={styles.bodyContainer}>
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.text }]}>Total Income</Text>
              <Text style={[styles.statValue, { color: colors.green }]}>{format(totalIncome)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.text }]}>Total Expenses</Text>
              <Text style={[styles.statValue, { color: colors.red }]}>{format(totalExpenses)}</Text>
            </View>
            <View style={[styles.statRow, styles.totalRow]}>
              <Text style={[styles.statLabel, { color: colors.text, fontWeight: '700' }]}>Remaining</Text>
              <Text style={[styles.statValue, { color: remaining >= 0 ? colors.green : colors.red }]}>{format(remaining)}</Text>
            </View>
          </View>

          {categoryBudget && budgetAmount > 0 && (
              <View style={[styles.budgetCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Budget Status</Text>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.text }]}>Budget</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{format(budgetAmount)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.text }]}>Remaining</Text>
                  <Text style={[styles.statValue, { color: budgetRemaining >= 0 ? colors.green : colors.red }]}>{format(budgetRemaining)}</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${budgetProgress * 100}%`, backgroundColor: budgetProgress >= 1 ? "#FF4D4D" : color }]} />
                </View>
              </View>
          )}

          <View style={[styles.budgetCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{categoryBudget ? "Update Budget" : "Set Budget"}</Text>
            <TextInput style={[styles.input, { borderColor: colors.primary, color: colors.text, backgroundColor: colors.background }]} placeholder="Enter budget" placeholderTextColor={colors.muted} keyboardType="numeric" value={budgetInput} onChangeText={setBudgetInput} />
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveBudget} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.saveButtonText, { fontFamily: typography.fontFamily.boldHeading }]}>Save Budget</Text>}
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses in {categoryName}</Text>
          {categoryExpenses.length > 0 ? (
              categoryExpenses.map((exp) => (
                  <TouchableOpacity key={exp.id} style={[styles.expenseItem, { backgroundColor: colors.card, borderColor: colors.muted }]} onPress={() => handleExpensePress(exp)}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{exp.note || 'Expense'}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{exp.date ? new Date(exp.date).toLocaleDateString() : 'No date'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{format(exp.amount)}</Text>
                      <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} style={{ marginTop: 4 }} />
                    </View>
                  </TouchableOpacity>
              ))
          ) : (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={60} color={colors.muted} />
                <Text style={{ color: colors.muted, marginTop: 10, textAlign: 'center' }}>No expenses yet. Add one below.</Text>
              </View>
          )}

          <TouchableOpacity style={[styles.addButton, { backgroundColor: color }]} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={[styles.addButtonText]}>Add Expense</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={[styles.actionText]}>Edit Category</Text>
            </TouchableOpacity>
            {!category.isDefault && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.red }]} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={[styles.actionText]}>Delete Category</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Add Expense Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Expense</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TextInput placeholder="Description" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.primary }]} value={expenseName} onChangeText={setExpenseName} />
              <TextInput placeholder="Amount" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.primary }]} value={expenseAmount} keyboardType="numeric" onChangeText={setExpenseAmount} />
              <TouchableOpacity style={[styles.dateButton, { borderColor: colors.primary }]} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 8 }}>{expenseDate.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && <DateTimePicker value={expenseDate} mode="date" display="default" onChange={(_, date) => { setShowDatePicker(false); if (date) setExpenseDate(date); }} />}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.muted }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: color }]} onPress={handleSaveExpense} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: '600' }}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 🔥 Edit Expense Modal */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Expense</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TextInput placeholder="Description" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.primary }]} value={editExpenseName} onChangeText={setEditExpenseName} />
              <TextInput placeholder="Amount" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.primary }]} value={editExpenseAmount} keyboardType="numeric" onChangeText={setEditExpenseAmount} />
              <TouchableOpacity style={[styles.dateButton, { borderColor: colors.primary }]} onPress={() => setShowEditDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 8 }}>{editExpenseDate.toDateString()}</Text>
              </TouchableOpacity>
              {showEditDatePicker && <DateTimePicker value={editExpenseDate} mode="date" display="default" onChange={(_, date) => { setShowEditDatePicker(false); if (date) setEditExpenseDate(date); }} />}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]} onPress={handleDeleteExpense} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="trash-outline" size={18} color="#fff" style={{ marginRight: 6 }} /><Text style={{ color: "#fff", fontWeight: '600' }}>Delete</Text></>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleSaveEditedExpense} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: '600' }}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { width: "100%", paddingVertical: 40, paddingTop: 80, alignItems: "center", borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  categoryName: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 16 },
  incomeContainer: { marginTop: 15, padding: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center' },
  incomeLabel: { fontSize: 14, color: '#fff', opacity: 0.9 },
  incomeAmount: { fontSize: 20, color: '#fff', fontWeight: '700', marginTop: 4 },
  bodyContainer: { padding: 20 },
  statsCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  totalRow: { borderTopWidth: 2, borderTopColor: "#ddd", marginTop: 8, paddingTop: 16 },
  statLabel: { fontSize: 16 },
  statValue: { fontSize: 18, fontWeight: "700" },
  budgetCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  progressBarBackground: { width: "100%", height: 10, backgroundColor: "#e0e0e0", borderRadius: 5, marginTop: 12, overflow: 'hidden' },
  progressBarFill: { height: "100%", borderRadius: 5 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  saveButton: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionTitle: { fontSize: 18, marginBottom: 15, marginTop: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  expenseItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: 15, borderRadius: 12, borderWidth: 1 },
  addButton: { marginTop: 25, width: "100%", paddingVertical: 14, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  actions: { marginTop: 20 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, marginBottom: 12, gap: 8 },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", padding: 20, borderRadius: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, flex: 1 },
  dateButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 10 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
});