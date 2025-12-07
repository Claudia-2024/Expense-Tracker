// app/_layout.tsx
import React, { useEffect } from 'react';
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

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        CinzelMedium: require('../assets/fonts/Cinzel-Medium.ttf'),
        CinzelBold: require('../assets/fonts/Cinzel-Bold.ttf'),
        AfacadRegular: require('../assets/fonts/Afacad-Regular.ttf'),
        AfacadMedium: require('../assets/fonts/Afacad-Medium.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
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
                                </Stack>
                            </IncomeProvider>
                        </ExpenseProvider>
                    </CategoryProvider>
                </TutorialProvider>
            </CurrencyProvider>
        </ThemeProvider>
    );
}