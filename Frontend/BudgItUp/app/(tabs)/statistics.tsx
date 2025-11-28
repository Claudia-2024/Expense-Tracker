import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useCategoryContext } from "../context/categoryContext";
import { useTheme } from "@/theme/global";

const screenWidth = Dimensions.get("window").width;

const Statistics = () => {
  const [activeChart, setActiveChart] = useState<"pie" | "bar">("pie");
  const { customCategories, selectedCategories } = useCategoryContext();
  const theme = useTheme();
  const { colors, typography } = theme;

  // ==============================================================
  // TODO FOR BACKEND: Replace this with real expense data
  // This should aggregate all expenses by category
  // ==============================================================
  const categoryExpenses = useMemo(() => {
    // DUMMY DATA - Backend should replace this with actual totals
    const dummyData = [
      { name: "Food", amount: 450, color: "#FFB3AB" },
      { name: "Transport", amount: 320, color: "#88C8FC" },
      { name: "Bills", amount: 280, color: "#9F8AC2" },
      { name: "Shopping", amount: 180, color: "#E6A8D7" },
      { name: "Airtime", amount: 150, color: "#F7D07A" },
    ];

    // When backend is ready, use something like:
    // const categoryTotals = customCategories.map(cat => ({
    //   name: cat.name,
    //   amount: cat.expenses.reduce((sum, exp) => sum + exp.amount, 0),
    //   color: cat.color
    // }));
    
    return dummyData.filter(cat => cat.amount > 0);
  }, [customCategories, selectedCategories]);

  // ==============================================================
  // TODO FOR BACKEND: Replace with actual monthly expense totals
  // Should sum all expenses for each of the last 12 months
  // ==============================================================
  const monthlyExpenses = useMemo(() => {
    // DUMMY DATA - Backend should calculate real monthly totals
    return [450, 680, 520, 780, 920, 850, 1100, 980, 720, 650, 580, 890];
    
    // Backend can provide data like:
    // return last12Months.map(month => 
    //   getTotalExpensesForMonth(month)
    // );
  }, []);

  // Month labels
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
              <Text style={styles.emptyText}>No expense data yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your expenses!</Text>
            </View>
          )
        ) : (
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
              yAxisLabel="$"
              yAxisSuffix=""
            />
          </ScrollView>
        )}
      </View>

      {/* Legend for Pie Chart */}
      {activeChart === "pie" && pieData.length > 0 && (
        <View style={styles.legendContainer}>
          {categoryExpenses.map((cat, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
              <Text style={styles.legendText}>{cat.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Top Categories Ranking */}
      <View style={styles.rankingSection}>
        <Text style={[styles.sectionTitle, { 
          color: colors.text,
          fontFamily: typography.fontFamily.heading 
        }]}>
          Top Spending Categories
        </Text>
        
        {categoryExpenses
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
                  ${cat.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        
        {categoryExpenses.length === 0 && (
          <View style={styles.emptyRanking}>
            <Text style={styles.emptyText}>No expenses to display</Text>
            <Text style={styles.emptySubtext}>Add expenses to see your spending breakdown</Text>
          </View>
        )}
      </View>

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
    fontWeight: "400",
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
});