// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add platform-specific extension resolution
config.resolver.sourceExts = [
    "web.tsx",
    "web.ts",
    "web.jsx",
    "web.js",
    ...config.resolver.sourceExts,
];

// Replace react-native-maps with an empty module on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
    // If requesting react-native-maps on web, return empty module
    if (platform === "web" && moduleName === "react-native-maps") {
        return {
            type: "empty",
        };
    }
    // Fallback to default resolution
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
