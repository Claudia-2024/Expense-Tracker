import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TestScreen from '../screens/TestScreen';
import { useColorScheme } from 'react-native';
import { useTheme } from '../../theme/global';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function App() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts once at startup
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Cinzel-Medium': require('../../assets/fonts/Cinzel-Medium.ttf'),
          'Cinzel-Bold': require('../../assets/fonts/Cinzel-Bold.ttf'),
          'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
          'Afacad-Medium': require('../../assets/fonts/Afacad-Medium.ttf'),
        });
      } catch (e) {
        console.warn('Font loading error:', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  // Hide splash when fonts are ready
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <TestScreen />
    </SafeAreaView>
  );
}
