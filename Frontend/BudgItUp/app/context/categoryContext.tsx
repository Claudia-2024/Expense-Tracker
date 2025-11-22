import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService, { CategoryDto } from "../../services/api";
import { Expense } from "./expenseContext";

export type CustomCategory = {
  id: number;
  name: string;
  icon: string;
  color: string;
  expenses: Expense[];
  isDefault: boolean;
};

type CategoryContextType = {
  selectedCategories: string[];
  customCategories: CustomCategory[];
  defaultCategories: CategoryDto[];
  toggleCategory: (category: string) => void;
  setCategories: (cats: string[]) => void;
  addCustomCategory: (cat: CustomCategory) => Promise<void>;
  updateCustomCategory: (cat: CustomCategory) => Promise<void>;
  deleteCustomCategory: (id: number) => Promise<void>;
  addExpenseToCategory: (categoryName: string, expense: Expense) => void;
  loading: boolean;
  refreshCategories: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextType>(null as any);

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
      // Fetch default categories (no auth required)
      try {
        const defaults = await ApiService.getDefaultCategories();
        setDefaultCategories(defaults);
        console.log('Default categories loaded:', defaults.length);
      } catch (error) {
        console.error('Error fetching default categories:', error);
        setDefaultCategories([]);
      }

      // Fetch user's custom categories (requires auth)
      const userId = await getUserId();
      if (userId) {
        try {
          const userCats = await ApiService.getUserCategories(userId);
          console.log('User categories loaded:', userCats.length);

          const mappedCustom: CustomCategory[] = userCats.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || getIconForCategory(cat.name),
            color: cat.color,
            expenses: [],
            isDefault: cat.isDefault,
          }));

          setCustomCategories(mappedCustom);

          // Update selectedCategories to include all user categories
          const userCategoryNames = mappedCustom.map(c => c.name);
          setSelectedCategories(prev => {
            const combined = [...new Set([...prev, ...userCategoryNames])];
            return combined;
          });
        } catch (error) {
          console.error('Error fetching user categories:', error);
          setCustomCategories([]);
        }
      } else {
        console.log('No user logged in, skipping user categories fetch');
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const savedSelected = await AsyncStorage.getItem("selectedCategories");
        if (savedSelected) {
          setSelectedCategories(JSON.parse(savedSelected));
        }

        await refreshCategories();
      } catch (e) {
        console.log("Error loading categories:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  const toggleCategory = (category: string) => {
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
        isDefault: false,
      };

      setCustomCategories(prev => [...prev, newCat]);
      setSelectedCategories(prev => [...prev, newCat.name]);
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

      const deletedCat = customCategories.find(c => c.id === id);
      if (deletedCat) {
        setSelectedCategories(prev => prev.filter(name => name !== deletedCat.name));
      }

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