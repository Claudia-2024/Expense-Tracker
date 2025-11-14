// Import React and some hooks we need: useState for state, useEffect for side effects
import React, { useState, useEffect } from 'react';

// Import React Native components and utilities
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';

// Import Ionicons icon set from Expo for displaying category icons
import { Ionicons } from '@expo/vector-icons';

// Import category type and a mapping of category names to icon names
import { CategoryName, categoryIcons } from './categoryIcons';

// Define the props that the CategoryCard component will receive
interface CategoryCardProps {
  category: CategoryName;             // Name of the category
  selected?: boolean;                 // Optional: whether the card is selected
  onPress?: (selected: boolean) => void; // Optional callback when the card is pressed
}

// Get the screen width using the Dimensions API
const SCREEN_WIDTH = Dimensions.get('window').width;

// Calculate the size of each card: 1/3 of the screen width minus some margin
const CARD_SIZE = SCREEN_WIDTH / 3 - 24;

// Define the CategoryCard functional component
const CategoryCard: React.FC<CategoryCardProps> = ({ category, selected: propSelected = false, onPress }) => {
  // State for whether this card is selected
  const [selected, setSelected] = useState(propSelected);

  // State for the scale animation of the card
  const scaleAnim = useState(new Animated.Value(1))[0];

  // State for animating the color of the card and text/icons
  const colorAnim = useState(new Animated.Value(propSelected ? 1 : 0))[0];

  // Run this effect whenever the `selected` state changes
  useEffect(() => {
    // Animate colorAnim to 1 if selected, else to 0
    Animated.timing(colorAnim, {
      toValue: selected ? 1 : 0,
      duration: 300,         // Duration of the animation in ms
      useNativeDriver: false, // Color interpolation cannot use native driver
    }).start();               // Start the animation
  }, [selected]);             // Dependency array: run whenever `selected` changes

  // Function called when the card is pressed
  const handlePress = () => {
    // Animate a quick press effect: shrink then expand the card
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }), // shrink
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),    // expand
    ]).start();

    // Toggle the selected state
    setSelected(!selected);

    // Call the optional onPress callback with the new selected state
    if (onPress) onPress(!selected);
  };

  // Interpolate background color based on selection animation
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],                 // 0 = unselected, 1 = selected
    outputRange: ['#E0E0E0', '#4CAF50'], // gray to green
  });

  // Interpolate icon color based on selection
  const iconColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#fff'],      // dark gray to white
  });

  // Interpolate text color based on selection
  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#fff'],      // dark gray to white
  });

  // Render the card
  return (
    // Pressable handles taps on the card
    <Pressable onPress={handlePress}>
      {/* Animated.View allows animating style properties */}
      <Animated.View
        style={[
          styles.card,                   // base styles from StyleSheet
          {
            backgroundColor,             // animated background
            transform: [{ scale: scaleAnim }], // animated scale
            width: CARD_SIZE,            // card width
            height: CARD_SIZE,           // card height
          },
        ]}
      >
        {/* Animated icon inside the card */}
        <Animated.View>
          <Ionicons name={categoryIcons[category]} size={32} color={iconColor as any} />
        </Animated.View>
        {/* Animated text label */}
        <Animated.Text style={[styles.title, { color: textColor }]}>
          {category}                     {/* Show category name */}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

// Export the component for use elsewhere
export default CategoryCard;

// Define styles for the component
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,                 // rounded corners
    justifyContent: 'center',         // center content vertically
    alignItems: 'center',             // center content horizontally
    margin: 8,                        // spacing around the card
    elevation: 6,                     // shadow for Android
    shadowColor: '#000',              // shadow color for iOS
    shadowOpacity: 0.15,              // shadow transparency
    shadowOffset: { width: 0, height: 4 }, // shadow position
    shadowRadius: 6,                  // shadow blur radius
  },
  title: {
    marginTop: 8,                     // space between icon and text
    fontSize: 14,                     // font size of category label
    fontWeight: '600',                // semi-bold text
    textAlign: 'center',              // center the text
  },
});
