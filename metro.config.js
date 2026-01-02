// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// DO NOT put web extensions at the beginning of sourceExts.
// Metro automatically handles platform extensions (ios, android, web).
// Adding them here explicitly is only needed if you have custom logic,
// but they should follow the default order to prioritize native on native.
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "web.tsx",
  "web.ts",
  "web.jsx",
  "web.js",
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

module.exports = withNativeWind(config, { input: "./client/global.css" });
