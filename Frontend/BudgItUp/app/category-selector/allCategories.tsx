// CategoryPage.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { useCategoryContext } from "../context/categoryContext";

export default function CategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryName = id ?? "";

  const theme = useTheme();
  const { typography, colors } = theme;

  const { categories, addExpenseToCategory, deleteCustomCategory } = useCategoryContext();

  const category = categories.find(c => c.name === categoryName);

  if (!category) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Category not found</Text>
      </View>
    );
  }

  const { icon, color, expenses, isDefault, id: catId } = category;
  const isCustom = !isDefault;

  const [modalVisible, setModalVisible] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const handleSaveExpense = () => {
    if (!expenseName || !expenseAmount) return;

    addExpenseToCategory(categoryName, {
      id: Date.now(),
      title: expenseName,
      amount: parseFloat(expenseAmount),
      category: categoryName,
      type: "expense",
    });

    setExpenseName("");
    setExpenseAmount("");
    setModalVisible(false);
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
            router.replace("/category-selector/allCategories"); // navigate safely
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={40} color="#fff" />
        <Text style={{ fontSize: 28, color: "#fff", marginTop: 10, fontFamily: typography.fontFamily.boldHeading }}>
          {categoryName}
        </Text>
      </View>

      <View style={styles.container}>
        <Text style={{ fontSize: 18, marginBottom: 15, fontFamily: typography.fontFamily.heading, color: colors.text }}>
          Expenses in {categoryName}
        </Text>

        {expenses.length ? (
          expenses.map(exp => (
            <View key={exp.id} style={styles.expenseItem}>
              <Text style={{ color: colors.text }}>{exp.title}</Text>
              <Text style={{ color: colors.text }}>{exp.amount} XAF</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.muted }}>No expenses yet. Add one using the button below.</Text>
        )}

        <TouchableOpacity style={[styles.addButton, { backgroundColor: color }]} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>

        {isCustom && (
          <TouchableOpacity style={[styles.deleteButton, { borderColor: color }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={color} />
            <Text style={[styles.deleteText, { color }]}>Delete Category</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Text style={{ fontSize: 18, fontFamily: typography.fontFamily.boldHeading, marginBottom: 10 }}>Add New Expense</Text>

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

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#ccc" }]} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, { backgroundColor: color }]} onPress={handleSaveExpense}>
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
  addButton: { marginTop: 25, width: "100%", paddingVertical: 14, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteButton: { marginTop: 20, width: "100%", paddingVertical: 14, borderRadius: 12, borderWidth: 2, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  deleteText: { fontSize: 16, fontWeight: "600" },
  expenseItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: "#f2f2f2" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", padding: 20, borderRadius: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
});
