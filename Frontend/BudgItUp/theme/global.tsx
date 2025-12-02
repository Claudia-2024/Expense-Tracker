import React, { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";

// --------- LIGHT & DARK THEMES ----------
const lightTheme = {
  background: "#FFFFFF",
  text: "#000000",
  white: "#ffffff",
  primary: "#348DDB",
  main:"#FCB53B",
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
  main:"#348DDB",
  secondary: "#FCB53B",
  border: "#348DDB",
  muted: "#2C2C2C",
  card: "#3e3e3eff",
  boxBorder: "#d5d9d3",
  gray: "rgba(52,141,219,0.5)",
  green: "#43fd00",
  red: "#ff0000",
};

// --------- BASE TYPOGRAPHY ETC ----------
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

// --------- CONTEXT TYPE ----------
type ThemeContextType = {
  themeMode: "light" | "dark";
  setThemeMode: (mode: "light" | "dark") => void;
};

// --------- CREATE CONTEXT ----------
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --------- PROVIDER ----------
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark">(
    system === "dark" ? "dark" : "light"
  );

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  const system = useColorScheme(); // get the system preference
  const colors = ctx.themeMode === "dark" ? darkTheme : lightTheme;

  return {
    colors,
    ...base,
    themeMode: ctx.themeMode,
    setThemeMode: ctx.setThemeMode,
    colorScheme: system, // <-- add this
  };
}

