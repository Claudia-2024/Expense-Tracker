import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useTheme } from '@/theme/global';
import { Ionicons } from '@expo/vector-icons';

const Statistics = () => {
    const theme = useTheme();
    const { colors, typography } = theme;

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.boldHeading }]}>
                    Statistics
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted, fontFamily: typography.fontFamily.body }]}>
                    Track your spending patterns
                </Text>
            </View>

            <View style={styles.placeholderContainer}>
                <Ionicons name="stats-chart-outline" size={80} color={colors.muted} />
                <Text style={[styles.placeholderText, { color: colors.muted, fontFamily: typography.fontFamily.body }]}>
                    Statistics feature coming soon!
                </Text>
                <Text style={[styles.placeholderSubtext, { color: colors.muted, fontFamily: typography.fontFamily.body }]}>
                    You'll be able to view detailed charts and insights about your spending habits.
                </Text>
            </View>
        </ScrollView>
    );
};

export default Statistics;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
    },
    placeholderSubtext: {
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
        lineHeight: 20,
    },
});