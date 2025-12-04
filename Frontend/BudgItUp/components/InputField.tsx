// components/InputField.tsx
import { useTheme } from "@/theme/globals";
import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Animated,
  Platform,
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
  const theme = useTheme();
  const { typography, colors } = theme;

  const focusAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  };


  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.card, colors.card],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.16],
  });

  return (
      <Animated.View
          style={[
            styles.container,
            {
              borderColor: colors.main,
              backgroundColor: bgColor,
              shadowOpacity,
            },
          ]}
      >
        {icon ? <Image source={icon} style={[styles.icon, { tintColor: colors.primary }]} /> : null}
        <TextInput
            style={[
              styles.input,
              { fontFamily: typography.fontFamily.buttonText, color: colors.text },
            ]}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            onChangeText={onChangeText}
        />
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 40,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    width: 24,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },
});
