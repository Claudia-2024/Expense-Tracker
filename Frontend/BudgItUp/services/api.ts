// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const BASE_URL = 'http://192.168.100.29:8080/api'; // e.g., 'http://192.168.1.100:8080/api'

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
    isDefault: boolean;
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
            const response = await fetch(`${BASE_URL}/categories/defaults`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    async getUserCategories(userId: number): Promise<CategoryDto[]> {
        try {
            const token = await this.getToken();
            const response = await fetch(`${BASE_URL}/categories/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user categories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user categories:', error);
            throw error;
        }
    }
}

export default new ApiService();