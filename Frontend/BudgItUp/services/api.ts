// services/api.ts
// OFFLINE API SERVICE - Replaces all HTTP calls with local database operations

import UserService, { UserDto, AuthResponse, DashboardStatsDto } from './database/UserService';
import CategoryService, { CategoryDto } from './database/CategoryService';
import ExpenseService, { ExpenseDto } from './database/ExpenseService';
import { incomeService, budgetService, IncomeDto, BudgetDto } from './database/IncomeBudgetServices';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== Helper Functions ====================
const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// ==================== Offline API Service ====================
const ApiService = {
    // ==================== AUTH ====================
    async register(data: {
        email: string;
        password: string;
        name?: string;
        phone?: string;
        defaultCategoryIds?: number[];
    }): Promise<AuthResponse> {
        return await UserService.register(
            data.email,
            data.password,
            data.name || '',
            data.phone,
            data.defaultCategoryIds
        );
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        return await UserService.login(email, password);
    },

    async logout(userId: number): Promise<void> {
        return await UserService.logout(userId);
    },

    // ==================== CATEGORIES ====================
    async getDefaultCategories(): Promise<CategoryDto[]> {
        return await CategoryService.getDefaultCategories();
    },

    async getUserCategories(userId: number): Promise<CategoryDto[]> {
        return await CategoryService.getUserCategories(userId);
    },

    async createCategory(userId: number, data: Partial<CategoryDto>): Promise<CategoryDto> {
        return await CategoryService.createCategory(userId, data);
    },

    async updateCategory(
        userId: number,
        categoryId: number,
        data: Partial<CategoryDto>
    ): Promise<CategoryDto> {
        return await CategoryService.updateCategory(userId, categoryId, data);
    },

    async deleteCategory(userId: number, categoryId: number): Promise<void> {
        return await CategoryService.deleteCategory(userId, categoryId);
    },

    // ==================== EXPENSES ====================
    async getUserExpenses(userId: number): Promise<ExpenseDto[]> {
        return await ExpenseService.getUserExpenses(userId);
    },

    async createExpense(userId: number, data: ExpenseDto): Promise<ExpenseDto> {
        return await ExpenseService.createExpense(userId, data);
    },

    async updateExpense(
        userId: number,
        expenseId: number,
        data: ExpenseDto
    ): Promise<ExpenseDto> {
        return await ExpenseService.updateExpense(userId, expenseId, data);
    },

    async deleteExpense(userId: number, expenseId: number): Promise<void> {
        return await ExpenseService.deleteExpense(userId, expenseId);
    },

    async getCategoryTotal(userId: number, categoryId: number): Promise<number> {
        return await ExpenseService.getCategoryTotal(userId, categoryId);
    },

    // ==================== INCOMES ====================
    async getUserIncomes(userId: number): Promise<IncomeDto[]> {
        return await incomeService.getUserIncomes(userId);
    },

    async addOrUpdateIncome(userId: number, data: IncomeDto): Promise<IncomeDto> {
        return await incomeService.addOrUpdateIncome(userId, data);
    },

    async getCategoryIncome(userId: number, categoryId: number): Promise<IncomeDto | null> {
        return await incomeService.getCategoryIncome(userId, categoryId);
    },

    async deleteIncome(userId: number, incomeId: number): Promise<void> {
        return await incomeService.deleteIncome(userId, incomeId);
    },

    // ==================== USER ====================
    async getUserProfile(userId: number): Promise<UserDto> {
        return await UserService.getUserProfile(userId);
    },

    async updateUserProfile(
        userId: number,
        data: Partial<UserDto>
    ): Promise<UserDto> {
        return await UserService.updateUserProfile(userId, data);
    },

    async getDashboardStats(userId: number): Promise<DashboardStatsDto> {
        return await UserService.getDashboardStats(userId);
    },

    // ==================== BUDGETS ====================
    async getUserBudgets(userId: number): Promise<BudgetDto[]> {
        return await budgetService.getUserBudgets(userId);
    },

    async getCategoryBudget(userId: number, categoryId: number): Promise<BudgetDto | null> {
        return await budgetService.getCategoryBudget(userId, categoryId);
    },

    async setCategoryBudget(
        userId: number,
        categoryId: number,
        amount: number
    ): Promise<BudgetDto> {
        return await budgetService.setCategoryBudget(userId, categoryId, amount);
    },

    async deleteCategoryBudget(userId: number, categoryId: number): Promise<void> {
        return await budgetService.deleteCategoryBudget(userId, categoryId);
    },
};

// Export types for backward compatibility
export type {
    CategoryDto,
    ExpenseDto,
    IncomeDto,
    UserDto as UserProfileDto,
    DashboardStatsDto,
    BudgetDto,
    AuthResponse,
};

export interface AuthRequest {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    defaultCategoryIds?: number[];
}

export default ApiService;