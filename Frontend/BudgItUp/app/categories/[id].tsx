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
    editCustomCategory,
  } = useCategoryContext();

  const category = categories.find((c) => c.name === categoryName);

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

  // ---- EDIT CATEGORY STATES ----
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editIcon, setEditIcon] = useState(category.icon);
  const [editColor, setEditColor] = useState(category.color);

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
            router.replace("/category-selector/allCategories");
          },
        },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;

    editCustomCategory(catId, {
      name: editName,
      icon: editIcon,
      color: editColor,
    });

    setEditVisible(false);

    // Update route so header updates
    router.replace({
      pathname: "/categories/[id]",
      params: { id: editName },
    });
  };

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

        {/* EXPENSE LIST */}
        {expenses.length ? (
          expenses.map((exp) => (
            <View key={exp.id} style={styles.expenseItem}>
              <Text style={{ color: colors.text, flex: 1 }}>{exp.title}</Text>
              <Text style={{ color: colors.text }}>{exp.amount} XAF</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.muted, marginLeft: 10 }}>
            No expenses yet. Add one using the button below.
          </Text>
        )}

        {/* ADD EXPENSE */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: color }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>

        {/* CUSTOM CATEGORY ACTIONS */}
        {isCustom && (
          <>
            {/* EDIT BUTTON */}
            <TouchableOpacity
              style={[styles.editButton, { borderColor: color }]}
              onPress={() => setEditVisible(true)}
            >
              <Ionicons name="create-outline" size={20} color={color} />
              <Text style={[styles.editText, { color }]}>Edit Category</Text>
            </TouchableOpacity>

            {/* DELETE BUTTON */}
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: color }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={color} />
              <Text style={[styles.deleteText, { color }]}>Delete Category</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ADD EXPENSE MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: typography.fontFamily.boldHeading,
                marginBottom: 10,
              }}
            >
              Add New Expense
            </Text>

            <TextInput
              placeholder="Expense Name"
              placeholderTextColor={colors.muted}
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              value={expenseName}
              onChangeText={setExpenseName}
            />

            <TextInput
              placeholder="Amount"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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

      {/* EDIT CATEGORY MODAL */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: typography.fontFamily.boldHeading,
                marginBottom: 10,
              }}
            >
              Edit Category
            </Text>

            <TextInput
              placeholder="Category Name"
              placeholderTextColor={colors.muted}
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              value={editName}
              onChangeText={setEditName}
            />

            <TextInput
              placeholder="Icon name"
              placeholderTextColor={colors.muted}
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              value={editIcon}
              onChangeText={setEditIcon}
            />

            <TextInput
              placeholder="Color (hex)"
              placeholderTextColor={colors.muted}
              style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
              value={editColor}
              onChangeText={setEditColor}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setEditVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
              >
                <Text style={{ color: "#fff" }}>Save Changes</Text>
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
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  container: { padding: 20 },
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
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  editButton: {
    marginTop: 15,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  editText: { fontSize: 16, fontWeight: "600" },

  deleteButton: {
    marginTop: 15,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  deleteText: { fontSize: 16, fontWeight: "600" },

  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  modalButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
