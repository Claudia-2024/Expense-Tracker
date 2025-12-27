// app/_layout.tsx
// UPDATED - Ensures database is fully initialized before loading contexts

import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { CategoryProvider } from './context/categoryContext';
import { ExpenseProvider } from './context/expenseContext';
import { IncomeProvider } from './context/incomeContext';
import { ThemeProvider } from '@/theme/global';
import { CurrencyProvider } from './context/currencyContext';
import { TutorialProvider } from './context/tutorialContext';
import { getDatabase } from '@/services/database/schema';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        CinzelMedium: require('../assets/fonts/Cinzel-Medium.ttf'),
        CinzelBold: require('../assets/fonts/Cinzel-Bold.ttf'),
        AfacadRegular: require('../assets/fonts/Afacad-Regular.ttf'),
        AfacadMedium: require('../assets/fonts/Afacad-Medium.ttf'),
    });

    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    // Initialize database - this is CRITICAL and must complete before contexts load
    useEffect(() => {
        let isMounted = true;

        const setupDatabase = async () => {
            try {
                console.log('🔧 Starting database initialization...');

                // getDatabase() now handles full initialization
                const db = await getDatabase();

                // Verify database is working with a simple query
                const testResult = await db.getFirstAsync<{ count: number }>(
                    'SELECT COUNT(*) as count FROM categories WHERE is_default = 1'
                );

                console.log('✅ Database initialized and verified');
                console.log(`📊 Found ${testResult?.count || 0} default categories`);

                if (isMounted) {
                    setDbInitialized(true);
                }
            } catch (error: any) {
                console.error('❌ Database initialization failed:', error);
                console.error('Error details:', error.message);

                if (isMounted) {
                    setDbError(error.message || 'Failed to initialize database');
                }
            }
        };

        setupDatabase();

        return () => {
            isMounted = false;
        };
    }, []);

    // Hide splash screen when everything is ready
    useEffect(() => {
        if (fontsLoaded && dbInitialized) {
            console.log('✅ App ready - hiding splash screen');
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, dbInitialized]);

    // Show loading screen while initializing
    if (!fontsLoaded || !dbInitialized) {
        return (
            <View style={styles.loadingContainer}>
                {dbError ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>⚠️ Database Error</Text>
                        <Text style={styles.errorMessage}>{dbError}</Text>
                        <Text style={styles.errorHint}>
                            Try restarting the app. If the problem persists,
                            you may need to clear app data.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.loadingContent}>
                        <ActivityIndicator size="large" color="#348DDB" />
                        <Text style={styles.loadingText}>
                            {!fontsLoaded ? 'Loading fonts...' : 'Initializing database...'}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    // Only render providers AFTER database is confirmed ready
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <CurrencyProvider>
                    <TutorialProvider>
                        <CategoryProvider>
                            <ExpenseProvider>
                                <IncomeProvider>
                                    <Stack screenOptions={{ headerShown: false }}>
                                        <Stack.Screen name="index" />
                                        <Stack.Screen name="(tabs)" />
                                        <Stack.Screen name="auth/login" />
                                        <Stack.Screen name="auth/signup" />
                                        <Stack.Screen name="category-selector/choseCategory" />
                                        <Stack.Screen name="category-selector/addCategory" />
                                        <Stack.Screen name="category-selector/allCategories" />
                                        <Stack.Screen name="categories/[id]" />
                                        <Stack.Screen name="AllTransactions" />
                                        <Stack.Screen name="Notifications" />
                                    </Stack>
                                </IncomeProvider>
                            </ExpenseProvider>
                        </CategoryProvider>
                    </TutorialProvider>
                </CurrencyProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    loadingContent: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
        fontFamily: 'AfacadRegular',
    },
    errorContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    errorTitle: {
        fontSize: 20,
        color: '#e74c3c',
        marginBottom: 15,
        fontFamily: 'CinzelMedium',
    },
    errorMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'AfacadRegular',
    },
    errorHint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 10,
        fontFamily: 'AfacadRegular',
    },
});