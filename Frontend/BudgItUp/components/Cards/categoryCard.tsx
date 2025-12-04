import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/globals";

// TYPES
export type DefaultCategoryName =
  | "Food"
  | "Transport"
  | "Airtime"
  | "Social Events"
  | "Shopping"
  | "Rent"
  | "Bills"
  | "Emergency"
  | "Medical expenses";

export type CategoryType = {
  name: string;
  icon: string;
  color: string;
};

export const defaultCategoryIcons: Record<DefaultCategoryName, keyof typeof Ionicons.glyphMap> = {
  Food: "fast-food",
  Transport: "car",
  Airtime: "phone-portrait",
  "Social Events": "people",
  Shopping: "cart",
  Rent: "home",
  Bills: "document-text",
  Emergency: "alert-circle",
  "Medical expenses": "medkit",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_SIZE = SCREEN_WIDTH / 3 - 24;

interface Props {
  category: CategoryType | { name: DefaultCategoryName }; // accepts default or custom
  selected?: boolean;
  onPress?: (selected: boolean) => void;
}

const CategoryCard: React.FC<Props> = ({ category, selected: propSelected = false, onPress }) => {
  const [selected, setSelected] = useState(propSelected);
  const theme = useTheme();
  const { typography, colors } = theme;

  const handlePress = () => {
    const newState = !selected;
    setSelected(newState);
    onPress?.(newState);
  };

  // Determine icon & color
  const icon =
    "icon" in category
      ? category.icon // custom category
      : defaultCategoryIcons[category.name]; // default category
  const color =
    "color" in category ? category.color : colors.background; // custom category color, default fallback

  return (
    <Pressable onPress={handlePress}>
      <View
        style={[
          styles.card,
          {
            width: CARD_SIZE,
            height: CARD_SIZE,
            backgroundColor: selected ? colors.primary : color,
            borderColor: selected ? colors.primary : colors.secondary,
            borderWidth: 2,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={32}
          color={selected ? colors.secondary : colors.gray}
        />
        <Text
          style={[
            styles.title,
            {
              color: selected ? colors.secondary : colors.gray,
              fontFamily: typography.fontFamily.body,
            },
          ]}
        >
          {category.name}
        </Text>
      </View>
    </Pressable>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    paddingHorizontal: 6,
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
