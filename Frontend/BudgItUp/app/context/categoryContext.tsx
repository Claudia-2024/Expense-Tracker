import React, { createContext, useContext, useState, ReactNode } from "react";

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "expense";
};

export type CategoryType = {
  id: number;
  name: string;
  icon: string;
  color: string;
  expenses: Expense[];
  isDefault: boolean;
};

type CategoryContextType = {
  categories: CategoryType[];
  selectedCategories: string[];
  toggleCategory: (name: string) => void;
  addExpenseToCategory: (categoryName: string, expense: Expense) => void;
  addCustomCategory: (cat: CategoryType) => void;
  deleteCustomCategory: (id: number) => void;
  editCustomCategory: (id: number, updates: Partial<CategoryType>) => void; // NEW
};

const CategoryContext = createContext<CategoryContextType>({} as CategoryContextType);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const defaultCategories: CategoryType[] = [
    { id: 1, name: "Food", icon: "fast-food-outline", color: "#FFB3AB", expenses: [], isDefault: true },
    { id: 2, name: "Transport", icon: "car-outline", color: "#88C8FC", expenses: [], isDefault: true },
    { id: 3, name: "Airtime", icon: "phone-portrait-outline", color: "#F7D07A", expenses: [], isDefault: true },
    { id: 4, name: "Social Events", icon: "people-outline", color: "#D291BC", expenses: [], isDefault: true },
    { id: 5, name: "Shopping", icon: "cart-outline", color: "#E6A8D7", expenses: [], isDefault: true },
    { id: 6, name: "Rent", icon: "home-outline", color: "#A0CED9", expenses: [], isDefault: true },
    { id: 7, name: "Bills", icon: "document-text-outline", color: "#9F8AC2", expenses: [], isDefault: true },
    { id: 8, name: "Emergency", icon: "alert-circle-outline", color: "#FF9E9E", expenses: [], isDefault: true },
    { id: 9, name: "Medical expenses", icon: "medkit-outline", color: "#81C784", expenses: [], isDefault: true },
    { id: 999, name: "Income", icon: "trending-up-outline", color: "#4CAF50", expenses: [], isDefault: true },
  ];

  const [categories, setCategories] = useState<CategoryType[]>(defaultCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const addExpenseToCategory = (categoryName: string, expense: Expense) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === categoryName
          ? { ...cat, expenses: [...cat.expenses, expense] }
          : cat
      )
    );
  };

  const addCustomCategory = (cat: CategoryType) => {
    setCategories((prev) => [...prev, cat]);
  };

  const deleteCustomCategory = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const editCustomCategory = (id: number, updates: Partial<CategoryType>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      )
    );
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        selectedCategories,
        toggleCategory,
        addExpenseToCategory,
        addCustomCategory,
        deleteCustomCategory,
        editCustomCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => useContext(CategoryContext);
