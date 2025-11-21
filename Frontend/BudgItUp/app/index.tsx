import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground} from 'react-native';
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
      <ImageBackground
      source={require('@/assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      >
      <View style={styles.container}>

        {/* ICON */}
        <Image
            source={require('@/assets/images/auth-illustration.png')}
            style={styles.icon}
        />

        {/* TITLE */}
        <Text style={[styles.title, {fontFamily: typography.fontFamily.boldHeading}]}>Welcome to BudgitUp!</Text>
        <Text style={[styles.subtitle, {fontFamily: typography.fontFamily.body}]}>Think of us as your personal finance companion.</Text>

        <Text style={[styles.paragraph, {fontFamily: typography.fontFamily.body}]}>Track expenses, spot spending patterns, and make smarter money decisions, all without the hassle.</Text>


        <Button title='Get Started →' onPress={handlePress}/>

      </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

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
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    textAlign: "center",
    alignSelf: 'center',
  },

  paragraph:{
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
    textAlign: "center",
    alignSelf: 'center',
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
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
});