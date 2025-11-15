// components/auth/AuthScreenWrapper.tsx
import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Keyboard,
  Text,
  Dimensions,
  Image,
} from "react-native";

type Props = {
  children: React.ReactNode;
  variant: "login" | "signup";
  behindLabel: string;
  onBehindPress: () => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AuthScreenWrapper({
  children,
  variant,
  behindLabel,
  onBehindPress,
}: Props) {
  // One translateY that moves the whole auth area (decorations + cards)
  const containerTranslateY = React.useRef(new Animated.Value(0)).current;

  // For behind card press feedback
  const behindScale = React.useRef(new Animated.Value(1)).current;

  // Page transition
  const pageOpacity = React.useRef(new Animated.Value(1)).current;
  const pageSlideX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onKeyboardShow = (e: any) => {
    const kbHeight = e?.endCoordinates?.height ?? 320;
    // fraction & cap:
    const shift = Math.min(kbHeight * 0.78, SCREEN_HEIGHT * 0.5);
    Animated.timing(containerTranslateY, {
      toValue: -shift,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const onKeyboardHide = () => {
    Animated.timing(containerTranslateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleBehindPress = () => {
    Animated.sequence([
      Animated.timing(behindScale, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.timing(behindScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    // screen transition: fade out + slide left, call navigation, fade in from right
    Animated.parallel([
      Animated.timing(pageOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(pageSlideX, { toValue: -30, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      onBehindPress();
      // reset then show new screen
      pageOpacity.setValue(0);
      pageSlideX.setValue(30);
      Animated.parallel([
        Animated.timing(pageOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(pageSlideX, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  };

  const isLogin = variant === "login";

  // Layout tuning:
  // Signup: behind top ~110, front marginTop ~200 (lower)
  // Login (variant B requested): behind is slightly lower (160) and front sits higher (more overlap)
  const behindTop = isLogin ? 160 : 110;
  const frontMarginTop = isLogin ? 70 : 200; // login higher overlap (B)

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      {/* move whole composed area with containerTranslateY so decorations & cards move together */}
      <Animated.View style={[styles.composedContainer, { transform: [{ translateY: containerTranslateY }] }]}>
        {/* decorations: top polygon */}
        <View style={styles.container}>
          <View style={[styles.topPolygonWrapper, { top: -20, right: -20 }]}>
            <View style={styles.topPolygon}>
              <Image source={require("../../assets/icons/money-white.png")} style={styles.moneyIcon} />
            </View>
          </View>

          {/* behind (blue) card */}
          <Animated.View
            style={[
              styles.behindCard,
              { top: behindTop },
              { transform: [{ rotate: "-10deg" }, { scale: behindScale }] },
            ]}
          >
            <TouchableOpacity activeOpacity={0.95} onPress={handleBehindPress} style={styles.behindInner}>
              <View style={{ transform: [{ rotate: "10deg" }] }}>
                <Text style={styles.behindLabel}>{behindLabel}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* front card */}
          <View style={[styles.frontWrapper]}>
            <Animated.View style={[styles.frontCard, { marginTop: frontMarginTop, transform: [{ rotate: "-3deg" }, { translateX: pageSlideX }], opacity: pageOpacity }]}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </Animated.View>
          </View>

          {/* bottom polygon */}
          <View style={[styles.bottomPolygonWrapper, { bottom: 20, left: 20 }]}>
            <View style={styles.bottomPolygon}>
              <Image source={require("../../assets/icons/money-white.png")} style={styles.bottomMoneyIcon} />
            </View>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },

  composedContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* Top decorative polygon */
  topPolygonWrapper: {
    position: "absolute",
    width: 115,
    height: 115,
    zIndex: 1,
  },
  topPolygon: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "39deg" }],
  },
  moneyIcon: {
    width: 36,
    height: 36,
    transform: [{ rotate: "39deg" }],
  },

  /* Behind card (blue) */
  behindCard: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 240,
    backgroundColor: "rgba(10,126,164,0.12)",
    borderRadius: 20,
    shadowColor: "rgba(10,126,164,0.12)",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    elevation: 6,
  },
  behindInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  behindLabel: {
    fontSize: 32,
    fontWeight: "700",
    color: "rgba(0,0,0,0.35)",
    marginTop: -50,
  },

  /* Front card */
  frontWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  frontCard: {
    marginHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    shadowColor: "rgba(10,126,164,0.12)",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 420,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  /* Bottom polygon */
  bottomPolygonWrapper: {
    position: "absolute",
    width: 150,
    height: 120,
    zIndex: 1,
  },
  bottomPolygon: {
    flex: 1,
    backgroundColor: "rgba(252,181,59,0.32)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "-6deg" }],
  },
  bottomMoneyIcon: { width: 44, height: 44 },
});
