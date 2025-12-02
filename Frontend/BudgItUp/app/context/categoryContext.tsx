import React, { createContext, useContext, useState, ReactNode } from "react";

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
  toggleCategory: (name: string) => void;
  addExpenseToCategory: (categoryName: string, expense: Expense) => void;
  addIncome: (income: Expense) => void;
  addCustomCategory: (cat: CategoryType) => void;
  deleteCustomCategory: (id: number) => void;
  setCategoryBudget: (categoryId: number, amount: number) => void;
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
  ];

  const [categories, setCategories] = useState<CategoryType[]>(defaultCategories);
  const [incomes, setIncomes] = useState<Expense[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Toggle category selection (for UI purposes)
  const toggleCategory = (name: string) => {
    setSelectedCategories(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Add expense to a category
  const addExpenseToCategory = (categoryName: string, expense: Expense) => {
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
        categories,
        incomes,
        selectedCategories,
        toggleCategory,
        addExpenseToCategory,
        addIncome,
        addCustomCategory,
        deleteCustomCategory,
        setCategoryBudget,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => useContext(CategoryContext);
