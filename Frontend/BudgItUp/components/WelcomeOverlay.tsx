// components/WelcomeOverlay.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/globals';

const { width, height } = Dimensions.get('window');

interface WelcomeOverlayProps {
    visible: boolean;
    userName: string;
    onComplete: () => void;
}

export default function WelcomeOverlay({ visible, userName, onComplete }: WelcomeOverlayProps) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const theme = useTheme();
    const { colors, typography } = theme;

    useEffect(() => {
        if (visible) {
            // Fade in and scale up
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss after 2.5 seconds
            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    onComplete();
                });
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.darkOverlay} />
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                    <Ionicons name="rocket" size={48} color="#fff" />
                </View>
                <Text style={[styles.welcomeText, { color: '#fff', fontFamily: typography.fontFamily.boldHeading }]}>
                    Welcome To Budgit Up!
                </Text>
                <Text style={[styles.nameText, { color: colors.primary, fontFamily: typography.fontFamily.boldHeading }]}>
                    {userName}
                </Text>
                <Text style={[styles.subtitle, { color: '#fff', fontFamily: typography.fontFamily.body }]}>
                    Lets manage your finances together
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    contentContainer: {
        alignItems: 'center',
        padding: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    nameText: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.9,
    },
});