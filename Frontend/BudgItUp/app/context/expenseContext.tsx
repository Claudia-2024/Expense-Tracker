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

export const ExpenseProvider = ({ children }: { children: React.ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses from AsyncStorage
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("expenses");
        if (saved) setExpenses(JSON.parse(saved));
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
