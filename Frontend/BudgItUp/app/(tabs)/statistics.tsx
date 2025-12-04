// app/(tabs)/statistics.tsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useCategoryContext } from "../context/categoryContext";
import { useExpenseContext } from "../context/expenseContext";
import { useTheme } from "@/theme/globals";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "@/services/api";

const screenWidth = Dimensions.get("window").width;

const Statistics = () => {
  const [activeChart, setActiveChart] = useState<"pie" | "bar">("pie");
  const { customCategories } = useCategoryContext();
  const { expenses, refreshExpenses } = useExpenseContext();
  const theme = useTheme();
  const { colors, typography } = theme;
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<{ categoryId: number; amount: number }[]>([]);

  // Load data when screen comes into focus
  useFocusEffect(
      useCallback(() => {
        loadData();
      }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');

      if (userId) {
        await refreshExpenses();

        // Fetch budgets for all categories
        const userBudgets = await ApiService.getUserBudgets(parseInt(userId));
        setBudgets(userBudgets.map(b => ({ categoryId: b.categoryId!, amount: b.amount })));
      }
    } catch (error) {
      console.error("Error loading statistics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate expenses by category from real data
  const categoryExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const categoryTotals = new Map<number, { name: string; amount: number; color: string }>();

    expenses.forEach(expense => {
      if (expense.categoryId) {
        const category = customCategories.find(cat => cat.id === expense.categoryId);
        if (category) {
          const existing = categoryTotals.get(expense.categoryId);
          if (existing) {
            existing.amount += expense.amount;
          } else {
            categoryTotals.set(expense.categoryId, {
              name: category.name,
              amount: expense.amount,
              color: category.color,
            });
          }
        }
      }
    });

    return Array.from(categoryTotals.values()).filter(cat => cat.amount > 0);
  }, [expenses, customCategories]);

  // Calculate monthly expenses from real data (last 12 months)
  const monthlyExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    const now = new Date();
    const monthTotals = new Array(12).fill(0);

    expenses.forEach(expense => {
      const expenseDate = expense.date ? new Date(expense.date) : new Date(expense.id);
      const monthsDiff = (now.getFullYear() - expenseDate.getFullYear()) * 12 +
          (now.getMonth() - expenseDate.getMonth());

      if (monthsDiff >= 0 && monthsDiff < 12) {
        const monthIndex = 11 - monthsDiff; // Most recent month at the end
        monthTotals[monthIndex] += expense.amount;
      }
    });

    return monthTotals;
  }, [expenses]);

  // Calculate budget exceeded categories
  const budgetExceeded = useMemo(() => {
    if (!budgets || budgets.length === 0 || !categoryExpenses || categoryExpenses.length === 0) {
      return [];
    }

    const exceeded: Array<{ name: string; budget: number; spent: number; color: string }> = [];

    budgets.forEach(budget => {
      const category = customCategories.find(cat => cat.id === budget.categoryId);
      const expense = categoryExpenses.find(exp => {
        const cat = customCategories.find(c => c.name === exp.name && c.id === budget.categoryId);
        return !!cat;
      });

      if (category && expense && expense.amount > budget.amount) {
        exceeded.push({
          name: category.name,
          budget: budget.amount,
          spent: expense.amount,
          color: category.color,
        });
      }
    });

    return exceeded.sort((a, b) => (b.spent - b.budget) - (a.spent - a.budget));
  }, [budgets, categoryExpenses, customCategories]);

  // Month labels for bar chart
  const monthLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    return labels;
  }, []);

  // Prepare pie chart data
  const pieData = categoryExpenses.map((cat) => ({
    name: cat.name,
    population: cat.amount,
    color: cat.color,
    legendFontColor: "#666",
    legendFontSize: 14,
  }));

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(61, 139, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
  };

  if (loading) {
    return (
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10, fontFamily: typography.fontFamily.body }}>
            Loading statistics...
          </Text>
        </View>
    );
  }

  return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

        {/* Header */}
        <Text style={[styles.header, {
          color: colors.text,
          fontFamily: typography.fontFamily.boldHeading
        }]}>
          Statistics
        </Text>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
              style={[
                styles.toggleButton,
                activeChart === "pie" && styles.toggleButtonActive
              ]}
              onPress={() => setActiveChart("pie")}
          >
            <Text style={[
              styles.toggleText,
              activeChart === "pie" && styles.toggleTextActive,
              { fontFamily: typography.fontFamily.buttonText }
            ]}>
              Category Breakdown
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[
                styles.toggleButton,
                activeChart === "bar" && styles.toggleButtonActive
              ]}
              onPress={() => setActiveChart("bar")}
          >
            <Text style={[
              styles.toggleText,
              activeChart === "bar" && styles.toggleTextActive,
              { fontFamily: typography.fontFamily.buttonText }
            ]}>
              Monthly Trends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart Display */}
        <View style={styles.chartCard}>
          {activeChart === "pie" ? (
              pieData.length > 0 ? (
                  <PieChart
                      data={pieData}
                      width={screenWidth - 48}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                      hasLegend={false}
                  />
              ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { fontFamily: typography.fontFamily.body }]}>
                      No expense data yet
                    </Text>
                    <Text style={[styles.emptySubtext, { fontFamily: typography.fontFamily.body }]}>
                      Start tracking your expenses!
                    </Text>
                  </View>
              )
          ) : (
              monthlyExpenses.some(val => val > 0) ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        data={{
                          labels: monthLabels,
                          datasets: [{ data: monthlyExpenses }]
                        }}
                        width={Math.max(screenWidth - 48, monthLabels.length * 50)}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.barChart}
                        showValuesOnTopOfBars
                        fromZero
                        yAxisLabel="XAF "
                        yAxisSuffix=""
                    />
                  </ScrollView>
              ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { fontFamily: typography.fontFamily.body }]}>
                      No monthly data yet
                    </Text>
                    <Text style={[styles.emptySubtext, { fontFamily: typography.fontFamily.body }]}>
                      Track expenses over time to see trends
                    </Text>
                  </View>
              )
          )}
        </View>

        {/* Legend for Pie Chart OR Budget Alerts for Bar Chart */}
        {activeChart === "pie" ? (
            pieData.length > 0 && (
                <View style={styles.legendContainer}>
                  {categoryExpenses.map((cat, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                        <Text style={[styles.legendText, { fontFamily: typography.fontFamily.body }]}>
                          {cat.name}
                        </Text>
                      </View>
                  ))}
                </View>
            )
        ) : (
            <View style={styles.budgetSection}>
              <Text style={[styles.sectionTitle, {
                color: colors.text,
                fontFamily: typography.fontFamily.heading
              }]}>
                Budget Alerts
              </Text>

              {budgetExceeded.length > 0 ? (
                  budgetExceeded.map((cat, index) => {
                    const exceeded = cat.spent - cat.budget;
                    const percentOver = ((exceeded / cat.budget) * 100).toFixed(0);

                    return (
                        <View key={index} style={styles.budgetCard}>
                          <View style={styles.budgetLeft}>
                            <View style={[styles.alertIcon, { backgroundColor: cat.color }]}>
                              <Text style={styles.alertIconText}>!</Text>
                            </View>
                            <View style={styles.budgetInfo}>
                              <Text style={[styles.budgetName, {
                                fontFamily: typography.fontFamily.body
                              }]}>
                                {cat.name}
                              </Text>
                              <Text style={[styles.budgetDetail, {
                                fontFamily: typography.fontFamily.body
                              }]}>
                                Budget: XAF {cat.budget.toFixed(2)} • Spent: XAF {cat.spent.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.budgetRight}>
                            <Text style={[styles.exceededAmount, {
                              fontFamily: typography.fontFamily.boldHeading
                            }]}>
                              +XAF{exceeded.toFixed(2)}
                            </Text>
                            <Text style={[styles.exceededPercent, {
                              fontFamily: typography.fontFamily.body
                            }]}>
                              {percentOver}% over
                            </Text>
                          </View>
                        </View>
                    );
                  })
              ) : (
                  <View style={styles.emptyBudget}>
                    <Text style={[styles.emptyText, {
                      fontFamily: typography.fontFamily.body
                    }]}>
                      {budgets.length === 0 ? "📊 No budgets set yet" : "🎉 All budgets on track!"}
                    </Text>
                    <Text style={[styles.emptySubtext, {
                      fontFamily: typography.fontFamily.body
                    }]}>
                      {budgets.length === 0
                          ? "Set budgets for your categories to track spending"
                          : "No categories have exceeded their budget"}
                    </Text>
                  </View>
              )}
            </View>
        )}

        {/* Top Categories Ranking - Only show for Pie Chart */}
        {activeChart === "pie" && (
            <View style={styles.rankingSection}>
              <Text style={[styles.sectionTitle, {
                color: colors.text,
                fontFamily: typography.fontFamily.heading
              }]}>
                Top Spending Categories
              </Text>

              {categoryExpenses.length > 0 ? (
                  categoryExpenses
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 5)
                      .map((cat, index) => {
                        const total = categoryExpenses.reduce((sum, c) => sum + c.amount, 0);
                        const percentage = total > 0 ? ((cat.amount / total) * 100).toFixed(1) : 0;

                        return (
                            <View key={index} style={styles.rankCard}>
                              <View style={styles.rankLeft}>
                                <View style={[styles.rankNumber, { backgroundColor: cat.color }]}>
                                  <Text style={styles.rankNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.rankInfo}>
                                  <Text style={[styles.rankName, {
                                    fontFamily: typography.fontFamily.body
                                  }]}>
                                    {cat.name}
                                  </Text>
                                  <Text style={[styles.rankPercentage, {
                                    fontFamily: typography.fontFamily.body
                                  }]}>
                                    {percentage}% of total
                                  </Text>
                                </View>
                              </View>
                              <Text style={[styles.rankAmount, {
                                fontFamily: typography.fontFamily.boldHeading
                              }]}>
                                XAF {cat.amount.toFixed(2)}
                              </Text>
                            </View>
                        );
                      })
              ) : (
                  <View style={styles.emptyRanking}>
                    <Text style={[styles.emptyText, { fontFamily: typography.fontFamily.body }]}>
                      No expenses to display
                    </Text>
                    <Text style={[styles.emptySubtext, { fontFamily: typography.fontFamily.body }]}>
                      Add expenses to see your spending breakdown
                    </Text>
                  </View>
              )}
            </View>
        )}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 60,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#FCB53B",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  barChart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  rankingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  rankCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumberText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  rankPercentage: {
    fontSize: 13,
    color: "#999",
  },
  rankAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D8BFF",
  },
  emptyRanking: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  budgetSection: {
    marginBottom: 20,
    marginTop: 20,
  },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertIconText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  budgetDetail: {
    fontSize: 12,
    color: "#999",
  },
  budgetRight: {
    alignItems: "flex-end",
  },
  exceededAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 2,
  },
  exceededPercent: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  emptyBudget: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
  },
});