// services/database/ExpenseService.ts - MODIFIED with validation
import { getDatabase } from './schema';

export interface ExpenseDto {
    id?: number;
    amount: number;
    currency?: string;
    note?: string;
    date?: string;
    categoryId: number;
    userId?: number;
}

class ExpenseService {
    // Get all expenses for user
    async getUserExpenses(userId: number): Promise<ExpenseDto[]> {
        try {
            const db = await getDatabase();

            const rows = await db.getAllAsync<{
                id: number;
                amount: number;
                currency: string;
                note: string | null;
                date: string;
                category_id: number;
                user_id: number;
            }>(
                'SELECT id, amount, currency, note, date, category_id, user_id FROM expenses WHERE user_id = ? ORDER BY id DESC',
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
            console.error('❌ Get expenses error:', error);
            throw error;
        }
    }

    // Create expense - 🔥 MODIFIED with validation
    async createExpense(userId: number, data: ExpenseDto): Promise<ExpenseDto> {
        try {
            const db = await getDatabase();

            // Verify category belongs to user
            const category = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                [data.categoryId, userId]
            );

            if (!category) {
                throw new Error('Category not found or does not belong to user');
            }

            // 🔥 VALIDATION: Check if adding this expense exceeds overall income
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

            // Get total current expenses
            const totalExpensesResult = await db.getFirstAsync<{ total: number }>(
                'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?',
                [userId]
            );
            const currentTotalExpenses = totalExpensesResult?.total || 0;
            const newTotalExpenses = currentTotalExpenses + data.amount;

            // Check if new total would exceed overall income
            if (newTotalExpenses > user.monthly_budget) {
                const excessAmount = newTotalExpenses - user.monthly_budget;
                const maxAllowed = user.monthly_budget - currentTotalExpenses;

                throw new Error(
                    `Adding this expense would exceed your overall income by ${excessAmount.toFixed(2)}.\n\nYour overall income: ${user.monthly_budget.toFixed(2)}\nCurrent expenses: ${currentTotalExpenses.toFixed(2)}\nMaximum you can add: ${maxAllowed.toFixed(2)}\n\nPlease either reduce the expense or update your overall income first.`
                );
            }

            const currency = data.currency || user.default_currency;
            const date = data.date || new Date().toISOString().split('T')[0];

            // Insert expense
            const result = await db.runAsync(
                'INSERT INTO expenses (amount, currency, note, date, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
                [data.amount, currency, data.note || null, date, userId, data.categoryId]
            );

            return {
                id: result.lastInsertRowId,
                amount: data.amount,
                currency,
                note: data.note,
                date,
                categoryId: data.categoryId,
                userId
            };
        } catch (error: any) {
            console.error('❌ Create expense error:', error);
            throw error;
        }
    }

    // Update expense - 🔥 MODIFIED with validation
    async updateExpense(
        userId: number,
        expenseId: number,
        data: ExpenseDto
    ): Promise<ExpenseDto> {
        try {
            const db = await getDatabase();

            // Verify expense belongs to user
            const expense = await db.getFirstAsync<{
                id: number;
                amount: number;
            }>(
                'SELECT id, amount FROM expenses WHERE id = ? AND user_id = ?',
                [expenseId, userId]
            );

            if (!expense) {
                throw new Error('Expense not found or does not belong to user');
            }

            // Verify category belongs to user (if changing)
            if (data.categoryId) {
                const category = await db.getFirstAsync<{ id: number }>(
                    'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                    [data.categoryId, userId]
                );

                if (!category) {
                    throw new Error('Category not found or does not belong to user');
                }
            }

            // 🔥 VALIDATION: Check if updating this expense exceeds overall income
            const user = await db.getFirstAsync<{ monthly_budget: number }>(
                'SELECT monthly_budget FROM users WHERE id = ?',
                [userId]
            );

            if (!user) {
                throw new Error('User not found');
            }

            // Get total expenses excluding this one
            const totalExpensesResult = await db.getFirstAsync<{ total: number }>(
                'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND id != ?',
                [userId, expenseId]
            );
            const otherExpenses = totalExpensesResult?.total || 0;
            const newTotalExpenses = otherExpenses + data.amount;

            // Check if new total would exceed overall income
            if (newTotalExpenses > user.monthly_budget) {
                const excessAmount = newTotalExpenses - user.monthly_budget;
                const maxAllowed = user.monthly_budget - otherExpenses;

                throw new Error(
                    `Updating this expense would exceed your overall income by ${excessAmount.toFixed(2)}.\n\nYour overall income: ${user.monthly_budget.toFixed(2)}\nOther expenses: ${otherExpenses.toFixed(2)}\nMaximum you can set: ${maxAllowed.toFixed(2)}\n\nPlease either reduce the expense or update your overall income first.`
                );
            }

            // Update expense
            await db.runAsync(
                'UPDATE expenses SET amount = ?, currency = ?, note = ?, date = ?, category_id = ? WHERE id = ? AND user_id = ?',
                [
                    data.amount,
                    data.currency || 'XAF',
                    data.note || null,
                    data.date || new Date().toISOString().split('T')[0],
                    data.categoryId,
                    expenseId,
                    userId
                ]
            );

            return {
                id: expenseId,
                amount: data.amount,
                currency: data.currency,
                note: data.note,
                date: data.date,
                categoryId: data.categoryId,
                userId
            };
        } catch (error: any) {
            console.error('❌ Update expense error:', error);
            throw error;
        }
    }

    // Delete expense
    async deleteExpense(userId: number, expenseId: number): Promise<void> {
        try {
            const db = await getDatabase();

            // Verify and delete
            const result = await db.runAsync(
                'DELETE FROM expenses WHERE id = ? AND user_id = ?',
                [expenseId, userId]
            );

            if (result.changes === 0) {
                throw new Error('Expense not found or does not belong to user');
            }

            console.log('✅ Expense deleted:', expenseId);
        } catch (error: any) {
            console.error('❌ Delete expense error:', error);
            throw error;
        }
    }

    // Get category total
    async getCategoryTotal(userId: number, categoryId: number): Promise<number> {
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

            const result = await db.getFirstAsync<{ total: number }>(
                'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE category_id = ? AND user_id = ?',
                [categoryId, userId]
            );

            return result?.total || 0;
        } catch (error: any) {
            console.error('❌ Get category total error:', error);
            throw error;
        }
    }
}

export default new ExpenseService();