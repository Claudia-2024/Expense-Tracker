import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService, { ExpenseDto } from "../../services/api";

export type Expense = {
  title?: ReactNode;
  id: number;
  amount: number;
  category: string;
  categoryId?: number;
  note?: string;
  type: "income" | "expense";
  date?: string;
};

type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (expense: Expense) => Promise<void>;
  loading: boolean;
  refreshExpenses: () => Promise<void>;
};

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: async () => {},
  loading: true,
  refreshExpenses: async () => {},
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

  const getUserId = async (): Promise<number | null> => {
    try {
      const id = await AsyncStorage.getItem('userId');
      return id ? parseInt(id) : null;
    } catch (e) {
      console.error('Error getting userId:', e);
      return null;
    }
  };

  const refreshExpenses = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.log('No user logged in, skipping expense fetch');
        setLoading(false);
        return;
      }

      const backendExpenses = await ApiService.getUserExpenses(userId);

      const mappedExpenses: Expense[] = backendExpenses.map(exp => ({
        id: exp.id!,
        amount: exp.amount,
        category: '', // Will be populated from categoryId
        categoryId: exp.categoryId,
        note: exp.note,
        type: "expense" as const,
        date: exp.date,
      }));

      setExpenses(mappedExpenses);
    } catch (error: any) {
      console.error('Error refreshing expenses:', error);
      // If it's an authentication error, just set empty expenses
      if (error.message?.includes('Failed to fetch')) {
        console.log('Unable to fetch expenses from backend, using empty state');
        setExpenses([]);
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshExpenses();
        const saved = await AsyncStorage.getItem("expenses");
        if (saved) {
          setExpenses(JSON.parse(saved));
        } else {
          // 🔥 REMOVE THIS ELSE BLOCK TO REMOVE MOCK DATA 🔥
          setExpenses(MOCK_EXPENSES);
        }
      } catch (e) {
        console.log("Error loading expenses:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addExpense = async (expense: Expense) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }

      if (!expense.categoryId) {
        throw new Error('Category ID is required');
      }

      const expenseDto: ExpenseDto = {
        amount: expense.amount,
        note: expense.note,
        categoryId: expense.categoryId,
        date: expense.date || new Date().toISOString().split('T')[0],
      };

      const created = await ApiService.createExpense(userId, expenseDto);

      const newExpense: Expense = {
        id: created.id!,
        amount: created.amount,
        category: expense.category,
        categoryId: created.categoryId,
        note: created.note,
        type: expense.type,
        date: created.date,
      };

      setExpenses(prev => [...prev, newExpense]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  return (
      <ExpenseContext.Provider value={{ expenses, addExpense, loading, refreshExpenses }}>
        {children}
      </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);

export default ExpenseProvider;