import { useColorScheme } from 'react-native';

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#348DDB',
  secondary: '#FCB53B',
  border: '#348DDB',
  muted: '#F7F7F7',
  gray: 'rgba(52,141,219,0.5)',
  green: '#43fd00',
  red:'#ff0000'
};

const darkTheme = {
  background: '#1E1E1E',
  text: '#FFFFFF',
  primary: '#348DDB',
  secondary: '#FCB53B',
  border: '#348DDB',
  muted: '#2C2C2C',
  gray: 'rgba(52,141,219,0.5)',
  green: '#43fd00',
  red:'#ff0000'
};

const base = {
  typography: {
    fontFamily: {
      heading: 'Cinzel-Medium',
      boldHeading:'Cinzel-Bold',
      buttonText:'Afacad-Medium',
      body: 'Afacad-Regular',
    },
    fontSize: {
      xs: 14,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 26,
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
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;

  return {
    colors,
    ...base,
    colorScheme,
  };
}