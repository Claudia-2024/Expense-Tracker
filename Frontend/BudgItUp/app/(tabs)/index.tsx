import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import BalanceCard from "@/components/Cards/balanceCard";
import CategoryScroll from "@/components/scrollbar/categoryScroll";
import { router } from "expo-router";
import { useTheme } from "@/theme/global";

const Home = () => {
  const theme = useTheme();
  const { typography, colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top row: Income & Expenses */}
      <View style={styles.row}>
        <BalanceCard
          title="Income"
          icon="trending-up-outline"
        />
        <BalanceCard
          title="Expenses"
          icon="trending-down-outline"
        />
      </View>

      {/* View All Categories button */}
      <TouchableOpacity
        onPress={() => router.push("/category-selector/allCategories")}
        style={{ marginLeft: 16, marginBottom: 10 }}
      >
        <Text
          style={[
            styles.viewAllText,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.boldHeading,
              fontSize: typography.fontSize.md,
            },
          ]}
        >
          View All
        </Text>
      </TouchableOpacity>

      {/* Horizontal Scroll: Selected + Custom Categories */}
      <CategoryScroll />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  viewAllText: {
    fontWeight: "600",
    fontSize: 16,
    paddingTop: 5,
  },
});
