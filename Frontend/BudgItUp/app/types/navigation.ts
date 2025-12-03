// app/types/navigation.ts

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// All your screen names go here
export type RootStackParamList = {
    // Tab screens
    "(tabs)/index": undefined;
    "(tabs)/transactions": undefined;
    "(tabs)/statistics": undefined;
    "(tabs)/profile": undefined;
    "(tabs)/add": undefined;

    // Other screens (modals, stacks, etc.)
    Notifications: undefined;
    AllTransactions: undefined;

    TransactionDetails: {
        transaction: {
            id: string;
            title: string;
            category: string;
            amount: string;
            date: string;
            icon: keyof typeof import("@expo/vector-icons").Feather.glyphMap;
            color: string;
            description?: string;
        }; };  // or define a proper type
};

// Optional: helpful typed props for each screen
export type TransactionsScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "(tabs)/transactions"
>;

export type NotificationsScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "Notifications"
>;