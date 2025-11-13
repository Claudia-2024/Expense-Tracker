import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/buttons/button'; 
import { useTheme } from '../../theme/global';

export default function TestScreen() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.lg,
          marginBottom: theme.spacing.lg,
        }}
      >
        Test Buttons
      </Text>

      {/* Primary Button */}
      <Button title="Primary Button" onPress={() => alert('Primary pressed')} />

      {/* Secondary Button */}
      <Button
        title="Secondary Button"
        variant="secondary"
        onPress={() => alert('Secondary pressed')}
        style={{ marginTop: theme.spacing.md }}
      />

      {/* Outline Button */}
      <Button
        title="Outline Button"
        variant="outline"
        onPress={() => alert('Outline pressed')}
        style={{ marginTop: theme.spacing.md }}
      />

      {/* Disabled Button */}
      <Button
        title="Disabled"
        disabled
        style={{ marginTop: theme.spacing.md }}
      />

      {/* Loading Button */}
      <Button
        title="Loading..."
        loading
        style={{ marginTop: theme.spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
