import React, { useMemo, useEffect, useState } from "react";
import { FlatList, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCategoryContext } from "../../app/context/categoryContext";
import { useExpenseContext } from "../../app/context/expenseContext";
import { useIncomeContext } from "../../app/context/incomeContext";
import { useTheme } from "@/theme/globals";
import { router } from "expo-router";
import { useCurrency } from "@/utils/currency";
import ApiService from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CategoryWithData = {
  id: number;
  name: string;
  color: string;
  icon: string;
  totalExpenses: number;
  totalIncome: number;
  budget: number;
};

const CategoryScroll = () => {
  const { customCategories } = useCategoryContext();
  const { expenses } = useExpenseContext();
  const { incomes } = useIncomeContext();
  const theme = useTheme();
  const { colors, typography } = theme;
  const { format } = useCurrency();
  const [budgets, setBudgets] = useState<{ [categoryId: number]: number }>({});

  useEffect(() => {
    loadBudgets();
  }, [customCategories]);

  const loadBudgets = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const userBudgets = await ApiService.getUserBudgets(parseInt(userId));
        const budgetMap: { [categoryId: number]: number } = {};
        userBudgets.forEach(b => {
          if (b.categoryId) {
            budgetMap[b.categoryId] = b.amount;
          }
        });
        setBudgets(budgetMap);
      }
    } catch (error) {
      console.error("Error loading budgets:", error);
    }
  };

  const categoriesWithData: CategoryWithData[] = useMemo(() => {
    return customCategories.map(category => {
      const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id);
      const totalExpenses = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      const categoryIncomes = incomes.filter(inc => inc.categoryId === category.id);
      const totalIncome = categoryIncomes.reduce((sum, inc) => sum + inc.amount, 0);

      const budget = budgets[category.id] || 0;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        totalExpenses,
        totalIncome,
        budget,
      };
    });
  }, [customCategories, expenses, incomes, budgets]);

  const renderCategory = ({ item }: { item: CategoryWithData }) => {
    const remaining = item.totalIncome - item.totalExpenses;
    const budgetRemaining = item.budget - item.totalExpenses;
    const hasBudget = item.budget > 0;

    return (
        <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: item.color }]}
            onPress={() => router.push({
              pathname: "/categories/[id]",
              params: { id: item.id.toString() },
            })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={28} color="#fff" />
          </View>
          <Text style={[styles.categoryName, { fontFamily: typography.fontFamily.body }]}>
            {item.name}
          </Text>
          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, { fontFamily: typography.fontFamily.body }]}>
              Spent
            </Text>
            <Text style={[styles.amountValue, { fontFamily: typography.fontFamily.boldHeading }]}>
              {format(item.totalExpenses)}
            </Text>
          </View>
          {hasBudget && (
              <View style={styles.budgetContainer}>
                <Text style={[styles.budgetLabel, { fontFamily: typography.fontFamily.body }]}>
                  Budget Remaining
                </Text>
                <Text style={[styles.budgetValue, {
                  fontFamily: typography.fontFamily.boldHeading,
                  color: budgetRemaining >= 0 ? '#fff' : '#ff6b6b'
                }]}>
                  {format(budgetRemaining)}
                </Text>
              </View>
          )}
        </TouchableOpacity>
    );
  };

  return (
      <View style={styles.container}>
        {categoriesWithData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, {
                color: colors.text,
                fontFamily: typography.fontFamily.body
              }]}>
                No categories yet. Add some categories to get started!
              </Text>
            </View>
        ) : (
            <FlatList
                data={categoriesWithData}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        )}
      </View>
  );
};

export default CategoryScroll;

const styles = StyleSheet.create({
  container: { marginVertical: 3 },
  listContent: { paddingHorizontal: 10 },
  categoryCard: { width: 160, borderRadius: 16, padding: 16, marginRight: 12, minHeight: 180 },
  iconContainer: { marginBottom: 6 },
  categoryName: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 12 },
  amountContainer: { marginTop: 2 },
  amountLabel: { fontSize: 11, color: "#fff", opacity: 0.8, marginBottom: 4 },
  amountValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
  budgetContainer: { marginTop: 2, paddingTop: 2, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)' },
  budgetLabel: { fontSize: 11, color: "#fff", opacity: 0.8, marginBottom: 4 },
  budgetValue: { fontSize: 14, fontWeight: "700" },
  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
});