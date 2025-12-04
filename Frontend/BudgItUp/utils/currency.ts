import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

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

export const SUPPORTED_CURRENCIES = [
    { code: "XAF", name: "Central African CFA franc", symbol: "FCFA" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
    { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
];

export const getUserCurrency = async (): Promise<string> => {
    try {
        const currency = await AsyncStorage.getItem('userCurrency');
        return currency || 'XAF';
    } catch (error) {
        console.error('Error getting user currency:', error);
        return 'XAF';
    }
};

export const getCurrencySymbol = (currencyCode: string): string => {
    return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

export const formatCurrencySync = (amount: number, currencyCode: string = 'XAF'): string => {
    const symbol = getCurrencySymbol(currencyCode);
    const formatted = amount.toFixed(2);

    if (currencyCode === 'XAF' || currencyCode === 'KES') {
        return `${formatted} ${symbol}`;
    }

    return `${symbol}${formatted}`;
};

export const useCurrency = () => {
    const [currency, setCurrency] = useState<string>('XAF');
    const [symbol, setSymbol] = useState<string>('FCFA');

    useEffect(() => {
        loadCurrency();
    }, []);

    const loadCurrency = async () => {
        const curr = await getUserCurrency();
        setCurrency(curr);
        setSymbol(getCurrencySymbol(curr));
    };

    const format = (amount: number) => formatCurrencySync(amount, currency);

    return { currency, symbol, format, reload: loadCurrency };
};
