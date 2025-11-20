import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const categories = [
  { name: "Food", icon: "fast-food-outline", color: "#FF7043" },
  { name: "Transport", icon: "car-outline", color: "#42A5F5" },
  { name: "Bills", icon: "receipt-outline", color: "#7E57C2" },
  { name: "Shopping", icon: "cart-outline", color: "#EC407A" },
  { name: "Savings", icon: "wallet-outline", color: "#26A69A" },
];

export default function CategoryScroll() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const theme = useColorScheme();

  const isDark = theme === "dark";

  return (
    <View>
      {/* CATEGORY LIST */}
      <Animated.FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.name}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={130}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: item.color },
              isDark && styles.cardDarkShadow,
            ]}
          >
            <Ionicons name={item.icon} size={28} color="#fff" />
            <Text style={styles.label}>{item.name}</Text>
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      {/* DOTS INDICATOR */}
      <View style={styles.dotsContainer}>
        {categories.map((_, index) => {
          const inputRange = [
            (index - 1) * 130,
            index * 130,
            (index + 1) * 130,
          ];

          const dotSize = scrollX.interpolate({
            inputRange,
            outputRange: [6, 10, 6],
            extrapolate: "clamp",
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  opacity: dotOpacity,
                  backgroundColor: isDark ? "#fff" : "#333",
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 120,
    borderRadius: 20,
    padding: 18,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  // Softer shadow on dark mode (Android)
  cardDarkShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 5,
  },
});
