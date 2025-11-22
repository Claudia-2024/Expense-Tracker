// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const BASE_URL = 'http://192.168.100.29:8080/api';

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
        } catch (error) {
            console.error('Error setting token:', error);
        }
    }

    private async removeToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem('token');
        } catch (error) {
            console.error('Error removing token:', error);
        }
    }

    async register(data: AuthRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Registration failed');
            }

            const result: AuthResponse = await response.json();
            await this.setToken(result.token);
            await AsyncStorage.setItem('userId', result.userId.toString());
            await AsyncStorage.setItem('userEmail', result.email);
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Login failed');
            }

            const result: AuthResponse = await response.json();
            await this.setToken(result.token);
            await AsyncStorage.setItem('userId', result.userId.toString());
            await AsyncStorage.setItem('userEmail', result.email);
            return result;
        } catch (error) {
            console.error('Login error:', error);
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
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userEmail');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async getDefaultCategories(): Promise<CategoryDto[]> {
        try {
            console.log('Fetching default categories from:', `${BASE_URL}/categories/defaults`);

            const response = await fetch(`${BASE_URL}/categories/defaults`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Default categories response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch categories:', response.status, errorText);
                throw new Error(`Failed to fetch categories: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Default categories fetched:', data.length);
            return data;
        } catch (error: any) {
            console.error('Error fetching categories:', error.message || error);
            throw error;
        }
    }

    async getUserCategories(userId: number): Promise<CategoryDto[]> {
        try {
            const token = await this.getToken();
            if (!token) {
                console.log('No auth token found, user not logged in');
                return [];
            }

            const response = await fetch(`${BASE_URL}/categories/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('User categories fetch failed:', response.status, errorText);
                throw new Error(`Failed to fetch user categories: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Error fetching user categories:', error.message || error);
            throw error;
        }
    }

    async createCategory(userId: number, category: { name: string; color: string; icon?: string }): Promise<CategoryDto> {
        try {
            const token = await this.getToken();
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
                throw new Error(error || 'Failed to create category');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    async updateCategory(userId: number, categoryId: number, category: { name: string; color: string; icon?: string }): Promise<CategoryDto> {
        try {
            const token = await this.getToken();
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
                throw new Error(error || 'Failed to create expense');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    }

    async getUserExpenses(userId: number): Promise<ExpenseDto[]> {
        try {
            const token = await this.getToken();
            if (!token) {
                console.log('No auth token found, user not logged in');
                return [];
            }

            const response = await fetch(`${BASE_URL}/expenses/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Expense fetch failed:', response.status, errorText);
                throw new Error(`Failed to fetch expenses: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Error fetching expenses:', error.message || error);
            throw error;
        }
    }

    async getCategoryTotal(categoryId: number): Promise<number> {
        try {
            const token = await this.getToken();
            const response = await fetch(`${BASE_URL}/expenses/category/${categoryId}/total`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch category total');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching category total:', error);
            throw error;
        }
    }
}

export default new ApiService();