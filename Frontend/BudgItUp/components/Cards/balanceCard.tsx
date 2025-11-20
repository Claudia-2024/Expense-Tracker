import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";

interface BalanceCardProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function BalanceCard({ title, subtitle, icon }: BalanceCardProps) {
  const theme = useTheme();
  const { typography, colors } = theme;

  return (
    <View style={[styles.card, { borderColor: colors.boxBorder }]}>
      {icon && (
        <Ionicons
          name={icon}
          size={22}
          color={colors.primary}
          style={{ marginBottom: 4 }}
        />
      )}

      <Text
        style={[
          styles.title,
          { color: colors.text, fontFamily: typography.fontFamily.boldHeading },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: colors.secondary, fontFamily: typography.fontFamily.body },
        ]}
      >
        {subtitle}
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

    // Apple-style soft shadow
    shadowColor: "#c0c6be",
    padding:10,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,

    // Hairline border
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)", 
    alignItems: "flex-start",
    justifyContent: "center",
  },

  title: {
    fontSize: 14,
    marginBottom: 3,
  },

  subtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
});
