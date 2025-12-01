// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.8.189:8080/api';

export interface AuthRequest {
    email: string;
    password: string;
    name?: string;
    phone?: string;
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
    date?: string; // Format: YYYY-MM-DD
    categoryId: number;
    userId?: number;
}

export interface IncomeDto {
    id?: number;
    amount: number;
    currency?: string;
    note?: string;
    date?: string; // Format: YYYY-MM-DD
    categoryId?: number; // null for overall income
    userId?: number;
}

export interface UserProfileDto {
    id: number;
    name: string;
    email: string;
    phone?: string;
    defaultCurrency: string;
    monthlyBudget: number;
}

export interface DashboardStatsDto {
    totalIncome: number;
    totalExpenses: number;
    remainingBudget: number;
    allocatedIncome: number;
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
            console.log("=== REGISTER API CALL ===");
            console.log("Request data:", JSON.stringify(data, null, 2));

            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Registration failed:", error);
                throw new Error(error || 'Registration failed');
            }

            const result: AuthResponse = await response.json();
            console.log("Registration successful:", result);

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
            const response = await fetch(`${BASE_URL}/categories/defaults`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch categories: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Error fetching categories:', error.message || error);
            throw error;
        }
    }

    async getUserCategories(userId: number): Promise<CategoryDto[]> {
        try {
            const token = await this.getToken();
            if (!token) {
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
                const error = await response.text();
                throw new Error(error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    async createExpense(userId: number, expense: ExpenseDto): Promise<ExpenseDto> {
        try {
            console.log("=== CREATE EXPENSE API CALL ===");
            console.log("User ID:", userId);
            console.log("Expense data:", JSON.stringify(expense, null, 2));

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
                console.error("Create expense failed:", error);
                throw new Error(error || 'Failed to create expense');
            }

            const result = await response.json();
            console.log("Expense created successfully:", result);
            return result;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    }

    async getUserExpenses(userId: number): Promise<ExpenseDto[]> {
        try {
            const token = await this.getToken();
            if (!token) {
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

    async addOrUpdateIncome(userId: number, income: IncomeDto): Promise<IncomeDto> {
        try {
            console.log("=== ADD/UPDATE INCOME API CALL ===");
            console.log("User ID:", userId);
            console.log("Income data:", JSON.stringify(income, null, 2));
            console.log("Category ID is null?", income.categoryId === null);
            console.log("Category ID is undefined?", income.categoryId === undefined);

            const token = await this.getToken();

            // Ensure categoryId is explicitly null if not provided (not undefined)
            const incomeData = {
                ...income,
                categoryId: income.categoryId || null
            };

            console.log("Sending to backend:", JSON.stringify(incomeData, null, 2));

            const response = await fetch(`${BASE_URL}/incomes/user/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(incomeData),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Add/update income failed:", error);
                throw new Error(error || 'Failed to add income');
            }

            const result = await response.json();
            console.log("Income saved successfully:", result);
            console.log("Saved income category ID:", result.categoryId);
            return result;
        } catch (error) {
            console.error('Error adding income:', error);
            throw error;
        }
    }

    async getUserIncomes(userId: number): Promise<IncomeDto[]> {
        try {
            const token = await this.getToken();
            if (!token) {
                return [];
            }

            const response = await fetch(`${BASE_URL}/incomes/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch incomes: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Error fetching incomes:', error.message || error);
            throw error;
        }
    }

    async getCategoryIncome(userId: number, categoryId: number): Promise<IncomeDto | null> {
        try {
            const token = await this.getToken();
            const response = await fetch(`${BASE_URL}/incomes/user/${userId}/category/${categoryId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch category income');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching category income:', error);
            return null;
        }
    }

    async getUserProfile(userId: number): Promise<UserProfileDto> {
        try {
            const token = await this.getToken();
            const response = await fetch(`${BASE_URL}/users/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    async updateUserProfile(userId: number, profile: Partial<UserProfileDto>): Promise<UserProfileDto> {
        try {
            const token = await this.getToken();
            const response = await fetch(`${BASE_URL}/users/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to update profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async getDashboardStats(userId: number): Promise<DashboardStatsDto> {
        try {
            const token = await this.getToken();
            const response = await fetch(`${BASE_URL}/users/${userId}/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
}

export default new ApiService();