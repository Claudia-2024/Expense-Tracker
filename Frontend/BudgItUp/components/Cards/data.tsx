import { Ionicons } from "@expo/vector-icons";

// CATEGORY TYPE
export type CategoryName =
  | "Food"
  | "Transport"
  | "Airtime"
  | "Social Events"
  | "Shopping"
  | "Rent"
  | "Bills"
  | "Emergency"
  | "Medical expenses";

// ICON MAP
export const categoryIcons: Record<CategoryName, keyof typeof Ionicons.glyphMap> = {
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