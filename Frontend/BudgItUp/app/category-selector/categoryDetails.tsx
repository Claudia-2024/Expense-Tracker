import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { useLocalSearchParams } from "expo-router";
import categories from "../data/categories";

export default function CategoryDetails() {
  const { id } = useLocalSearchParams();
  const category = categories.find((c) => c.id == id);

  const theme = useColorScheme();
  const isDark = theme === "dark";

  const [expenses, setExpenses] = React.useState([
    { id: 1, title: "Bought Snacks", amount: 1200 },
    { id: 2, title: "Taxi", amount: 800 },
  ]);

  function deleteExpense(expenseId: number) {
    setExpenses(expenses.filter((e) => e.id !== expenseId));
  }

  function addExpense() {
    setExpenses([
      ...expenses,
      { id: Date.now(), title: "New Expense", amount: 500 },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0d0d0d" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        {category?.name}
      </Text>

      <TouchableOpacity onPress={addExpense} style={styles.addButton}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add Expense</Text>
      </TouchableOpacity>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.expenseItem,
              { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" },
            ]}
          >
            <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 16 }}>
              {item.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#4CAF50", marginRight: 10 }}>
                {item.amount} XAF
              </Text>
              <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  expenseItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
