// services/api.ts - Complete API Service with all endpoints
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.8.189:8080/api'; // Replace with your actual backend URL

// ==================== DTOs ====================
export interface CategoryDto {
    id?: number;
    name: string;
    color: string;
    icon: string;
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

export interface IncomeDto {
    id?: number;
    amount: number;
    currency?: string;
    note?: string;
    date?: string;
    categoryId?: number | null;
    userId: number;
}

export interface UserProfileDto {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    defaultCurrency: string;
}

export interface DashboardStatsDto {
    totalIncome: number;
    totalExpenses: number;
    remainingBudget: number;
    allocatedIncome: number;
}

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

// ==================== Helper Functions ====================
const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

const getHeaders = async () => {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return null;
};

// ==================== API Service ====================
const ApiService = {
    // ==================== AUTH ====================
    async register(data: AuthRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await handleResponse(response);

        // Store auth data
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userId', result.userId.toString());
        await AsyncStorage.setItem('userEmail', result.email);

        return result;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await handleResponse(response);

        // Store auth data
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userId', result.userId.toString());
        await AsyncStorage.setItem('userEmail', result.email);

        return result;
    },

    async logout(userId: number): Promise<void> {
        try {
            const headers = await getHeaders();
            await fetch(`${API_BASE_URL}/auth/logout?userId=${userId}`, {
                method: 'POST',
                headers,
            });
        } finally {
            // Clear local storage regardless of backend response
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userEmail');
        }
    },

    // ==================== CATEGORIES ====================
    async getDefaultCategories(): Promise<CategoryDto[]> {
        const response = await fetch(`${API_BASE_URL}/categories/defaults`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse(response);
    },

    async getUserCategories(userId: number): Promise<CategoryDto[]> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/categories/user/${userId}`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    async createCategory(userId: number, data: Partial<CategoryDto>): Promise<CategoryDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/categories/user/${userId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async updateCategory(userId: number, categoryId: number, data: Partial<CategoryDto>): Promise<CategoryDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/categories/user/${userId}/${categoryId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async deleteCategory(userId: number, categoryId: number): Promise<void> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/categories/user/${userId}/${categoryId}`, {
            method: 'DELETE',
            headers,
        });
        await handleResponse(response);
    },

    // ==================== EXPENSES ====================
    async getUserExpenses(userId: number): Promise<ExpenseDto[]> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/expenses/user/${userId}`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    async createExpense(userId: number, data: ExpenseDto): Promise<ExpenseDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/expenses/user/${userId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async updateExpense(userId: number, expenseId: number, data: ExpenseDto): Promise<ExpenseDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/expenses/user/${userId}/${expenseId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async deleteExpense(userId: number, expenseId: number): Promise<void> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/expenses/user/${userId}/${expenseId}`, {
            method: 'DELETE',
            headers,
        });
        await handleResponse(response);
    },

    // services/api.ts - Update getCategoryTotal method
    async getCategoryTotal(userId: number, categoryId: number): Promise<number> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/expenses/user/${userId}/category/${categoryId}/total`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    // ==================== INCOMES ====================
    async getUserIncomes(userId: number): Promise<IncomeDto[]> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/incomes/user/${userId}`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    async addOrUpdateIncome(userId: number, data: IncomeDto): Promise<IncomeDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/incomes/user/${userId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async getCategoryIncome(userId: number, categoryId: number): Promise<IncomeDto | null> {
        const headers = await getHeaders();
        try {
            const response = await fetch(`${API_BASE_URL}/incomes/user/${userId}/category/${categoryId}`, {
                method: 'GET',
                headers,
            });
            if (response.status === 404) return null;
            return handleResponse(response);
        } catch (error) {
            console.error('Error getting category income:', error);
            return null;
        }
    },

    async deleteIncome(userId: number, incomeId: number): Promise<void> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/incomes/user/${userId}/${incomeId}`, {
            method: 'DELETE',
            headers,
        });
        await handleResponse(response);
    },

    // ==================== USER ====================
    async getUserProfile(userId: number): Promise<UserProfileDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    async updateUserProfile(userId: number, data: Partial<UserProfileDto>): Promise<UserProfileDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async getDashboardStats(userId: number): Promise<DashboardStatsDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    // ==================== BUDGETS ====================
    async getUserBudgets(userId: number): Promise<BudgetDto[]> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/budgets/user/${userId}`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    async getCategoryBudget(userId: number, categoryId: number): Promise<BudgetDto | null> {
        const headers = await getHeaders();
        try {
            const response = await fetch(`${API_BASE_URL}/budgets/user/${userId}/category/${categoryId}`, {
                method: 'GET',
                headers,
            });
            if (response.status === 404) return null;
            return handleResponse(response);
        } catch (error) {
            console.error('Error getting category budget:', error);
            return null;
        }
    },

    async setCategoryBudget(userId: number, categoryId: number, amount: number): Promise<BudgetDto> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/budgets/user/${userId}/category/${categoryId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ amount }),
        });
        return handleResponse(response);
    },

    async deleteCategoryBudget(userId: number, categoryId: number): Promise<void> {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}/budgets/user/${userId}/category/${categoryId}`, {
            method: 'DELETE',
            headers,
        });
        await handleResponse(response);
    },
};

// Budget DTO
export interface BudgetDto {
    id?: number;
    amount: number;
    currency?: string;
    categoryId: number;
    userId?: number;
}

export default ApiService;