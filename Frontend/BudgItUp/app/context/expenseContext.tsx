// app/context/expenseContext.tsx
// 🔥 UPDATED: Added userId field to Expense type
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
  userId?: number; // 🔥 ADDED: Track which user owns this expense
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
        setExpenses([]);
        setLoading(false);
        return;
      }

      console.log("=== REFRESHING EXPENSES FOR USER:", userId, "===");
      const backendExpenses = await ApiService.getUserExpenses(userId);
      console.log("✅ Fetched expenses from backend:", backendExpenses.length);

      const mappedExpenses: Expense[] = backendExpenses.map(exp => ({
        id: exp.id!,
        amount: exp.amount,
        category: '', // Will be populated from categoryId
        categoryId: exp.categoryId,
        note: exp.note,
        type: "expense" as const,
        date: exp.date,
        userId: exp.userId, // 🔥 ADDED: Include userId
      }));

      console.log("✅ Mapped expenses for user", userId, ":", mappedExpenses.length);
      setExpenses(mappedExpenses);
    } catch (error: any) {
      console.error('Error refreshing expenses:', error);
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

      console.log("=== ADDING EXPENSE FOR USER:", userId, "===");
      console.log("Expense data:", expense);

      const expenseDto: ExpenseDto = {
        amount: expense.amount,
        note: expense.note,
        categoryId: expense.categoryId,
        date: expense.date || new Date().toISOString().split('T')[0],
        userId: userId, // 🔥 Include userId
      };

      const created = await ApiService.createExpense(userId, expenseDto);
      console.log("✅ Expense created:", created);

      const newExpense: Expense = {
        id: created.id!,
        amount: created.amount,
        category: expense.category,
        categoryId: created.categoryId,
        note: created.note,
        type: expense.type,
        date: created.date,
        userId: created.userId, // 🔥 ADDED: Include userId
      };

      setExpenses(prev => [...prev, newExpense]);
      console.log("✅ Expense added to context state");
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