// app/_layout.tsx
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { CategoryProvider } from './context/categoryContext';
import { ExpenseProvider } from './context/expenseContext';
import { IncomeProvider } from './context/incomeContext';
import { ThemeProvider } from '@/theme/global';


export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [fontsLoaded] = useFonts({
        CinzelMedium: require('../assets/fonts/Cinzel-Medium.ttf'),
        CinzelBold: require('../assets/fonts/Cinzel-Bold.ttf'),
        AfacadRegular: require('../assets/fonts/Afacad-Regular.ttf'),
        AfacadMedium: require('../assets/fonts/Afacad-Medium.ttf'),
    });

    useEffect(() => {
        async function hideSplash() {
            if (fontsLoaded) {
                await SplashScreen.hideAsync();
            }
        }
        hideSplash();
    }, [fontsLoaded]);

    return (
        <SafeAreaProvider>
            <CategoryProvider>
                <ExpenseProvider>
                    <IncomeProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            {children}
                        </Stack>
                    </IncomeProvider>
                </ExpenseProvider>
            </CategoryProvider>
        </SafeAreaProvider>
    );
}