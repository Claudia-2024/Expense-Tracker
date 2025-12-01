// app/context/incomeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService, { IncomeDto } from "../../services/api";

export type Income = {
    id: number;
    amount: number;
    note?: string;
    categoryId?: number | null;
    date?: string;
    currency?: string;
};

type IncomeContextType = {
    incomes: Income[];
    loading: boolean;
    refreshIncomes: () => Promise<void>;
    addIncome: (income: Income) => Promise<void>;
};

const IncomeContext = createContext<IncomeContextType>({
    incomes: [],
    loading: true,
    refreshIncomes: async () => {},
    addIncome: async () => {},
});

export const IncomeProvider = ({ children }: { children: React.ReactNode }) => {
    const [incomes, setIncomes] = useState<Income[]>([]);
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

    const refreshIncomes = async () => {
        try {
            const userId = await getUserId();
            if (!userId) {
                console.log('No user logged in, skipping income fetch');
                setLoading(false);
                return;
            }

            console.log("=== REFRESHING INCOMES ===");
            const backendIncomes = await ApiService.getUserIncomes(userId);
            console.log("Fetched incomes from backend:", backendIncomes);

            const mappedIncomes: Income[] = backendIncomes.map(inc => ({
                id: inc.id!,
                amount: inc.amount,
                note: inc.note,
                categoryId: inc.categoryId,
                date: inc.date,
                currency: inc.currency,
            }));

            console.log("Mapped incomes:", mappedIncomes);
            setIncomes(mappedIncomes);
        } catch (error: any) {
            console.error('Error refreshing incomes:', error);
            if (error.message?.includes('Failed to fetch')) {
                console.log('Unable to fetch incomes from backend, using empty state');
                setIncomes([]);
            }
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                await refreshIncomes();
            } catch (e) {
                console.log("Error loading incomes:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const addIncome = async (income: Income) => {
        try {
            const userId = await getUserId();
            if (!userId) {
                throw new Error('User not logged in');
            }

            console.log("=== ADDING INCOME VIA CONTEXT ===");
            console.log("Income data:", income);

            const incomeDto: IncomeDto = {
                amount: income.amount,
                note: income.note,
                categoryId: income.categoryId,
                date: income.date || new Date().toISOString().split('T')[0],
                currency: income.currency,
            };

            console.log("Sending to API:", incomeDto);

            const created = await ApiService.addOrUpdateIncome(userId, incomeDto);
            console.log("✅ Income created:", created);

            const newIncome: Income = {
                id: created.id!,
                amount: created.amount,
                note: created.note,
                categoryId: created.categoryId,
                date: created.date,
                currency: created.currency,
            };

            setIncomes(prev => [...prev, newIncome]);
            console.log("✅ Income added to context state");
        } catch (error) {
            console.error('❌ Error adding income:', error);
            throw error;
        }
    };

    return (
        <IncomeContext.Provider value={{ incomes, loading, refreshIncomes, addIncome }}>
            {children}
        </IncomeContext.Provider>
    );
};

export const useIncomeContext = () => useContext(IncomeContext);