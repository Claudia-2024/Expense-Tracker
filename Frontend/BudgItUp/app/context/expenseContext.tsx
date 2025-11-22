import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Expense = {
  title: ReactNode;
  id: number;
  amount: number;
  category: string;
  note?: string;
  type: "income" | "expense"; 
};

type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  loading: boolean;
};

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: () => {},
  loading: true,
});

// ============================================
// 🔥 MOCK DATA - REMOVE THIS SECTION LATER 🔥
// ============================================
const MOCK_EXPENSES: Expense[] = [
  {
    id: Date.now() - 86400000 * 5, // 5 days ago
    title: "Grocery Shopping",
    amount: 45.50,
    category: "Food",
    note: "Weekly groceries",
    type: "expense"
  },
  {
    id: Date.now() - 86400000 * 3, // 3 days ago
    title: "Uber Ride",
    amount: 12.30,
    category: "Transport",
    note: "To downtown",
    type: "expense"
  },
  {
    id: Date.now() - 86400000 * 2, // 2 days ago
    title: "Monthly Salary",
    amount: 3500.00,
    category: "Income",
    type: "income"
  },
  {
    id: Date.now() - 86400000, // Yesterday
    title: "Coffee Shop",
    amount: 6.75,
    category: "Food",
    note: "Latte and croissant",
    type: "expense"
  },
  {
    id: Date.now() - 7200000, // 2 hours ago
    title: "Phone Bill",
    amount: 35.00,
    category: "Airtime",
    type: "expense"
  },
  {
    id: Date.now() - 3600000, // 1 hour ago
    title: "Netflix Subscription",
    amount: 15.99,
    category: "Bills",
    type: "expense"
  },
  {
    id: Date.now() - 1800000, // 30 mins ago
    title: "Restaurant Dinner",
    amount: 67.80,
    category: "Food",
    note: "Dinner with friends",
    type: "expense"
  },
  {
    id: Date.now() - 600000, // 10 mins ago
    title: "Freelance Project",
    amount: 250.00,
    category: "Income",
    type: "income"
  }
];
// ============================================
// 🔥 END OF MOCK DATA 🔥
// ============================================

export const ExpenseProvider = ({ children }: { children: React.ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses from AsyncStorage
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("expenses");
        if (saved) {
          setExpenses(JSON.parse(saved));
        } else {
          // 🔥 REMOVE THIS ELSE BLOCK TO REMOVE MOCK DATA 🔥
          setExpenses(MOCK_EXPENSES);
        }
      } catch (e) {
        console.log("Error loading expenses:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Save automatically whenever expenses change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses]);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, loading }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);

export default ExpenseProvider;