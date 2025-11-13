import React from 'react';
// TouchableOpacity → makes a view touchable (like a button)
// Text → displays text inside the button
// StyleSheet → allows creating organized styles
// ActivityIndicator → small spinning loader for “loading” state
// ViewStyle, TextStyle → types used for customizing the button and text styles
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

// Import our custom theme hook to access colors, fonts, etc.
import { useTheme } from '../../theme/global'; 

//  Type Declaration

// Define all the possible button style types (variants)
type ButtonVariant = 'primary' | 'secondary' | 'outline';

// Define all the props (properties) the Button component can accept
interface ButtonProps {
  title: string;              // The text that appears on the button
  onPress?: () => void;       // Function to run when the button is pressed
  variant?: ButtonVariant;    // Button style: primary / secondary / outline
  disabled?: boolean;         // If true, disables the button (cannot be pressed)
  loading?: boolean;          // If true, shows a spinner instead of text
  style?: ViewStyle;          // Optional custom container style
  textStyle?: TextStyle;      // Optional custom text style
}

//  BUTTON COMPONENT
// The main functional component
export default function Button({
  title,
  onPress,
  variant = 'primary', // Default style type
  disabled = false,    // Default: button is enabled
  loading = false,     // Default: not loading
  style,
  textStyle,
}: ButtonProps) {
  
  // Get the current theme values of the device
  const theme = useTheme();
  const { colors, typography, spacing, radius } = theme;

  // DYNAMIC STYLING BASED ON VARIANT
  // Choose the background color depending on the button type
  const backgroundColor =
    variant === 'primary' ? colors.primary    // Primary → blue
    : variant === 'secondary' ? colors.secondary  // Secondary → orange/yellow
    : 'transparent';    // Outline → transparent background

  // Choose the border color
  // Outline → uses theme border color
  // Others → same as background
  const borderColor =
    variant === 'outline'
      ? colors.border
      : backgroundColor;

  // Choose the text color
  // Outline → use theme text color (dark or light mode)
  // Others → white text on colored background
  const textColor =
    variant === 'outline'
      ? colors.border
      : '#fff';

  //  RETURN JSX (UI Layout)
  return (
    <TouchableOpacity
      onPress={onPress}               // Runs when pressed
      disabled={disabled || loading}  // Disable when loading or explicitly disabled
      activeOpacity={0.8}             // Slight fade when pressed for feedback
      style={[
        styles.button,                // Base button style
        {
          // Conditional styles using theme
          backgroundColor: disabled ? colors.gray : backgroundColor, // Gray when disabled
          borderColor: borderColor,          // Dynamic border color
          borderWidth: variant === 'outline' ? 3 : 0, // Only outline has a visible border
          borderRadius: radius.lg,           // Rounded corners from theme
          paddingVertical: spacing.md,       // Vertical padding from theme
          paddingHorizontal: spacing.xl,     // Horizontal padding from theme
        },
        style, // Allows extra custom styling if passed
      ]}
    >

      {/* If loading = true → show spinner; else show button text */}
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,  // Base text style
            {
              color: textColor,                                 // Dynamic text color
              fontFamily: typography.fontFamily.buttonText,      // Use custom Afacad-Medium font
              fontSize: typography.fontSize.sm,                  // Use theme font size
            },
            textStyle, // Allows user to override text styling
          ]}
        >
          {title} {/* The actual button label */}
        </Text>
      )}
    </TouchableOpacity>
  );
}

//----------------------------------------------------
// 🧩 BASE STYLES (non-dynamic)
//----------------------------------------------------
const styles = StyleSheet.create({
  button: {
    justifyContent: 'center', // Vertically center the content
    alignItems: 'center',     // Horizontally center the content
  },
  text: {
    fontWeight: '600',        // Slightly bold text weight
  },
});
