import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Expense } from "./expenseContext";

// ----------------------
// TYPES
// ----------------------

export type CustomCategory = {
  id: number;
  name: string;
  icon: string;
  color: string;
  expenses: Expense[];
  isDefault: boolean; // marks wrapped default categories
};

type CategoryContextType = {
  selectedCategories: string[];
  customCategories: CustomCategory[];
  toggleCategory: (category: string) => void;
  setCategories: (cats: string[]) => void;
  addCustomCategory: (cat: CustomCategory) => void;
  updateCustomCategory: (cat: CustomCategory) => void;
  deleteCustomCategory: (id: number) => void;
  addExpenseToCategory: (categoryName: string, expense: Expense) => void;
  loading: boolean;
};

const CategoryContext = createContext<CategoryContextType>(null as any);

// ----------------------
// ICON + COLOR HELPERS
// (Used to wrap default categories)
// ----------------------

const getIconForCategory = (name: string) => {
  switch (name) {
    case "Food": return "fast-food-outline";
    case "Transport": return "car-outline";
    case "Airtime": return "phone-portrait-outline";
    case "Social Events": return "people-outline";
    case "Shopping": return "cart-outline";
    case "Rent": return "home-outline";
    case "Bills": return "document-text-outline";
    case "Emergency": return "alert-circle-outline";
    case "Medical expenses": return "medkit-outline";
    default: return "pricetag-outline";
  }
};

const getColorForCategory = (name: string) => {
  switch (name) {
    case "Food": return "#FFB3AB";
    case "Transport": return "#88C8FC";
    case "Airtime": return "#F7D07A";
    case "Social Events": return "#D291BC";
    case "Shopping": return "#E6A8D7";
    case "Rent": return "#A0CED9";
    case "Bills": return "#9F8AC2";
    case "Emergency": return "#FF9E9E";
    case "Medical expenses": return "#81C784";
    default: return "#348DDB";
  }
};

// ----------------------
// PROVIDER
// ----------------------

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      try {
        const savedSelected = await AsyncStorage.getItem("selectedCategories");
        const savedCustom = await AsyncStorage.getItem("customCategories");

        if (savedSelected) setSelectedCategories(JSON.parse(savedSelected));
        if (savedCustom) setCustomCategories(JSON.parse(savedCustom));
      } catch (e) {
        console.log("Error loading categories:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Save to storage
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));
      AsyncStorage.setItem("customCategories", JSON.stringify(customCategories));
    }
  }, [selectedCategories, customCategories]);

  // Select/unselect default category
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const setCategories = (cats: string[]) => setSelectedCategories(cats);

  const addCustomCategory = (cat: CustomCategory) =>
    setCustomCategories(prev => [...prev, cat]);

  const updateCustomCategory = (updated: CustomCategory) =>
    setCustomCategories(prev =>
      prev.map(c => (c.id === updated.id ? updated : c))
    );

  const deleteCustomCategory = (id: number) =>
    setCustomCategories(prev => prev.filter(c => c.id !== id));

  // Wrap default category to behave like custom (so it can store expenses)
  const wrapDefaultCategory = (name: string): CustomCategory => {
    return {
      id: Date.now(),
      name,
      icon: getIconForCategory(name),
      color: getColorForCategory(name),
      expenses: [],
      isDefault: true,
    };
  };

  // Add expense
  const addExpenseToCategory = (categoryName: string, expense: Expense) => {
    const exists = customCategories.some(c => c.name === categoryName);

    if (exists) {
      setCustomCategories(prev =>
        prev.map(cat =>
          cat.name === categoryName
            ? { ...cat, expenses: [...cat.expenses, expense] }
            : cat
        )
      );
      return;
    }

    // Not custom → must be a wrapped default category
    const isSelected = selectedCategories.includes(categoryName);
    if (!isSelected) return;

    const wrapped = wrapDefaultCategory(categoryName);

    // First add wrapped category
    setCustomCategories(prev => [...prev, wrapped]);

    // Then add expense to it
    setCustomCategories(prev =>
      prev.map(cat =>
        cat.name === categoryName
          ? { ...cat, expenses: [...cat.expenses, expense] }
          : cat
      )
    );
  };

  return (
    <CategoryContext.Provider
      value={{
        selectedCategories,
        customCategories,
        toggleCategory,
        setCategories,
        addCustomCategory,
        updateCustomCategory,
        deleteCustomCategory,
        addExpenseToCategory,
        loading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// ----------------------
// HOOK
// ----------------------

export const useCategoryContext = () => useContext(CategoryContext);
