import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/global';

export default function Login() {
  const router = useRouter();
    const theme = useTheme();
    const {typography} = theme;

  const handleLogin = () => {
    // Login logic
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={{fontFamily: typography.fontFamily.boldHeading}}>Login</Text>
      <Button title="Login" onPress={handleLogin} />
      <Button title="Don't have an account? Sign Up" onPress={() => router.push('/auth/signup')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
