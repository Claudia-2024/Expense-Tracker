// app/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreenPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Optional logo/image */}
      <Image
        source={require('../../assets/images/icon.png')} // replace with your own image
        style={styles.image}
        resizeMode="contain"
      />

      {/* App title */}
      <Text style={styles.title}>BudgeItUp</Text>

      {/* Intro description */}
      <Text style={styles.subtitle}>
        Track your expenses, manage your budget, and reach your financial goals effortlessly.
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/auth/signup')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f46e5', // dark purple background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#4f46e5',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
