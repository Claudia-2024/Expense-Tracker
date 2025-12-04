// app/context/categoryContext.tsx - UPDATED VERSION
// This version removes AsyncStorage budget management - budgets are now per-category in backend
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService, { CategoryDto } from "../../services/api";

export type CustomCategory = {
  id: number;
  name: string;
  icon: string;
  color: string;
  expenses: any[];
  isDefault: boolean;
  budget?: number; // This will be removed in future - budgets should be category-specific in backend
};

type CategoryContextType = {
  selectedCategories: string[];
  customCategories: CustomCategory[];
  defaultCategories: CategoryDto[];
  toggleCategory: (name: string) => void;
  setCategories: (cats: string[]) => void;
  addCustomCategory: (cat: CustomCategory) => Promise<void>;
  updateCustomCategory: (cat: CustomCategory) => Promise<void>;
  deleteCustomCategory: (id: number) => Promise<void>;
  setCategoryBudget: (id: number, budget: number) => void;
  loading: boolean;
  refreshCategories: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextType>({
  selectedCategories: [],
  customCategories: [],
  defaultCategories: [],
  toggleCategory: () => {},
  setCategories: () => {},
  addCustomCategory: async () => {},
  updateCustomCategory: async () => {},
  deleteCustomCategory: async () => {},
  setCategoryBudget: () => {},
  loading: true,
  refreshCategories: async () => {},
});

function getIconForCategory(name: string) {
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
}

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
        console.log('✅ Default categories loaded:', defaults.length);
      } catch (error) {
        console.error('❌ Error fetching default categories:', error);
        setDefaultCategories([]);
      }

      // If user is logged in, fetch their categories
      if (userId) {
        try {
          const userCats = await ApiService.getUserCategories(userId);
          console.log('✅ User categories loaded:', userCats.length);

          // Map backend categories to frontend format
          const mappedCustom: CustomCategory[] = userCats.map(cat => ({
            id: cat.id!,
            name: cat.name,
            icon: cat.icon || getIconForCategory(cat.name),
            color: cat.color,
            expenses: [],
            isDefault: cat.isDefault,
            budget: undefined, // TODO: Implement per-category budgets in backend
          }));

          setCustomCategories(mappedCustom);
          setSelectedCategories([]);
        } catch (error) {
          console.error('❌ Error fetching user categories:', error);
          setCustomCategories([]);
        }
      } else {
        console.log('ℹ️ No user logged in, clearing user categories');
        setCustomCategories([]);
        setSelectedCategories([]);
      }
    } catch (error) {
      console.error('❌ Error refreshing categories:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshCategories();
      } catch (e) {
        console.log("❌ Error loading categories:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev =>
        prev.includes(name)
            ? prev.filter(c => c !== name)
            : [...prev, name]
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
        isDefault: false,
      });

      const newCat: CustomCategory = {
        id: created.id!,
        name: created.name,
        icon: created.icon || cat.icon,
        color: created.color,
        expenses: [],
        isDefault: false,
        budget: cat.budget,
      };

      setCustomCategories(prev => [...prev, newCat]);
      console.log('✅ Custom category created:', newCat.name);
    } catch (error) {
      console.error('❌ Error adding custom category:', error);
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
        isDefault: updated.isDefault,
      });

      setCustomCategories(prev =>
          prev.map(c => (c.id === updated.id ? updated : c))
      );
      console.log('✅ Category updated:', updated.name);
    } catch (error) {
      console.error('❌ Error updating custom category:', error);
      throw error;
    }
  };

  const deleteCustomCategory = async (id: number) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not logged in');

      await ApiService.deleteCategory(userId, id);
      setCustomCategories(prev => prev.filter(c => c.id !== id));
      console.log('✅ Category deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting custom category:', error);
      throw error;
    }
  };

  // DEPRECATED: Budget should be managed per-category in backend
  // This is kept for backward compatibility but should be removed
  const setCategoryBudget = async (id: number, budget: number) => {
    console.warn('⚠️ setCategoryBudget is deprecated. Implement per-category budgets in backend.');
    setCustomCategories(prev =>
        prev.map(c => (c.id === id ? { ...c, budget } : c))
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
            setCategoryBudget,
            loading,
            refreshCategories,
          }}
      >
        {children}
      </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => useContext(CategoryContext);