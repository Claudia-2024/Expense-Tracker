import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/global';
import Button from '@/components/buttons/button';

export default function SplashScreenPage() {
    const theme = useTheme();
    const { colors, typography, spacing, radius } = theme;  
  const router = useRouter();

  const handlePress = () => {
    router.push('/auth/signup');
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BudgeItUp</Text>
      
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Text style={styles.buttonText}>Get Started →</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 50 
  },
  button: { 
    backgroundColor: '#4f46e5', 
    padding: 15, 
    borderRadius: 25, 
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
  },
});