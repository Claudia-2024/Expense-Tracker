import { Ionicons } from '@expo/vector-icons';

// Define your category names
export type CategoryName =
  | 'Food'
  | 'Transport'
  | 'Airtime'
  | 'Social Events'
  | 'Shopping'
  | 'Rent'
  | 'Bills'
  | 'Emergency'
  | 'Medical expenses';

// Map each category to a valid Ionicons icon
export const categoryIcons: Record<CategoryName, keyof typeof Ionicons.glyphMap> = {
  Food: 'fast-food',
  Transport: 'car',
  Airtime: 'phone-portrait',
  'Social Events': 'people',
  Shopping: 'cart',
  Rent: 'home',
  Bills: 'document-text',
  Emergency: 'alert-circle',
  'Medical expenses': 'medkit',
};
