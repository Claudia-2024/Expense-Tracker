// app/context/incomeContext.tsx
// 🔥 FIXED VERSION - Ensures proper user isolation for all income operations
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
    userId: number; // 🔥 ADDED: Track which user owns this income
};

type IncomeContextType = {
    incomes: Income[];
    loading: boolean;
    refreshIncomes: () => Promise<void>;
    addIncome: (income: Omit<Income, 'id' | 'userId'>) => Promise<void>;
    updateIncome: (incomeId: number, income: Partial<Income>) => Promise<void>;
    deleteIncome: (incomeId: number) => Promise<void>;
};

const IncomeContext = createContext<IncomeContextType>({
    incomes: [],
    loading: true,
    refreshIncomes: async () => {},
    addIncome: async () => {},
    updateIncome: async () => {},
    deleteIncome: async () => {},
});

export const IncomeProvider = ({ children }: { children: React.ReactNode }) => {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const getUserId = async (): Promise<number | null> => {
        try {
            const id = await AsyncStorage.getItem('userId');
            const parsedId = id ? parseInt(id) : null;
            setCurrentUserId(parsedId);
            return parsedId;
        } catch (e) {
            console.error('Error getting userId:', e);
            return null;
        }
    };

    const refreshIncomes = async () => {
        try {
            const userId = await getUserId();
            if (!userId) {
                console.log('⚠️ No user logged in, clearing incomes');
                setIncomes([]);
                setLoading(false);
                return;
            }

            console.log("=== REFRESHING INCOMES FOR USER:", userId, "===");
            const backendIncomes = await ApiService.getUserIncomes(userId);
            console.log("✅ Fetched incomes from backend:", backendIncomes.length);

            // 🔥 CRITICAL: Filter incomes to ensure they belong to current user
            // This is a safety check even though backend should only return user's incomes
            const userIncomes = backendIncomes.filter(inc => inc.userId === userId);

            if (userIncomes.length !== backendIncomes.length) {
                console.error('⚠️ WARNING: Backend returned incomes for other users!');
                console.error(`Expected ${backendIncomes.length}, got ${userIncomes.length} after filtering`);
            }

            const mappedIncomes: Income[] = userIncomes.map(inc => ({
                id: inc.id!,
                amount: inc.amount,
                note: inc.note,
                categoryId: inc.categoryId,
                date: inc.date,
                currency: inc.currency,
                userId: inc.userId, // 🔥 ADDED: Store userId
            }));

            console.log("✅ Mapped incomes for user", userId, ":", mappedIncomes.length);
            setIncomes(mappedIncomes);
        } catch (error: any) {
            console.error('❌ Error refreshing incomes:', error);
            if (error.message?.includes('Failed to fetch') || error.message?.includes('401')) {
                console.log('⚠️ Unable to fetch incomes (auth issue), clearing state');
                setIncomes([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Clear incomes when user logs out
    useEffect(() => {
        const checkUser = async () => {
            const userId = await getUserId();
            if (!userId && incomes.length > 0) {
                console.log('⚠️ User logged out, clearing incomes');
                setIncomes([]);
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                await refreshIncomes();
            } catch (e) {
                console.log("❌ Error loading incomes:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const addIncome = async (income: Omit<Income, 'id' | 'userId'>) => {
        try {
            const userId = await getUserId();
            if (!userId) {
                throw new Error('User not logged in');
            }

            console.log("=== ADDING INCOME FOR USER:", userId, "===");
            console.log("Income data:", income);

            const incomeDto: IncomeDto = {
                amount: income.amount,
                note: income.note,
                categoryId: income.categoryId,
                date: income.date || new Date().toISOString().split('T')[0],
                currency: income.currency,
                userId: userId, // 🔥 CRITICAL: Always include userId
            };

            console.log("📤 Sending to API:", incomeDto);

            const created = await ApiService.addOrUpdateIncome(userId, incomeDto);
            console.log("✅ Income created:", created);

            // 🔥 SECURITY CHECK: Verify returned income belongs to current user
            if (created.userId !== userId) {
                console.error('⚠️ SECURITY ERROR: Backend returned income for different user!');
                throw new Error('Security violation: Income does not belong to current user');
            }

            const newIncome: Income = {
                id: created.id!,
                amount: created.amount,
                note: created.note,
                categoryId: created.categoryId,
                date: created.date,
                currency: created.currency,
                userId: created.userId,
            };

            setIncomes(prev => [...prev, newIncome]);
            console.log("✅ Income added to context state");
        } catch (error) {
            console.error('❌ Error adding income:', error);
            throw error;
        }
    };

    const updateIncome = async (incomeId: number, updates: Partial<Income>) => {
        try {
            const userId = await getUserId();
            if (!userId) {
                throw new Error('User not logged in');
            }

            console.log("=== UPDATING INCOME", incomeId, "FOR USER:", userId, "===");

            // 🔥 SECURITY CHECK: Verify income belongs to current user before updating
            const existingIncome = incomes.find(inc => inc.id === incomeId);
            if (!existingIncome) {
                throw new Error('Income not found');
            }
            if (existingIncome.userId !== userId) {
                console.error('⚠️ SECURITY ERROR: Attempted to update income belonging to another user');
                throw new Error('You cannot modify another user\'s income');
            }

            const incomeDto: IncomeDto = {
                amount: updates.amount ?? existingIncome.amount,
                note: updates.note ?? existingIncome.note,
                categoryId: updates.categoryId ?? existingIncome.categoryId,
                date: updates.date ?? existingIncome.date,
                currency: updates.currency ?? existingIncome.currency,
                userId: userId,
            };

            const updated = await ApiService.addOrUpdateIncome(userId, incomeDto);

            // 🔥 SECURITY CHECK: Verify returned income belongs to current user
            if (updated.userId !== userId) {
                console.error('⚠️ SECURITY ERROR: Backend returned income for different user!');
                throw new Error('Security violation: Income does not belong to current user');
            }

            setIncomes(prev => prev.map(inc =>
                inc.id === incomeId
                    ? { ...inc, ...updates, userId: userId }
                    : inc
            ));
            console.log("✅ Income updated in context state");
        } catch (error) {
            console.error('❌ Error updating income:', error);
            throw error;
        }
    };

    const deleteIncome = async (incomeId: number) => {
        try {
            const userId = await getUserId();
            if (!userId) {
                throw new Error('User not logged in');
            }

            console.log("=== DELETING INCOME", incomeId, "FOR USER:", userId, "===");

            // 🔥 SECURITY CHECK: Verify income belongs to current user before deleting
            const existingIncome = incomes.find(inc => inc.id === incomeId);
            if (!existingIncome) {
                throw new Error('Income not found');
            }
            if (existingIncome.userId !== userId) {
                console.error('⚠️ SECURITY ERROR: Attempted to delete income belonging to another user');
                throw new Error('You cannot delete another user\'s income');
            }

            await ApiService.deleteIncome(userId, incomeId);

            setIncomes(prev => prev.filter(inc => inc.id !== incomeId));
            console.log("✅ Income deleted from context state");
        } catch (error) {
            console.error('❌ Error deleting income:', error);
            throw error;
        }
    };

    return (
        <IncomeContext.Provider
            value={{
                incomes,
                loading,
                refreshIncomes,
                addIncome,
                updateIncome,
                deleteIncome
            }}
        >
            {children}
        </IncomeContext.Provider>
    );
};

export const useIncomeContext = () => useContext(IncomeContext);

export default IncomeProvider;