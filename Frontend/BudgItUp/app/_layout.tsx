import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

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
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
