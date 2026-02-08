import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TutorialStep = {
    id: string;
    title: string;
    description: string;
    targetKey?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

export type PageTutorial = {
    [pageName: string]: TutorialStep[];
};

type TutorialContextType = {
    hasSeenTutorial: (pageName: string) => Promise<boolean>;
    markTutorialAsSeen: (pageName: string) => Promise<void>;
    resetAllTutorials: () => Promise<void>;
    getUserTutorialKey: () => Promise<string>;
};

const TutorialContext = createContext<TutorialContextType>({
    hasSeenTutorial: async () => false,
    markTutorialAsSeen: async () => {},
    resetAllTutorials: async () => {},
    getUserTutorialKey: async () => "",
});

export const TutorialProvider = ({ children }: { children: React.ReactNode }) => {
    const getUserTutorialKey = async (): Promise<string> => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            return userId ? `tutorials_user_${userId}` : 'tutorials_guest';
        } catch (error) {
            console.error('Error getting user tutorial key:', error);
            return 'tutorials_guest';
        }
    };

    const hasSeenTutorial = async (pageName: string): Promise<boolean> => {
        try {
            const tutorialKey = await getUserTutorialKey();
            const seenTutorials = await AsyncStorage.getItem(tutorialKey);
            if (!seenTutorials) return false;

            const parsedTutorials = JSON.parse(seenTutorials);
            return parsedTutorials.includes(pageName);
        } catch (error) {
            console.error('Error checking tutorial status:', error);
            return false;
        }
    };

    const markTutorialAsSeen = async (pageName: string): Promise<void> => {
        try {
            const tutorialKey = await getUserTutorialKey();
            const seenTutorials = await AsyncStorage.getItem(tutorialKey);
            const parsedTutorials = seenTutorials ? JSON.parse(seenTutorials) : [];

            if (!parsedTutorials.includes(pageName)) {
                parsedTutorials.push(pageName);
                await AsyncStorage.setItem(tutorialKey, JSON.stringify(parsedTutorials));
                console.log(`✅ Tutorial marked as seen for page: ${pageName}`);
            }
        } catch (error) {
            console.error('Error marking tutorial as seen:', error);
        }
    };

    const resetAllTutorials = async (): Promise<void> => {
        try {
            const tutorialKey = await getUserTutorialKey();
            await AsyncStorage.removeItem(tutorialKey);
            console.log('✅ All tutorials reset');
        } catch (error) {
            console.error('Error resetting tutorials:', error);
        }
    };

    return (
        <TutorialContext.Provider
            value={{
                hasSeenTutorial,
                markTutorialAsSeen,
                resetAllTutorials,
                getUserTutorialKey,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
};

export const useTutorial = () => useContext(TutorialContext);