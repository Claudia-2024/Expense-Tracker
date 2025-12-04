import { useColorScheme } from "react-native";
import { useState, useEffect } from "react";

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  white: '#ffffff',
  primary: '#348DDB',
  main: '#348DDB',        // <-- ADD THIS
  secondary: '#FCB53B',
  border: '#348DDB',
  navtext:'#ffffff',
  muted: '#4f4f4fff',
  boxBorder: '#596255',
  card: '#f5f5f5',
  gray: 'rgba(52,141,219,0.5)',
  green: '#43fd00',
  red:'#ff0000'
};

const darkTheme = {
  background: '#1c1c1cff',
  text: '#FFFFFF',
  white: '#ffffff',
  primary: '#348DDB',
  main: '#348DDB',        // <-- ADD THIS
  secondary: '#FCB53B',
  border: '#348DDB',
  muted: '#2C2C2C',
  boxBorder: '#d5d9d3',
  gray: 'rgba(52,141,219,0.5)',
  green: '#43fd00',
  red:'#ff0000'
};


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

export function useTheme() {
  const systemScheme = useColorScheme();

  // STATE FOR THEME MODE (light | dark | system)
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");

  // COMPUTE ACTIVE THEME
  const activeMode =
      themeMode === "system" ? systemScheme || "light" : themeMode;

  const colors = activeMode === "dark" ? darkTheme : lightTheme;

  return {
    ...base,
    colors,
    colorScheme: systemScheme,
    themeMode,
    setThemeMode,
  };
}
