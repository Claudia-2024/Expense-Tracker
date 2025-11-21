// components/InputField.tsx
import { useTheme } from "@/theme/global";
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

const PRIMARY = "#348DDB";
const SECONDARY = "#FCB53B";


export default function InputField({
  placeholder,
  icon,
  secureTextEntry,
  value,
  onChangeText,
}: Props) {
  const focusAnim = React.useRef(new Animated.Value(0)).current;
       const theme = useTheme();
  const { typography } = theme;

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

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D4E6FB", SECONDARY],
  });

  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffffff", "#FFFFFF"],
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
          borderColor,
          backgroundColor: bgColor,
          shadowOpacity,
        },
      ]}
    >
      {icon ? <Image source={icon} style={styles.icon} /> : null}
      <TextInput
        style={[{fontFamily: typography.fontFamily.body},styles.input]}
        placeholder={placeholder}
        placeholderTextColor="rgba(52,141,219,0.65)"
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
    shadowColor: "#F6FAFF",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    
  },
  icon: {
    width: 24,
    height: 20,
    marginRight: 10,
    tintColor: SECONDARY,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2A37",
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },
});
