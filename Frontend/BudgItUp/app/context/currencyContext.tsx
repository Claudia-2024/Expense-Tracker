// app/context/currencyContext.tsx
// Real-time currency context for instant updates across all screens
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "@/services/api";

export const CURRENCY_SYMBOLS: { [key: string]: string } = {
    XAF: "FCFA",
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    GHS: "GH₵",
    KES: "KSh",
    ZAR: "R",
};

type CurrencyContextType = {
    currency: string;
    symbol: string;
    format: (amount: number) => string;
    updateCurrency: (newCurrency: string) => Promise<void>;
    loading: boolean;
};

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'XAF',
    symbol: 'FCFA',
    format: (amount: number) => `${amount.toFixed(2)} FCFA`,
    updateCurrency: async () => {},
    loading: true,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<string>('XAF');
    const [symbol, setSymbol] = useState<string>('FCFA');
    const [loading, setLoading] = useState(true);

    const getCurrencySymbol = (currencyCode: string): string => {
        return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    };

    const formatCurrency = (amount: number, currencyCode: string): string => {
        const sym = getCurrencySymbol(currencyCode);
        const formatted = amount.toFixed(2);

        if (currencyCode === 'XAF' || currencyCode === 'KES') {
            return `${formatted} ${sym}`;
        }

        return `${sym}${formatted}`;
    };

    const loadCurrency = async () => {
        try {
            setLoading(true);
            const userIdStr = await AsyncStorage.getItem('userId');

            if (userIdStr) {
                try {
                    const profile = await ApiService.getUserProfile(parseInt(userIdStr));
                    const userCurrency = profile.defaultCurrency || 'XAF';
                    setCurrency(userCurrency);
                    setSymbol(getCurrencySymbol(userCurrency));
                } catch (error) {
                    console.error('Error fetching user currency:', error);
                    // Fallback to cached value
                    const cached = await AsyncStorage.getItem('userCurrency');
                    const fallbackCurrency = cached || 'XAF';
                    setCurrency(fallbackCurrency);
                    setSymbol(getCurrencySymbol(fallbackCurrency));
                }
            } else {
                setCurrency('XAF');
                setSymbol('FCFA');
            }
        } catch (error) {
            console.error('Error loading currency:', error);
            setCurrency('XAF');
            setSymbol('FCFA');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCurrency();
    }, []);

    const updateCurrency = async (newCurrency: string) => {
        try {
            console.log('🔄 Updating currency to:', newCurrency);
            setCurrency(newCurrency);
            setSymbol(getCurrencySymbol(newCurrency));
            await AsyncStorage.setItem('userCurrency', newCurrency);
            console.log('✅ Currency updated successfully');
        } catch (error) {
            console.error('❌ Error updating currency:', error);
        }
    };

    const format = (amount: number) => formatCurrency(amount, currency);

    return (
        <CurrencyContext.Provider value={{ currency, symbol, format, updateCurrency, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);