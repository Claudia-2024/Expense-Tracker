import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import TabBar from '@/components/navigation/TabBar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// After → Add the import and type it:
import { createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import type { RootStackParamList } from "../types/navigation";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'transparent',
                    marginBottom:50,
                    position: 'absolute',
                    elevation: 0,
                    borderTopWidth: 0,
                },
            }}
            tabBar={(props) => <TabBar {...props} />}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="transactions" options={{ title: 'History' }} />
            <Tabs.Screen name="add" options={{ title: '+' }} />
            <Tabs.Screen name="statistics" options={{ title: 'Stats' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        </Tabs>
    );
}

