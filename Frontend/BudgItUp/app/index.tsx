import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SplashScreenPage() {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const handlePress = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      router.push('/auth/signup');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BudgeItUp</Text>

      <Animated.View >
        <TouchableOpacity onPress={handlePress} style={styles.button}>
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 50 },
  slider: { width: '80%' },
  button: { backgroundColor: '#4f46e5', padding: 15, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
