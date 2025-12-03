// app/context/categoryContext.tsx
// COPY AND PASTE THIS ENTIRE FILE - REPLACES YOUR EXISTING categoryContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService, { CategoryDto } from "../../services/api";
import { Expense } from "./expenseContext";

// Transaction type
export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
};

// Category type (for expenses)
export type CategoryType = {
export type CustomCategory = {
  id: number;
  name: string;
  icon: string;
  color: string;
  expenses: Expense[];
  isDefault: boolean;
  budget?: number; // optional budget
};

type CategoryContextType = {
  categories: CategoryType[];
  incomes: Expense[];
  selectedCategories: string[];
  customCategories: CustomCategory[];
  defaultCategories: CategoryDto[];
  toggleCategory: (category: string) => void;
  setCategories: (cats: string[]) => void;
  addCustomCategory: (cat: CustomCategory) => Promise<void>;
  updateCustomCategory: (cat: CustomCategory) => Promise<void>;
  deleteCustomCategory: (id: number) => Promise<void>;
  addExpenseToCategory: (categoryName: string, expense: Expense) => void;
  addIncome: (income: Expense) => void;
  addCustomCategory: (cat: CategoryType) => void;
  deleteCustomCategory: (id: number) => void;
  setCategoryBudget: (categoryId: number, amount: number) => void;
};

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [defaultCategories, setDefaultCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserId = async (): Promise<number | null> => {
    try {
      const id = await AsyncStorage.getItem('userId');
      return id ? parseInt(id) : null;
    } catch (e) {
      console.error('Error getting userId:', e);
      return null;
    }
  };

  const refreshCategories = async () => {
    try {
      const userId = await getUserId();

      // Fetch default categories (always available, for new users during signup)
      try {
        const defaults = await ApiService.getDefaultCategories();
        setDefaultCategories(defaults);
        console.log('Default categories loaded:', defaults.length);
      } catch (error) {
        console.error('Error fetching default categories:', error);
        setDefaultCategories([]);
      }

      // If user is logged in, fetch their categories
      if (userId) {
        try {
          const userCats = await ApiService.getUserCategories(userId);
          console.log('User categories loaded:', userCats.length);

          // Map backend categories to frontend format
          // isDefault from backend tells us if it's a chosen default or truly custom
          const mappedCustom: CustomCategory[] = userCats.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || getIconForCategory(cat.name),
            color: cat.color,
            expenses: [],
            isDefault: cat.isDefault, // Use backend's isDefault value
          }));

          setCustomCategories(mappedCustom);
          setSelectedCategories([]);
        } catch (error) {
          console.error('Error fetching user categories:', error);
          setCustomCategories([]);
        }
      } else {
        console.log('No user logged in, clearing user categories');
        setCustomCategories([]);
        setSelectedCategories([]);
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshCategories();
      } catch (e) {
        console.log("Error loading categories:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleCategory = (category: string) => {

  // Toggle category selection (for UI purposes)
  const toggleCategory = (name: string) => {
    setSelectedCategories(prev =>
        prev.includes(category)
            ? prev.filter(c => c !== category)
            : [...prev, category]
    );
  };

  const setCategories = (cats: string[]) => setSelectedCategories(cats);

  const addCustomCategory = async (cat: CustomCategory) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not logged in');

      const created = await ApiService.createCategory(userId, {
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      });

      const newCat: CustomCategory = {
        id: created.id,
        name: created.name,
        icon: created.icon || cat.icon,
        color: created.color,
        expenses: [],
        isDefault: false, // Truly custom categories are not default
      };

      setCustomCategories(prev => [...prev, newCat]);
    } catch (error) {
      console.error('Error adding custom category:', error);
      throw error;
    }
  };

  const updateCustomCategory = async (updated: CustomCategory) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not logged in');

      await ApiService.updateCategory(userId, updated.id, {
        name: updated.name,
        color: updated.color,
        icon: updated.icon,
      });

      setCustomCategories(prev =>
          prev.map(c => (c.id === updated.id ? updated : c))
      );
    } catch (error) {
      console.error('Error updating custom category:', error);
      throw error;
    }
  };

  const deleteCustomCategory = async (id: number) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not logged in');

      await ApiService.deleteCategory(userId, id);
      setCustomCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting custom category:', error);
      throw error;
    }
  };

  const addExpenseToCategory = (categoryName: string, expense: Expense) => {
    setCustomCategories(prev =>
        prev.map(cat =>
            cat.name === categoryName
                ? { ...cat, expenses: [...cat.expenses, expense] }
                : cat
        )
    setCategories(prev =>
      prev.map(cat =>
        cat.name === categoryName
          ? { ...cat, expenses: [...cat.expenses, expense] }
          : cat
      )
    );
  };

  // Add a new income
  const addIncome = (income: Expense) => {
    setIncomes(prev => [...prev, income]);
  };

  // Add a new custom category
  const addCustomCategory = (cat: CategoryType) => {
    setCategories(prev => [...prev, cat]);
  };

  // Delete a custom category
  const deleteCustomCategory = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Set budget for a category
  const setCategoryBudget = (categoryId: number, amount: number) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, budget: amount } : cat
      )
    );
  };

  return (
      <CategoryContext.Provider
          value={{
            selectedCategories,
            customCategories,
            defaultCategories,
            toggleCategory,
            setCategories,
            addCustomCategory,
            updateCustomCategory,
            deleteCustomCategory,
            addExpenseToCategory,
            loading,
            refreshCategories,
          }}
      >
        {children}
      </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => useContext(CategoryContext);