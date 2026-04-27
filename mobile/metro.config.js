const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// In Expo Go (SDK 53+), remote push notifications are not supported.
// We replace expo-notifications with a no-op mock to prevent the crash.
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Only mock in Expo Go environment
  if (
    moduleName === 'expo-notifications' &&
    process.env.EXPO_PUBLIC_IS_EXPO_GO === 'true'
  ) {
    const mockPath = path.resolve(__dirname, 'src/config/notifications-mock.js');
    return { filePath: mockPath, type: 'sourceFile' };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
