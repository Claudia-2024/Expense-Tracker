import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/global';
import Button from '@/components/buttons/button';

const { width } = Dimensions.get('window');

export default function SplashScreenPage() {
    const theme = useTheme();
    const { colors, typography, spacing, radius } = theme;  
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
      <Text style={{fontFamily:typography.fontFamily.boldHeading}}>Welcome to BudgeItUp</Text>
        <Button title='Get Started' onPress={handlePress}/>
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
