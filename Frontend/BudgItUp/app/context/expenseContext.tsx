// app/context/expenseContext.tsx - UPDATED with Edit and Delete
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
  userId?: number;
};

type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;  // 🔥 NEW
  deleteExpense: (expenseId: number) => Promise<void>; // 🔥 NEW
  loading: boolean;
  refreshExpenses: () => Promise<void>;
};

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: async () => {},
  updateExpense: async () => {},  // 🔥 NEW
  deleteExpense: async () => {},  // 🔥 NEW
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
        category: '',
        categoryId: exp.categoryId,
        note: exp.note,
        type: "expense" as const,
        date: exp.date,
        userId: exp.userId,
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
        userId: userId,
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
        userId: created.userId,
      };

      setExpenses(prev => [...prev, newExpense]);
      console.log("✅ Expense added to context state");
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  // 🔥 NEW: Update Expense
  const updateExpense = async (expense: Expense) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }

      if (!expense.categoryId) {
        throw new Error('Category ID is required');
      }

      console.log("=== UPDATING EXPENSE:", expense.id, "FOR USER:", userId, "===");

      const expenseDto: ExpenseDto = {
        id: expense.id,
        amount: expense.amount,
        note: expense.note,
        categoryId: expense.categoryId,
        date: expense.date || new Date().toISOString().split('T')[0],
        userId: userId,
      };

      const updated = await ApiService.updateExpense(userId, expense.id, expenseDto);
      console.log("✅ Expense updated:", updated);

      // Update in local state
      setExpenses(prev =>
          prev.map(exp =>
              exp.id === expense.id
                  ? {
                    id: updated.id!,
                    amount: updated.amount,
                    category: expense.category,
                    categoryId: updated.categoryId,
                    note: updated.note,
                    type: expense.type,
                    date: updated.date,
                    userId: updated.userId,
                  }
                  : exp
          )
      );

      console.log("✅ Expense updated in context state");
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  // 🔥 NEW: Delete Expense
  const deleteExpense = async (expenseId: number) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }

      console.log("=== DELETING EXPENSE:", expenseId, "FOR USER:", userId, "===");

      await ApiService.deleteExpense(userId, expenseId);
      console.log("✅ Expense deleted from backend");

      // Remove from local state
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      console.log("✅ Expense removed from context state");
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  return (
      <ExpenseContext.Provider value={{
        expenses,
        addExpense,
        updateExpense,  // 🔥 NEW
        deleteExpense,  // 🔥 NEW
        loading,
        refreshExpenses
      }}>
        {children}
      </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);

export default ExpenseProvider;