import React from 'react'; // Import React for creating components
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native'; // Import core React Native components
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Hook to get device safe area (notch, home bar)
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons icon library
import { useTheme } from '../../theme/global'; 

const TabBar = ({ state, descriptors, navigation }) => { // Custom TabBar component
  const insets = useSafeAreaInsets(); // Get safe area insets for padding
  // Using the global css values
  const theme = useTheme();
  const { colors, typography } = theme;
  return (
    <View
      style={[
        styles.tabBar, // Base tab bar styling
        {position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
          paddingBottom: insets.bottom ? insets.bottom - 8 : 10, // Adjust padding for devices with bottom inset
        },
      ]}
    >
        <View style={styles.tabBackground} />
      {state.routes.map((route, index) => { // Loop through each tab route
        const { options } = descriptors[route.key]; // Get options for the current tab
        const label =
          options.tabBarLabel !== undefined // Check if a custom tab label is provided
            ? options.tabBarLabel
            : options.title !== undefined // Else, use the title from options
            ? options.title
            : route.name; // Else, fallback to route name

        const isFocused = state.index === index; // Check if this tab is currently focused

        const onPress = () => { // Handle tab press
          const event = navigation.emit({
            type: 'tabPress', // Emit a tabPress event
            target: route.key, // Target the specific tab
            canPreventDefault: true, // Allow preventing default navigation
          });

          if (!isFocused && !event.defaultPrevented) { // Navigate only if not focused and event not prevented
            navigation.navigate(route.name, route.params); // Navigate to the tab
          }
        };

        // Special case for floating middle button (e.g., '+')
        if (label === '+') {
          return (
            <TouchableOpacity
              key={label} // Key for rendering
              accessibilityRole="button" // Accessibility role for screen readers
              onPress={onPress} // Call onPress when pressed
              style={styles.centerButtonWrapper} // Wrapper style for positioning
            >
              <View
                style={[
                  styles.centerButton, // Base styling for center button
                  { backgroundColor: isFocused ? colors.primary : colors.secondary }, // Change color if focused
                ]}
              >
                <Text style={styles.plus}>+</Text> {/* '+' sign for the button */}
              </View>
            </TouchableOpacity>
          );
        }

        // Regular tab buttons
        return (
          <TouchableOpacity
            key={label} // Unique key
            accessibilityRole="button" // Accessibility role
            onPress={onPress} // Handle tab press
            style={styles.tabButton} // Style for each tab button
          >
            <Ionicons
              name={ // Choose icon based on label and focus
                label === 'Home'
                  ? isFocused
                    ? 'home' // Focused home icon
                    : 'home-outline' // Unfocused home icon
                  : label === 'Transactions'
                  ? isFocused
                    ? 'swap-horizontal' // Focused transactions icon
                    : 'swap-horizontal-outline' // Unfocused transactions icon
                  : label === 'Statistics'
                  ? isFocused
                    ? 'bar-chart' // Focused stats icon
                    : 'bar-chart-outline' // Unfocused stats icon
                  : label === 'Profile'
                  ? isFocused
                    ? 'person' // Focused profile icon
                    : 'person-outline' // Unfocused profile icon
                  : 'ellipse' // Default icon
              }
              size={22} // Icon size
              color={isFocused ? colors.secondary : colors.muted} // Icon color based on focus
            />
            <Text style={[styles.label, { color: isFocused ? colors.secondary : colors.muted, fontFamily:typography.fontFamily.buttonText,
            fontSize:typography.fontSize.sm,       // Use custom Afacad-Medium font
 }]}>
              {label} {/* Tab label text */}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar; // Export the TabBar component

// Styles for the TabBar
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', // Arrange tabs horizontally
    borderTopColor: '#E0E0E0', // Light border at top
        backgroundColor: "#F6F6F6",   // your curved card color
    borderTopRightRadius:50,
    borderTopLeftRadius:50,
    borderTopWidth: 4, // Border width
    justifyContent: 'space-around', // Even spacing for tabs
    alignItems: 'center', // Center items vertically
    height: Platform.OS === 'ios' ? 80 : 70, // Height varies for iOS vs Android
  },
    tabBackground: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    backgroundColor: "#fff",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1, // Take equal space
    alignItems: 'center', // Center icon and label horizontally
    justifyContent: 'center', // Center vertically
  },
  label: {
    fontSize: 12, // Label font size
    marginTop: 4, // Space between icon and label
    fontWeight: '500', // Medium font weight
  },
  centerButtonWrapper: {
    top: -25, // Raise the center button above the tab bar
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
  },
  centerButton: {
    width: 60, // Button width
    height: 60, // Button height
    borderRadius: 30, // Make it circular
    alignItems: 'center', // Center '+' sign horizontally
    justifyContent: 'center', // Center '+' sign vertically
    shadowColor: '#02193dff', // iOS shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 6, // Shadow blur
    elevation: 6, // Android shadow
  },
  plus: {
    fontSize: 40, // '+' font size
    top:-5,
    color: '#fff', // White color
    fontWeight: '600', // Bold font weight
  },
});
