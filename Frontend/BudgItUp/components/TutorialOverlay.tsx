// components/TutorialOverlay.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/globals';
import { TutorialStep } from '@/app/context/tutorialContext';

const { width, height } = Dimensions.get('window');

interface TutorialOverlayProps {
    visible: boolean;
    steps: TutorialStep[];
    onComplete: () => void;
    onSkip: () => void;
}

export default function TutorialOverlay({
                                            visible,
                                            steps,
                                            onComplete,
                                            onSkip,
                                        }: TutorialOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(0));
    const theme = useTheme();
    const { colors, typography } = theme;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, currentStep]);

    if (!visible || steps.length === 0) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentStep(currentStep + 1);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentStep(currentStep - 1);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }
    };

    const getArrowPosition = () => {
        switch (step.position) {
            case 'top':
                return { top: height * 0.15, left: width * 0.5 - 20 };
            case 'bottom':
                return { bottom: height * 0.25, left: width * 0.5 - 20 };
            case 'left':
                return { top: height * 0.3, left: 50 };
            case 'right':
                return { top: height * 0.3, right: 50 };
            case 'center':
            default:
                return { top: height * 0.4, left: width * 0.5 - 20 };
        }
    };

    const getTooltipPosition = () => {
        switch (step.position) {
            case 'top':
                return { top: height * 0.2, left: 20, right: 20 };
            case 'bottom':
                return { bottom: height * 0.3, left: 20, right: 20 };
            case 'left':
                return { top: height * 0.35, left: 20, right: width * 0.2 };
            case 'right':
                return { top: height * 0.35, right: 20, left: width * 0.2 };
            case 'center':
            default:
                return { top: height * 0.45, left: 20, right: 20 };
        }
    };

    const getArrowRotation = () => {
        switch (step.position) {
            case 'top':
                return '180deg';
            case 'bottom':
                return '0deg';
            case 'left':
                return '90deg';
            case 'right':
                return '270deg';
            case 'center':
            default:
                return '180deg';
        }
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={styles.overlay}>
                {/* Dark overlay */}
                <View style={styles.darkOverlay} />

                {/* Animated Arrow */}
                <Animated.View
                    style={[
                        styles.arrowContainer,
                        getArrowPosition(),
                        {
                            opacity: fadeAnim,
                            transform: [{ rotate: getArrowRotation() }],
                        },
                    ]}
                >
                    <Ionicons name="arrow-down" size={40} color={colors.primary} />
                </Animated.View>

                {/* Tooltip */}
                <Animated.View
                    style={[
                        styles.tooltip,
                        { backgroundColor: colors.card },
                        getTooltipPosition(),
                        { opacity: fadeAnim },
                    ]}
                >
                    <View style={styles.tooltipHeader}>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={[
                                    styles.tooltipTitle,
                                    { color: colors.text, fontFamily: typography.fontFamily.boldHeading },
                                ]}
                            >
                                {step.title}
                            </Text>
                            <Text
                                style={[
                                    styles.stepIndicator,
                                    { color: colors.muted, fontFamily: typography.fontFamily.body },
                                ]}
                            >
                                Step {currentStep + 1} of {steps.length}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onSkip} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={28} color={colors.muted} />
                        </TouchableOpacity>
                    </View>

                    <Text
                        style={[
                            styles.tooltipDescription,
                            { color: colors.text, fontFamily: typography.fontFamily.body },
                        ]}
                    >
                        {step.description}
                    </Text>

                    {/* Progress dots */}
                    <View style={styles.progressDots}>
                        {steps.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            index === currentStep ? colors.primary : colors.muted,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Navigation buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handlePrevious}
                            disabled={currentStep === 0}
                            style={[
                                styles.navButton,
                                {
                                    backgroundColor: currentStep === 0 ? colors.muted : colors.background,
                                    borderColor: colors.primary,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.navButtonText,
                                    { color: currentStep === 0 ? colors.background : colors.primary },
                                ]}
                            >
                                Previous
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleNext}
                            style={[styles.navButton, { backgroundColor: colors.primary }]}
                        >
                            <Text style={[styles.navButtonText, { color: '#fff' }]}>
                                {isLastStep ? 'Got it!' : 'Next'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        position: 'relative',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    arrowContainer: {
        position: 'absolute',
        width: 40,
        height: 40,
    },
    tooltip: {
        position: 'absolute',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    tooltipHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tooltipTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    stepIndicator: {
        fontSize: 12,
        marginTop: 2,
    },
    closeButton: {
        marginLeft: 10,
    },
    tooltipDescription: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});