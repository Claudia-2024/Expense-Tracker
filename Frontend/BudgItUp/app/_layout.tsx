import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { CategoryProvider } from './context/categoryContext';
import { ExpenseProvider } from './context/expenseContext';


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CinzelMedium: require('../assets/fonts/Cinzel-Medium.ttf'),
    CinzelBold: require('../assets/fonts/Cinzel-Bold.ttf'),
    AfacadRegular: require('../assets/fonts/Afacad-Regular.ttf'),
    AfacadMedium: require('../assets/fonts/Afacad-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <SafeAreaProvider>
      <CategoryProvider>
        <ExpenseProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ExpenseProvider>
      </CategoryProvider>
    </SafeAreaProvider>
  );
}