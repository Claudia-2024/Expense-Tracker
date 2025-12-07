import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/globals";
import { useCurrency } from "@/utils/currency";

interface BalanceCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  amount?: number;
}

export default function BalanceCard({ title, subtitle, icon, amount = 0 }: BalanceCardProps) {
  const theme = useTheme();
  const { typography, colors } = theme;
  const { format } = useCurrency();

  return (
      <View style={[styles.card, { borderColor: colors.boxBorder, borderWidth: 2, backgroundColor: colors.background }]}>
        {icon && (
            <Ionicons
                name={icon}
                size={32}
                color={colors.secondary}
                style={{ marginBottom: 6 }}
            />
        )}

        <Text
            style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.boldHeading }]}
        >
          {title}
        </Text>

        {subtitle && (
            <Text
                style={[styles.subtitle, { color: colors.text, fontFamily: typography.fontFamily.buttonText }]}
            >
              {subtitle}
            </Text>
        )}

        <Text
            style={[styles.amount, { color: colors.text, fontFamily: typography.fontFamily.boldHeading }]}
        >
          {format(amount)}
        </Text>
      </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    margin: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  amount: {
    fontSize: 18,
    marginTop: 6,
  },
});