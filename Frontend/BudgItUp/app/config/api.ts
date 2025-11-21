// constants/api.ts

import { Platform } from "react-native";
import * as Network from "expo-network";

// Default for emulator
let BASE_URL = "http://10.0.2.2:8080";

// If running on a physical device with Expo Go → use local IP
export async function getApiUrl() {
    const ip = await Network.getIpAddressAsync();

    // If physical device (NOT emulator)
    if (Platform.OS !== "android" || !__DEV__) {
        return `http://${ip}:8080`;
    }

    return BASE_URL;
}
