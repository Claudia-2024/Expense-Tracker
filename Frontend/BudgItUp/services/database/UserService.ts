
import { getDatabase } from './schema';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserDto {
    id?: number;
    email: string;
    name: string;
    phone?: string;
    defaultCurrency: string;
    monthlyBudget?: number;
}

export interface AuthResponse {
    userId: number;
    email: string;
    defaultCurrency: string;
    hasCompletedOnboarding: boolean;
    token: string;
}

export interface DashboardStatsDto {
    totalIncome: number;
    totalExpenses: number;
    remainingBudget: number;
    allocatedIncome: number;
}

class UserService {
    // Hash password using SHA-256
    private async hashPassword(password: string): Promise<string> {
        return await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password
        );
    }

    // Generate simple token (userId + timestamp)
    private generateToken(userId: number): string {
        const timestamp = Date.now();
        return `${userId}_${timestamp}`;
    }

    // Register new user
    async register(
        email: string,
        password: string,
        name: string,
        phone?: string,
        defaultCategoryIds?: number[]
    ): Promise<AuthResponse> {
        try {
            const db = await getDatabase();

            // Check if email exists
            const existing = await db.getFirstAsync<{ id: number }>(
                'SELECT id FROM users WHERE email = ?',
                [email.toLowerCase()]
            );

            if (existing) {
                throw new Error('Email already registered');
            }

            // Hash password
            const passwordHash = await this.hashPassword(password);

            // Insert user
            const result = await db.runAsync(
                `INSERT INTO users (email, password_hash, name, phone, default_currency, has_completed_onboarding) 
         VALUES (?, ?, ?, ?, 'XAF', 1)`,
                [email.toLowerCase(), passwordHash, name, phone || null]
            );

            const userId = result.lastInsertRowId;

            // Copy selected default categories to user
            if (defaultCategoryIds && defaultCategoryIds.length > 0) {
                for (const catId of defaultCategoryIds) {
                    const defaultCat = await db.getFirstAsync<{
                        name: string;
                        color: string;
                        icon: string;
                    }>(
                        'SELECT name, color, icon FROM categories WHERE id = ? AND is_default = 1 AND user_id IS NULL',
                        [catId]
                    );

                    if (defaultCat) {
                        await db.runAsync(
                            'INSERT INTO categories (name, color, icon, is_default, user_id) VALUES (?, ?, ?, 1, ?)',
                            [defaultCat.name, defaultCat.color, defaultCat.icon, userId]
                        );
                    }
                }
            }

            // Generate token
            const token = this.generateToken(userId);

            // Store session
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userId', userId.toString());
            await AsyncStorage.setItem('userEmail', email.toLowerCase());

            return {
                userId,
                email: email.toLowerCase(),
                defaultCurrency: 'XAF',
                hasCompletedOnboarding: true,
                token
            };
        } catch (error: any) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    }

    // Login user
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const db = await getDatabase();

            // Find user
            const user = await db.getFirstAsync<{
                id: number;
                email: string;
                password_hash: string;
                default_currency: string;
                has_completed_onboarding: number;
            }>(
                'SELECT id, email, password_hash, default_currency, has_completed_onboarding FROM users WHERE email = ?',
                [email.toLowerCase()]
            );

            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Verify password
            const passwordHash = await this.hashPassword(password);
            if (passwordHash !== user.password_hash) {
                throw new Error('Invalid credentials');
            }

            // Generate token
            const token = this.generateToken(user.id);

            // Store session
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userId', user.id.toString());
            await AsyncStorage.setItem('userEmail', user.email);

            return {
                userId: user.id,
                email: user.email,
                defaultCurrency: user.default_currency,
                hasCompletedOnboarding: user.has_completed_onboarding === 1,
                token
            };
        } catch (error: any) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    // Logout user
    async logout(userId: number): Promise<void> {
        try {
            // Clear session
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userEmail');

            console.log('✅ User logged out');
        } catch (error) {
            console.error('❌ Logout error:', error);
            throw error;
        }
    }

    // Get user profile
    async getUserProfile(userId: number): Promise<UserDto> {
        try {
            const db = await getDatabase();

            const user = await db.getFirstAsync<{
                id: number;
                email: string;
                name: string;
                phone: string | null;
                default_currency: string;
                monthly_budget: number;
            }>(
                'SELECT id, email, name, phone, default_currency, monthly_budget FROM users WHERE id = ?',
                [userId]
            );

            if (!user) {
                throw new Error('User not found');
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone || undefined,
                defaultCurrency: user.default_currency,
                monthlyBudget: user.monthly_budget
            };
        } catch (error: any) {
            console.error('❌ Get profile error:', error);
            throw error;
        }
    }

    // Update user profile
    async updateUserProfile(
        userId: number,
        updates: Partial<UserDto>
    ): Promise<UserDto> {
        try {
            const db = await getDatabase();

            const setClauses: string[] = [];
            const values: any[] = [];

            if (updates.name !== undefined) {
                setClauses.push('name = ?');
                values.push(updates.name);
            }
            if (updates.phone !== undefined) {
                setClauses.push('phone = ?');
                values.push(updates.phone || null);
            }
            if (updates.defaultCurrency !== undefined) {
                setClauses.push('default_currency = ?');
                values.push(updates.defaultCurrency);
            }

            if (setClauses.length > 0) {
                values.push(userId);
                await db.runAsync(
                    `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
                    values
                );
            }

            return await this.getUserProfile(userId);
        } catch (error: any) {
            console.error('❌ Update profile error:', error);
            throw error;
        }
    }

    // Get dashboard statistics
    async getDashboardStats(userId: number): Promise<DashboardStatsDto> {
        try {
            const db = await getDatabase();

            // Get total income (monthly budget)
            const userResult = await db.getFirstAsync<{ monthly_budget: number }>(
                'SELECT monthly_budget FROM users WHERE id = ?',
                [userId]
            );
            const totalIncome = userResult?.monthly_budget || 0;

            // Get total expenses
            const expenseResult = await db.getFirstAsync<{ total: number }>(
                'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?',
                [userId]
            );
            const totalExpenses = expenseResult?.total || 0;

            // Get allocated income (sum of category-specific incomes)
            const incomeResult = await db.getFirstAsync<{ total: number }>(
                'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE user_id = ? AND category_id IS NOT NULL',
                [userId]
            );
            const allocatedIncome = incomeResult?.total || 0;

            const remainingBudget = totalIncome - totalExpenses;

            return {
                totalIncome,
                totalExpenses,
                remainingBudget,
                allocatedIncome
            };
        } catch (error: any) {
            console.error('❌ Get stats error:', error);
            throw error;
        }
    }
}

export default new UserService();