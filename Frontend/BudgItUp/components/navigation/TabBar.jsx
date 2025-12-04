// components/navigation/TabBar.tsx - UPDATED to go to add page
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/globals';
import { router } from 'expo-router';

const TabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
      <View
          style={[
            styles.tabBar,
            {
              position: "absolute",
              bottom: 0,
              width: "100%",
              alignItems: "center",
              paddingBottom: insets.bottom ? insets.bottom - 8 : 10,
            },
          ]}
      >
        <View style={styles.tabBackground} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
              options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                      ? options.title
                      : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          // Special case for floating middle button (e.g., '+')
          // FIXED: Now goes to the add tab which is the add.tsx page
          if (label === '+') {
            return (
                <TouchableOpacity
                    key={label}
                    accessibilityRole="button"
                    onPress={() => {
                      // Navigate to the add tab (add.tsx)
                      navigation.navigate('add');
                    }}
                    style={styles.centerButtonWrapper}
                >
                  <View
                      style={[
                        styles.centerButton,
                        { backgroundColor: colors.secondary },
                      ]}
                  >
                    <Text style={styles.plus}>+</Text>
                  </View>
                </TouchableOpacity>
            );
          }

          // Regular tab buttons
          return (
              <TouchableOpacity
                  key={label}
                  accessibilityRole="button"
                  onPress={onPress}
                  style={styles.tabButton}
              >
                <Ionicons
                    name={
                      label === 'Home'
                          ? isFocused
                              ? 'home'
                              : 'home-outline'
                          : label === 'History'
                              ? isFocused
                                  ? 'swap-horizontal'
                                  : 'swap-horizontal-outline'
                              : label === 'Stats'
                                  ? isFocused
                                      ? 'bar-chart'
                                      : 'bar-chart-outline'
                                  : label === 'Profile'
                                      ? isFocused
                                          ? 'person'
                                          : 'person-outline'
                                      : 'ellipse'
                    }
                    size={22}
                    color={isFocused ? colors.secondary : colors.muted}
                />
                <Text
                    style={[
                      styles.label,
                      {
                        color: isFocused ? colors.secondary : colors.muted,
                        fontFamily: typography.fontFamily.buttonText,
                        fontSize: typography.fontSize.sm,
                      },
                    ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
          );
        })}
      </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopColor: '#E0E0E0',
    backgroundColor: "#F6F6F6",
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopWidth: 4,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 80 : 70,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  centerButtonWrapper: {
    top: -25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#02193dff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  plus: {
    fontSize: 40,
    top: -5,
    color: '#fff',
    fontWeight: '600',
  },
});