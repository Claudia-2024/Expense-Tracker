import { View, Text, ViewStyle, TextStyle, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons icon library
import { useTheme } from '@/theme/global';

interface CardProps {
  title: string;              // The text that appears on the button
  onPress?: () => void;       // Function to run when the button is pressed
  selected?: boolean;          // If true, shows a spinner instead of text
  style?: ViewStyle;          // Optional custom container style
  textStyle?: TextStyle;      // Optional custom text style
}

export default function categoryCard ({
  title,
  onPress,
  selected = false,     // Default: not loading
  style,
  textStyle,
}: CardProps) {
      // Get the current theme values of the device
      const theme = useTheme();
      const { colors, typography, spacing, radius } = theme;
       return (
    <TouchableOpacity
      onPress={onPress}               // Runs when pressed
      activeOpacity={0.8}             // Slight fade when pressed for feedback
      style={[
        styles.button,                // Base button style
        {
          // Conditional styles using theme
          backgroundColor: selected ? colors.green : colors.background , // Gray when disabled
          borderColor: colors.gray,          // Dynamic border color
          borderWidth: 1 ,
          borderRadius: radius.md,           // Rounded corners from theme
          paddingVertical: spacing.md,       // Vertical padding from theme
          paddingHorizontal: spacing.xl,     // Horizontal padding from theme
        },
        style, // Allows extra custom styling if passed
      ]}
    >
        <Text
          style={[
            styles.text,  // Base text style
            {
              color: colors.text,                                 // Dynamic text color
              fontFamily: typography.fontFamily.buttonText,      // Use custom Afacad-Medium font
              fontSize: typography.fontSize.sm,                  // Use theme font size
            },
            textStyle, // Allows user to override text styling
          ]}
        >
          {title} {/* The actual button label */}
        </Text>
    </TouchableOpacity>
  );

    
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center', // Vertically center the content
    alignItems: 'center',     // Horizontally center the content
  },
  text: {
    fontWeight: '600',        // Slightly bold text weight
  },
});

