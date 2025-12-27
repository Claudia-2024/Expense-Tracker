// services/database/IncomeService.ts
// Offline Income Management Service

import { getDatabase } from './schema';

export interface IncomeDto {
    id?: number;
    amount: number;
    currency?: string;
    note?: string;
    date?: string;
    categoryId?: number | null;
    userId: number;
}

class IncomeService {
    // Get all incomes for user
    async getUserIncomes(userId: number): Promise<IncomeDto[]> {
        try {
            const db = await getDatabase();

            const rows = await db.getAllAsync<{
                id: number;
                amount: number;
                currency: string;
                note: string | null;
                date: string;
                category_id: number | null;
                user_id: number;
            }>(
                'SELECT id, amount, currency, note, date, category_id, user_id FROM incomes WHERE user_id = ? ORDER BY id DESC',
                [userId]
            );

            return rows.map(row => ({
                id: row.id,
                amount: row.amount,
                currency: row.currency,
                note: row.note || undefined,
                date: row.date,
                categoryId: row.category_id,
                userId: row.user_id
            }));
        } catch (error: any) {
            console.error('❌ Get incomes error:', error);
            throw error;
        }
    }

    // Add or update income
    async addOrUpdateIncome(userId: number, data: IncomeDto): Promise<IncomeDto> {
        try {
            const db = await getDatabase();

            // Get user's default currency
            const user = await db.getFirstAsync<{
                default_currency: string;
                monthly_budget: number;
            }>(
                'SELECT default_currency, monthly_budget FROM users WHERE id = ?',
                [userId]
            );

            if (!user) {
                throw new Error('User not found');
            }

            const currency = data.currency || user.default_currency;
            const date = data.date || new Date().toISOString().split('T')[0];

            // CASE 1: Overall budget (no category)
            if (!data.categoryId) {
                // Update user's monthly budget
                await db.runAsync(
                    'UPDATE users SET monthly_budget = ? WHERE id = ?',
                    [data.amount, userId]
                );

                // Check if overall income record exists
                const existing = await db.getFirstAsync<{ id: number }>(
                    'SELECT id FROM incomes WHERE user_id = ? AND category_id IS NULL',
                    [userId]
                );

                if (existing) {
                    // Update existing
                    await db.runAsync(
                        'UPDATE incomes SET amount = ?, note = ?, date = ? WHERE id = ?',
                        [data.amount, data.note || 'Overall Monthly Budget', date, existing.id]
                    );

                    return {
                        id: existing.id,
                        amount: data.amount,
                        currency,
                        note: data.note || 'Overall Monthly Budget',
                        date,
                        categoryId: null,
                        userId
                    };
                } else {
                    // Create new
                    const result = await db.runAsync(
                        'INSERT INTO incomes (amount, currency, note, date, user_id, category_id) VALUES (?, ?, ?, ?, ?, NULL)',
                        [data.amount, currency, data.note || 'Overall Monthly Budget', date, userId]
                    );

                    return {
                        id: result.lastInsertRowId,
                        amount: data.amount,
                        currency,
                        note: data.note || 'Overall Monthly Budget',
                        date,
                        categoryId: null,
                        userId
                    };
                }
            }

            // CASE 2: Category-specific income
            // Verify category belongs to user
            const category = await db.getFirstAsync<{ id: number; name: string }>(
                'SELECT id, name FROM categories WHERE id = ? AND user_id = ?',
                [data.categoryId, userId]
            );

            if (!category) {
                throw new Error('Category not found or does not belong to user');
            }

            // Check if user has set overall budget
            if (user.monthly_budget === 0) {
                throw new Error('Please set your overall monthly budget first');
            }

            // Calculate currently allocated income
            const allocatedResult = await db.getFirstAsync<{ total: number }>(
                'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE user_id = ? AND category_id IS NOT NULL',
                [userId]
            );
            const currentAllocated = allocatedResult?.total || 0;

            // Check if category already has income
            const existingCat = await db.getFirstAsync<{ id: number; amount: number }>(
                'SELECT id, amount FROM incomes WHERE user_id = ? AND category_id = ?',
                [userId, data.categoryId]
            );

            const previousAmount = existingCat?.amount || 0;
            const newTotal = currentAllocated - previousAmount + data.amount;

            // Validate: cannot exceed overall budget
            if (newTotal > user.monthly_budget) {
                throw new Error(
                    `Cannot allocate. Total allocated (${newTotal.toFixed(2)}) would exceed overall budget (${user.monthly_budget.toFixed(2)})`
                );
            }

            if (existingCat) {
                // Update existing
                await db.runAsync(
                    'UPDATE incomes SET amount = ?, note = ?, date = ? WHERE id = ?',
                    [data.amount, data.note || `Income for ${category.name}`, date, existingCat.id]
                );

                return {
                    id: existingCat.id,
                    amount: data.amount,
                    currency,
                    note: data.note || `Income for ${category.name}`,
                    date,
                    categoryId: data.categoryId,
                    userId
                };
            } else {
                // Create new
                const result = await db.runAsync(
                    'INSERT INTO incomes (amount, currency, note, date, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [data.amount, currency, data.note || `Income for ${category.name}`, date, userId, data.categoryId]
                );

                return {
                    id: result.lastInsertRowId,
                    amount: data.amount,
                    currency,
                    note: data.note || `Income for ${category.name}`,
                    date,
                    categoryId: data.categoryId,
                    userId
                };
            }
        } catch (error: any) {
            console.error('❌ Add/update income error:', error);
            throw error;
        }
    }

    // Get category income
    async getCategoryIncome(userId: number, categoryId: number): Promise<IncomeDto | null> {
        try {
            const db = await getDatabase();

            // Verify category belongs to user
            const category = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId]
            );

            if (!category) {
                throw new Error('Category not found or does not belong to user');
            }

            const income = await db.getFirstAsync<{
                id: number;
                amount: number;
                currency: string;
                note: string | null;
                date: string;
                category_id: number;
                user_id: number;
            }>(
                'SELECT id, amount, currency, note, date, category_id, user_id FROM incomes WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );

            if (!income) {
                return null;
            }

            return {
                id: income.id,
                amount: income.amount,
                currency: income.currency,
                note: income.note || undefined,
                date: income.date,
                categoryId: income.category_id,
                userId: income.user_id
            };
        } catch (error: any) {
            console.error('❌ Get category income error:', error);
            return null;
        }
    }

    // Delete income
    async deleteIncome(userId: number, incomeId: number): Promise<void> {
        try {
            const db = await getDatabase();

            // Get income to check if it's overall budget
            const income = await db.getFirstAsync<{ category_id: number | null }>(
                'SELECT category_id FROM incomes WHERE id = ? AND user_id = ?',
                [incomeId, userId]
            );

            if (!income) {
                throw new Error('Income not found or does not belong to user');
            }

            // If deleting overall budget, reset user's monthly budget
            if (income.category_id === null) {
                await db.runAsync(
                    'UPDATE users SET monthly_budget = 0 WHERE id = ?',
                    [userId]
                );
            }

            // Delete income
            await db.runAsync(
                'DELETE FROM incomes WHERE id = ? AND user_id = ?',
                [incomeId, userId]
            );

            console.log('✅ Income deleted:', incomeId);
        } catch (error: any) {
            console.error('❌ Delete income error:', error);
            throw error;
        }
    }
}

// ============================================
// Budget Service - 🔥 FIXED
// ============================================

export interface BudgetDto {
    id?: number;
    amount: number;
    currency?: string;
    categoryId: number;
    userId?: number;
}

class BudgetService {
    // Get all budgets for user - 🔥 FIXED QUERY
    async getUserBudgets(userId: number): Promise<BudgetDto[]> {
        try {
            const db = await getDatabase();

            // 🔥 FIX: Correct parameter order for getAllAsync
            const rows = await db.getAllAsync<{
                id: number;
                amount: number;
                currency: string;
                category_id: number;
                user_id: number;
            }>(
                'SELECT id, amount, currency, category_id, user_id FROM budgets WHERE user_id = ?',
                [userId] // ✅ Parameters array as second argument
            );

            return rows.map(row => ({
                id: row.id,
                amount: row.amount,
                currency: row.currency,
                categoryId: row.category_id,
                userId: row.user_id
            }));
        } catch (error: any) {
            console.error('❌ Get budgets error:', error);
            throw error;
        }
    }

    // Get category budget
    async getCategoryBudget(userId: number, categoryId: number): Promise<BudgetDto | null> {
        try {
            const db = await getDatabase();

            // Verify category belongs to user
            const category = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId]
            );

            if (!category) {
                return null;
            }

            const budget = await db.getFirstAsync<{
                id: number;
                amount: number;
                currency: string;
                category_id: number;
                user_id: number;
            }>(
                'SELECT id, amount, currency, category_id, user_id FROM budgets WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );

            if (!budget) {
                return null;
            }

            return {
                id: budget.id,
                amount: budget.amount,
                currency: budget.currency,
                categoryId: budget.category_id,
                userId: budget.user_id
            };
        } catch (error: any) {
            console.error('❌ Get category budget error:', error);
            return null;
        }
    }

    // Set category budget
    async setCategoryBudget(
        userId: number,
        categoryId: number,
        amount: number
    ): Promise<BudgetDto> {
        try {
            const db = await getDatabase();

            // Verify category belongs to user
            const category = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId]
            );

            if (!category) {
                throw new Error('Category not found or does not belong to user');
            }

            // Get user's default currency
            const user = await db.getFirstAsync<{ default_currency: string }>(
                'SELECT default_currency FROM users WHERE id = ?',
                [userId]
            );

            const currency = user?.default_currency || 'XAF';

            // Check if budget exists
            const existing = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM budgets WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );

            if (existing) {
                // Update
                await db.runAsync(
                    'UPDATE budgets SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [amount, existing.id]
                );

                return {
                    id: existing.id,
                    amount,
                    currency,
                    categoryId,
                    userId
                };
            } else {
                // Insert
                const result = await db.runAsync(
                    'INSERT INTO budgets (amount, currency, user_id, category_id) VALUES (?, ?, ?, ?)',
                    [amount, currency, userId, categoryId]
                );

                return {
                    id: result.lastInsertRowId,
                    amount,
                    currency,
                    categoryId,
                    userId
                };
            }
        } catch (error: any) {
            console.error('❌ Set budget error:', error);
            throw error;
        }
    }

    // Delete category budget
    async deleteCategoryBudget(userId: number, categoryId: number): Promise<void> {
        try {
            const db = await getDatabase();

            await db.runAsync(
                'DELETE FROM budgets WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
            );

            console.log('✅ Budget deleted for category:', categoryId);
        } catch (error: any) {
            console.error('❌ Delete budget error:', error);
            throw error;
        }
    }
}

export const incomeService = new IncomeService();
export const budgetService = new BudgetService();