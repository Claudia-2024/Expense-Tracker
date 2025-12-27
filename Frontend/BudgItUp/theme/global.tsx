// theme/globals.tsx - FIXED VERSION with proper global theme updates
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = 'app_theme_mode';

// Light & Dark Themes
const lightTheme = {
  background: "#FFFFFF",
  text: "#000000",
  white: "#ffffff",
  primary: "#348DDB",
  main: "#FCB53B",
  secondary: "#FCB53B",
  border: "#348DDB",
  navtext: "#ffffffff",
  muted: "#4f4f4fff",
  boxBorder: "#596255",
  card: "#ffffffff",
  gray: "rgba(52,141,219,0.5)",
  green: "#43fd00",
  red: "#ff0000",
};

const darkTheme = {
  background: "#1c1c1cff",
  text: "#FFFFFF",
  white: "#ffffff",
  primary: "#348DDB",
  main: "#348DDB",
  secondary: "#FCB53B",
  border: "#348DDB",
  muted: "#2C2C2C",
  card: "#3e3e3eff",
  boxBorder: "#d5d9d3",
  gray: "rgba(52,141,219,0.5)",
  green: "#43fd00",
  red: "#ff0000",
};

// Base Typography
const base = {
  typography: {
    fontFamily: {
      heading: "CinzelMedium",
      boldHeading: "CinzelBold",
      buttonText: "AfacadMedium",
      body: "AfacadRegular",
    },
    fontSize: {
      xs: 14,
      sm: 16,
      md: 20,
      lg: 22,
      xl: 24,
      xxl: 26,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 10,
    md: 30,
    lg: 50,
  },
};

// Context Type
type ThemeContextType = {
  themeMode: "light" | "dark";
  setThemeMode: (mode: "light" | "dark") => void;
  colorScheme: "light" | "dark" | null | undefined;
};

// Create Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = useColorScheme();
  const [themeMode, setThemeModeState] = useState<"light" | "dark">(
      system === "dark" ? "dark" : "light"
  );
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
          setThemeModeState(savedTheme);
        } else {
          // Use system default if no saved preference
          setThemeModeState(system === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // 🔥 Save theme when changed
  const setThemeMode = async (mode: "light" | "dark") => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      console.log('✅ Theme saved:', mode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
      <ThemeContext.Provider value={{ themeMode, setThemeMode, colorScheme: system }}>
        {children}
      </ThemeContext.Provider>
  );
};

// Hook
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  const colors = ctx.themeMode === "dark" ? darkTheme : lightTheme;

  return {
    colors,
    ...base,
    themeMode: ctx.themeMode,
    setThemeMode: ctx.setThemeMode,
    colorScheme: ctx.colorScheme,
  };
}