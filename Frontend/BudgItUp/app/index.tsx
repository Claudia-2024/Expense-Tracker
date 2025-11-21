import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/global';

export default function SplashScreenPage() {
  const theme = useTheme();
  const { colors, typography, spacing, radius } = theme;
  const router = useRouter();

  const handlePress = () => {
    router.push('/auth/signup');

  };

  return (
      <View style={styles.container}>

        {/* ICON */}
        <Image
            source={require('@/assets/images/auth-illustration.png')}   // <-- put the icon here
            style={styles.icon}
        />

        {/* TITLE */}
        <Text style={styles.title}>Welcome to BudgeItUp!</Text>
        <Text style={styles.subtitle}>Build better budgets and take control of your expenses.</Text>


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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20
  },

  icon: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F4B61A',     // yellow
    marginBottom: 10
  },

  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 40
  },

  buttonPrimary: {
    width: '80%',
    backgroundColor: '#1E88E5',  // blue
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },

  buttonPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },

  buttonSecondary: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1E88E5',
    alignItems: 'center',
  },

  buttonSecondaryText: {
    color: '#1E88E5',
    fontSize: 17,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
});
