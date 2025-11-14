import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();

  const handleSignup = () => {
    // Here you can add signup logic
    router.push('/category-selector/choseCategory'); // After signup, go to category selection
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Already have an account? Login" onPress={() => router.push('/auth/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
