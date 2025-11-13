import React from 'react';
import {StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TestScreen from '../screens/TestScreen';
import { useColorScheme } from 'react-native';
import { useTheme } from '../../theme/global';

export default function App() {
  const theme = useTheme();
  const scheme = useColorScheme();

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

