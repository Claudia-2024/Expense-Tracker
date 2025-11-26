// services/api.ts
// REPLACE ENTIRE FILE

import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const BASE_URL = 'http://192.168.8.189:8080/api';

export interface AuthRequest {
    email: string;
    password: string;
    defaultCategoryIds?: number[];
}

export interface AuthResponse {
    userId: number;
    email: string;
    defaultCurrency: string;
    hasCompletedOnboarding: boolean;
    token: string;
}

export interface CategoryDto {
    id: number;
    name: string;
    color: string;
    icon?: string;
    isDefault: boolean;
}

export interface ExpenseDto {
    id?: number;
    amount: number;
    currency?: string;
    note?: string;
    date?: string;
    categoryId: number;
    userId?: number;
}

class ApiService {
    private async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('token');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    private async setToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem('token', token);
            console.log('✅ Token saved successfully');
        } catch (error) {
            console.error('Error setting token:', error);
        }
    }

    private async removeToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userEmail');
            console.log('✅ Auth data cleared');
        } catch (error) {
            console.error('Error removing token:', error);
        }
    }

    async register(data: AuthRequest): Promise<AuthResponse> {
        try {
            console.log('📤 Registering user:', data.email);
            console.log('📤 Selected categories:', data.defaultCategoryIds);

            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('❌ Registration failed:', error);
                throw new Error(error || 'Registration failed');
            }

            const result: AuthResponse = await response.json();
            console.log('✅ Registration successful, User ID:', result.userId);

            await this.setToken(result.token);
            await AsyncStorage.setItem('userId', result.userId.toString());
            await AsyncStorage.setItem('userEmail', result.email);

            return result;
        } catch (error) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('📤 Logging in:', email);

            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('❌ Login failed:', error);
                throw new Error(error || 'Login failed');
            }

            const result: AuthResponse = await response.json();
            console.log('✅ Login successful, User ID:', result.userId);

            await this.setToken(result.token);
            await AsyncStorage.setItem('userId', result.userId.toString());
            await AsyncStorage.setItem('userEmail', result.email);

            return result;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    async logout(userId: number): Promise<void> {
        try {
            const token = await this.getToken();
            if (token) {
                await fetch(`${BASE_URL}/auth/logout?userId=${userId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }

            await this.removeToken();
            console.log('✅ Logged out successfully');
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }

    async getDefaultCategories(): Promise<CategoryDto[]> {
        try {
            console.log('📤 Fetching default categories...');

            const response = await fetch(`${BASE_URL}/categories/defaults`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Failed to fetch categories:', response.status, errorText);
                throw new Error(`Failed to fetch categories: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Default categories loaded:', data.length);
            return data;
        } catch (error: any) {
            console.error('❌ Error fetching categories:', error.message || error);
            throw error;
        }
    }

    async getUserCategories(userId: number): Promise<CategoryDto[]> {
        try {
            const token = await this.getToken();

            if (!token) {
                console.log('⚠️ No auth token found, skipping user categories');
                return [];
            }

            console.log('📤 Fetching user categories for user:', userId);
            console.log('🔑 Using token:', token.substring(0, 20) + '...');

            const response = await fetch(`${BASE_URL}/categories/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ User categories fetch failed:', response.status);
                console.error('❌ Error response:', errorText);

                // If 403, token is invalid - clear it
                if (response.status === 403 || response.status === 401) {
                    console.log('🔄 Token invalid, clearing auth data');
                    await this.removeToken();
                }

                throw new Error(`Failed to fetch user categories: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ User categories loaded:', data.length);
            return data;
        } catch (error: any) {
            console.error('❌ Error fetching user categories:', error.message || error);
            // Don't throw - just return empty array so app can continue
            return [];
        }
    }

    async createCategory(userId: number, category: { name: string; color: string; icon?: string }): Promise<CategoryDto> {
        try {
            const token = await this.getToken();

            if (!token) {
                throw new Error('Not authenticated');
            }

            console.log('📤 Creating category:', category.name);

            const response = await fetch(`${BASE_URL}/categories/user/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(category),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('❌ Create category failed:', error);
                throw new Error(error || 'Failed to create category');
            }

            const result = await response.json();
            console.log('✅ Category created:', result.id);
            return result;
        } catch (error) {
            console.error('❌ Error creating category:', error);
            throw error;
        }
    }

    async updateCategory(userId: number, categoryId: number, category: { name: string; color: string; icon?: string }): Promise<CategoryDto> {
        try {
            const token = await this.getToken();

            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${BASE_URL}/categories/user/${userId}/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(category),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to update category');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    async deleteCategory(userId: number, categoryId: number): Promise<void> {
        try {
            const token = await this.getToken();

            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${BASE_URL}/categories/user/${userId}/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    async createExpense(userId: number, expense: ExpenseDto): Promise<ExpenseDto> {
        try {
            const token = await this.getToken();

            if (!token) {
                throw new Error('Not authenticated');
            }

            console.log('📤 Creating expense:', expense.amount, 'XAF');

            const response = await fetch(`${BASE_URL}/expenses/user/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(expense),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('❌ Create expense failed:', error);
                throw new Error(error || 'Failed to create expense');
            }

            const result = await response.json();
            console.log('✅ Expense created:', result.id);
            return result;
        } catch (error) {
            console.error('❌ Error creating expense:', error);
            throw error;
        }
    }

    async getUserExpenses(userId: number): Promise<ExpenseDto[]> {
        try {
            const token = await this.getToken();

            if (!token) {
                console.log('⚠️ No auth token found, skipping expenses');
                return [];
            }

            console.log('📤 Fetching expenses for user:', userId);

            const response = await fetch(`${BASE_URL}/expenses/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Expense fetch failed:', response.status, errorText);

                // If 403, token is invalid
                if (response.status === 403 || response.status === 401) {
                    await this.removeToken();
                }

                throw new Error(`Failed to fetch expenses: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Expenses loaded:', data.length);
            return data;
        } catch (error: any) {
            console.error('❌ Error fetching expenses:', error.message || error);
            return [];
        }
    }

    async getCategoryTotal(categoryId: number): Promise<number> {
        try {
            const token = await this.getToken();

            if (!token) {
                return 0;
            }

            const response = await fetch(`${BASE_URL}/expenses/category/${categoryId}/total`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch category total');
                return 0;
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching category total:', error);
            return 0;
        }
    }
}

export default new ApiService();