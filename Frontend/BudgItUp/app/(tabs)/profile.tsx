// app/(tabs)/profile.tsx - REAL-TIME CURRENCY UPDATE
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import InputField from "@/components/InputField";
import { useTheme } from "@/theme/globals";
import ApiService, { UserProfileDto } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Image } from "react-native";
import { useTutorial } from "../context/tutorialContext";
import TutorialOverlay from "@/components/TutorialOverlay";
import { useCurrency } from "../context/currencyContext"; // UPDATED IMPORT

export default function ProfilePage() {
    const theme = useTheme();
    const { typography, colors, themeMode, setThemeMode, colorScheme } = theme;
    const { hasSeenTutorial, markTutorialAsSeen, resetAllTutorials } = useTutorial();
    const { currency: currentCurrency, updateCurrency } = useCurrency(); // REAL-TIME CURRENCY

    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [email, setEmail] = useState("");
    const [currency, setCurrency] = useState("XAF");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    const tutorialSteps = [
        {
            id: 'profile_info',
            title: 'Profile Information',
            description: 'View and update your personal information. Your name and phone are read-only, but you can change your email and preferences.',
            position: 'center' as const,
        },
        {
            id: 'profile_theme',
            title: 'Theme Settings',
            description: 'Choose between Light, Dark, or System Default theme. The app will update instantly based on your preference.',
            position: 'center' as const,
        },
        {
            id: 'profile_currency',
            title: 'Currency Preference',
            description: 'Select your preferred currency for displaying amounts throughout the app.',
            position: 'center' as const,
        },
        {
            id: 'profile_save',
            title: 'Save Changes',
            description: 'Tap "Save Changes" to update your email and currency preferences. Changes are synced immediately.',
            position: 'bottom' as const,
        },
        {
            id: 'profile_logout',
            title: 'Logout',
            description: 'Tap here to safely log out of your account. Your data is securely saved and will be available when you log back in.',
            position: 'bottom' as const,
        },
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        const checkTutorial = async () => {
            const seen = await hasSeenTutorial('profile');
            if (!seen && !loading) {
                setTimeout(() => setShowTutorial(true), 500);
            }
        };
        checkTutorial();
    }, [loading]);

    const handleTutorialComplete = async () => {
        await markTutorialAsSeen('profile');
        setShowTutorial(false);
    };

    const handleTutorialSkip = async () => {
        await markTutorialAsSeen('profile');
        setShowTutorial(false);
    };

    const loadProfile = async () => {
        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) {
                Alert.alert("Error", "Please log in again");
                router.replace("/auth/login");
                return;
            }

            const userId = parseInt(userIdStr);
            const profileData = await ApiService.getUserProfile(userId);

            setProfile(profileData);
            setEmail(profileData.email);
            setCurrency(profileData.defaultCurrency);
        } catch (error: any) {
            console.error("Error loading profile:", error);
            Alert.alert("Error", "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSaveProfile = async () => {
        if (!profile) return;

        if (!email.trim()) {
            Alert.alert("Error", "Email cannot be empty");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        setSaving(true);

        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) {
                throw new Error("User ID not found");
            }

            const userId = parseInt(userIdStr);

            // Update user profile with email and currency
            const updatedProfile = await ApiService.updateUserProfile(userId, {
                email: email.trim().toLowerCase(),
                defaultCurrency: currency,
            } as Partial<UserProfileDto>);

            setProfile(updatedProfile);

            // Update stored email
            await AsyncStorage.setItem('userEmail', updatedProfile.email);

            // 🔥 REAL-TIME CURRENCY UPDATE - This triggers re-render everywhere!
            await updateCurrency(currency);

            Alert.alert("Success", "Profile updated successfully! Currency has been updated everywhere.");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: async () => {
                        try {
                            const userIdStr = await AsyncStorage.getItem('userId');
                            if (userIdStr) {
                                await ApiService.logout(parseInt(userIdStr));
                            }
                            router.replace("/auth/login");
                        } catch (error) {
                            console.error("Logout error:", error);
                            router.replace("/auth/login");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleResetTutorials = async () => {
        Alert.alert(
            "Rewatch Tutorials",
            "This will reset all tutorial progress. You'll see tutorials again on each page.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: async () => {
                        await resetAllTutorials();
                        Alert.alert("Success", "Restart the app to see them again.");
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 10 }}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.title, { fontFamily: typography.fontFamily.boldHeading, color: colors.main }]}>
                    Profile Settings
                </Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                            Name
                        </Text>
                        <InputField
                            placeholder="Name"
                            icon={require("../../assets/icons/user.png")}
                            value={profile?.name || ""}
                            onChangeText={() => {}}
                            editable={false}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                            Email
                        </Text>
                        <InputField
                            placeholder="Email"
                            icon={require("../../assets/icons/email.png")}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                            Phone Number
                        </Text>
                        <InputField
                            placeholder="Phone number"
                            icon={require("../../assets/icons/phone.png")}
                            value={profile?.phone || ""}
                            onChangeText={() => {}}
                            editable={false}
                        />
                    </View>

                    <View style={{marginBottom: 8}}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                            Theme
                        </Text>
                        <View style={[{borderColor: colors.main },styles.pickerWrapper]}>
                            <Image
                                source={require("../../assets/icons/check.png")}
                                style={[styles.pickerIcon, { tintColor: colors.primary }]}
                            />
                            <Picker
                                selectedValue={themeMode}
                                style={[styles.picker, { color: colors.text, backgroundColor: colors.card, fontFamily: typography.fontFamily.body }]}
                                onValueChange={(value: "light" | "dark" | "system") => {
                                    if (value === "system") {
                                        const systemTheme = colorScheme === "dark" ? "dark" : "light";
                                        setThemeMode(systemTheme);
                                    } else {
                                        setThemeMode(value);
                                    }
                                }}
                            >
                                <Picker.Item label="Light" value="light" />
                                <Picker.Item label="Dark" value="dark" />
                                <Picker.Item label="System Default" value="system" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
                            Currency
                        </Text>
                        <View style={[{borderColor: colors.main },styles.pickerWrapper]}>
                            <Image
                                source={require("../../assets/icons/user.png")}
                                style={[styles.pickerIcon, { tintColor: colors.primary }]}
                            />
                            <Picker
                                selectedValue={currency}
                                style={[styles.picker, { color: colors.text, backgroundColor: colors.card, fontFamily: typography.fontFamily.body }]}
                                onValueChange={(v) => setCurrency(v)}
                            >
                                <Picker.Item label="US Dollar ($)" value="USD" />
                                <Picker.Item label="Euro (€)" value="EUR" />
                                <Picker.Item label="Franc CFA (XAF)" value="XAF" />
                                <Picker.Item label="British Pound (£)" value="GBP" />
                                <Picker.Item label="Nigerian Naira (₦)" value="NGN" />
                                <Picker.Item label="Ghanaian Cedi (GH₵)" value="GHS" />
                                <Picker.Item label="Kenyan Shilling (KSh)" value="KES" />
                                <Picker.Item label="South African Rand (R)" value="ZAR" />
                            </Picker>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                        onPress={handleSaveProfile}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutBtn, { backgroundColor: colors.red }]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.resetBtn, { backgroundColor: colors.muted, marginTop: 20 }]}
                        onPress={handleResetTutorials}
                    >
                        <Text style={styles.resetText}>Reset All Tutorials</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TutorialOverlay
                visible={showTutorial}
                steps={tutorialSteps}
                onComplete={handleTutorialComplete}
                onSkip={handleTutorialSkip}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        alignItems: "center",
        paddingTop: 60
    },
    card: {
        width: "100%",
        padding: 20,
        borderRadius: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 20
    },
    field: {
        marginBottom: 8
    },
    label: {
        marginBottom:10
    },
    pickerWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 40,
        overflow: "hidden"
    },
    pickerIcon: {
        width: 24,
        height: 24,
        marginLeft: 10
    },
    picker: {
        flex: 1,
        height: 54
    },
    saveBtn: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center"
    },
    saveBtnText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16
    },
    logoutBtn: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center"
    },
    logoutText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16
    },
    resetBtn: {
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center"
    },
    resetText: {
        color: "white",
        fontWeight: "500",
        fontSize: 14
    },
});