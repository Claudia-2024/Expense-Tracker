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
        <SafeAreaProvider>
            <ThemeProvider>
                <CategoryProvider>
                    <ExpenseProvider>
                        <IncomeProvider>
                            <Stack screenOptions={{ headerShown: false }} />
                        </IncomeProvider>
                    </ExpenseProvider>
                </CategoryProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}