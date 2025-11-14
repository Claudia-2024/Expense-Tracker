import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import TabBar from '@/components/navigation/TabBar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Layout() {


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          elevation: 0,
          borderTopWidth: 0,
        },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
      <Tabs.Screen name="add" options={{ title: '+' }} />
      <Tabs.Screen name="statistics" options={{ title: 'Statistics' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
