const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// In Expo Go (SDK 53+), remote push notifications are not supported.
// We replace expo-notifications with a no-op mock to prevent the crash.
const isExpoGo = process.env.EXPO_PUBLIC_IS_EXPO_GO === 'true' ||
  process.env.EXPO_RUNTIME_VERSION === undefined;

config.resolver = config.resolver || {};

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-notifications') {
    // Always use the mock — swap to real module only in a proper dev/prod build
    // by removing this metro.config.js override or checking a build flag.
    // For Expo Go usage, the mock prevents the SDK 53 crash.
    const mockPath = path.resolve(__dirname, 'src/config/notifications-mock.js');
    return {
      filePath: mockPath,
      type: 'sourceFile',
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
