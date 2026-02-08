

import { getDatabase } from './schema';

export interface CategoryDto {
    id?: number;
    name: string;
    color: string;
    icon: string;
    isDefault: boolean;
}

class CategoryService {
    // Get default categories (system templates)
    async getDefaultCategories(): Promise<CategoryDto[]> {
        try {
            const db = await getDatabase(); // This now auto-initializes

            const rows = await db.getAllAsync<{
                id: number;
                name: string;
                color: string;
                icon: string;
                is_default: number;
            }>(
                'SELECT id, name, color, icon, is_default FROM categories WHERE is_default = 1 AND user_id IS NULL ORDER BY name'
            );

            return rows.map(row => ({
                id: row.id,
                name: row.name,
                color: row.color,
                icon: row.icon,
                isDefault: row.is_default === 1
            }));
        } catch (error: any) {
            console.error('❌ Get default categories error:', error);
            throw error;
        }
    }

    // Get user's categories (both chosen defaults and custom)
    async getUserCategories(userId: number): Promise<CategoryDto[]> {
        try {
            const db = await getDatabase();

            const rows = await db.getAllAsync<{
                id: number;
                name: string;
                color: string;
                icon: string;
                is_default: number;
            }>(
                'SELECT id, name, color, icon, is_default FROM categories WHERE user_id = ? ORDER BY name',
                [userId]
            );

            return rows.map(row => ({
                id: row.id,
                name: row.name,
                color: row.color,
                icon: row.icon,
                isDefault: row.is_default === 1
            }));
        } catch (error: any) {
            console.error('❌ Get user categories error:', error);
            throw error;
        }
    }

    // Create custom category
    async createCategory(userId: number, data: Partial<CategoryDto>): Promise<CategoryDto> {
        try {
            const db = await getDatabase();

            // Check for duplicate name within user's categories
            const existing = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM categories WHERE user_id = ? AND LOWER(name) = LOWER(?)',
                [userId, data.name || '']
            );

            if (existing) {
                throw new Error('You already have a category with that name');
            }

            // Insert new category
            const result = await db.runAsync(
                'INSERT INTO categories (name, color, icon, is_default, user_id) VALUES (?, ?, ?, 0, ?)',
                [data.name || '', data.color || '#348DDB', data.icon || 'pricetag-outline', userId]
            );

            return {
                id: result.lastInsertRowId,
                name: data.name || '',
                color: data.color || '#348DDB',
                icon: data.icon || 'pricetag-outline',
                isDefault: false
            };
        } catch (error: any) {
            console.error('❌ Create category error:', error);
            throw error;
        }
    }

    // Update category
    async updateCategory(
        userId: number,
        categoryId: number,
        data: Partial<CategoryDto>
    ): Promise<CategoryDto> {
        try {
            const db = await getDatabase();

            // Verify category belongs to user
            const category = await db.getFirstAsync<{
                id: number;
                name: string;
                is_default: number;
            }>(
                'SELECT id, name, is_default FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId]
            );

            if (!category) {
                throw new Error('Category not found or does not belong to user');
            }

            // Check for duplicate name (excluding current category)
            if (data.name && data.name !== category.name) {
                const duplicate = await db.getFirstAsync<{ id: number }>(
                    'SELECT id FROM categories WHERE user_id = ? AND LOWER(name) = LOWER(?) AND id != ?',
                    [userId, data.name, categoryId]
                );

                if (duplicate) {
                    throw new Error('You already have a category with that name');
                }
            }

            // Update category
            const setClauses: string[] = [];
            const values: any[] = [];

            if (data.name !== undefined) {
                setClauses.push('name = ?');
                values.push(data.name);
            }
            if (data.color !== undefined) {
                setClauses.push('color = ?');
                values.push(data.color);
            }
            if (data.icon !== undefined) {
                setClauses.push('icon = ?');
                values.push(data.icon);
            }

            if (setClauses.length > 0) {
                values.push(categoryId, userId);
                await db.runAsync(
                    `UPDATE categories SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`,
                    values
                );
            }

            // Fetch updated category
            const updated = await db.getFirstAsync<{
                id: number;
                name: string;
                color: string;
                icon: string;
                is_default: number;
            }>(
                'SELECT id, name, color, icon, is_default FROM categories WHERE id = ?',
                [categoryId]
            );

            if (!updated) {
                throw new Error('Category not found after update');
            }

            return {
                id: updated.id,
                name: updated.name,
                color: updated.color,
                icon: updated.icon,
                isDefault: updated.is_default === 1
            };
        } catch (error: any) {
            console.error('❌ Update category error:', error);
            throw error;
        }
    }

    // Delete category (only non-default)
    async deleteCategory(userId: number, categoryId: number): Promise<void> {
        try {
            const db = await getDatabase();

            // Verify category belongs to user and is not default
            const category = await db.getFirstAsync<{
                id: number;
                is_default: number;
            }>(
                'SELECT id, is_default FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId]
            );

            if (!category) {
                throw new Error('Category not found or does not belong to user');
            }

            if (category.is_default === 1) {
                throw new Error('Cannot delete default categories');
            }

            // Delete category (cascades to expenses, incomes, budgets)
            await db.runAsync(
                'DELETE FROM categories WHERE id = ? AND user_id = ?',
                [categoryId, userId]
            );

            console.log('✅ Category deleted:', categoryId);
        } catch (error: any) {
            console.error('❌ Delete category error:', error);
            throw error;
        }
    }
}

export default new CategoryService();