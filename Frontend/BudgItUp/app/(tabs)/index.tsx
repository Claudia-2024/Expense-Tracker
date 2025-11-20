import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import BalanceCard from '@/components/Cards/balanceCard';
import CategoryScroll from '@/components/scrollbar/categoryScroll';
import { router } from 'expo-router';
import { useTheme } from '@/theme/global';

const Home = () => {
  const theme = useTheme();
  const { typography, colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.row}>
        <BalanceCard
          title="Income"
          subtitle="Track your sources"
          icon="trending-up-outline"
        />

        <BalanceCard
          title="Expenses"
          subtitle="Monitor spending"
          icon="trending-down-outline"
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push("/category-selector/allCategories")}
        style={{ marginLeft: 16, marginBottom: 10 }}
      >
        <Text style={[styles.viewAllText, { color: colors.text }]}>
          View All
        </Text>
      </TouchableOpacity>

      <CategoryScroll />  
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewAllText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
