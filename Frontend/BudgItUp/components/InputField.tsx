// components/InputField.tsx
import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Animated,
  Platform,
  Pressable,
} from "react-native";

interface Props {
  placeholder: string;
  icon?: any;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (t: string) => void;
}

export default function InputField({
  placeholder,
  icon,
  secureTextEntry,
  value,
  onChangeText,
}: Props) {
  const focusAnim = React.useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    Animated.timing(focusAnim, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#eee", "#F7A428"],
  });

  const elevation = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 6],
  });

  return (
    <Animated.View style={[styles.container, { borderColor, elevation }]}>
      {icon ? <Image source={icon} style={styles.icon} /> : null}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9A9A9A"
        secureTextEntry={secureTextEntry}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        onChangeText={onChangeText}
      />
      {/* small animated accent on right for life */}
      <Animated.View
        style={[
          styles.accent,
          {
            opacity: focusAnim,
            transform: [{ translateX: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 14,
    tintColor: "#F7A428",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  accent: {
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: "#F7A428",
    marginLeft: 12,
  },
});
