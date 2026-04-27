// Mock for expo-notifications used in Expo Go (SDK 53+)
// Remote push notifications are not supported in Expo Go from SDK 53 onwards.
const noop = () => {};
const noopAsync = async () => {};
const noopSubscription = { remove: noop };

module.exports = {
  setNotificationHandler: noop,
  getPermissionsAsync: async () => ({ status: 'undetermined' }),
  requestPermissionsAsync: async () => ({ status: 'denied' }),
  getExpoPushTokenAsync: async () => ({ data: null }),
  addNotificationReceivedListener: () => noopSubscription,
  addNotificationResponseReceivedListener: () => noopSubscription,
  removeNotificationSubscription: noop,
  scheduleNotificationAsync: noopAsync,
  cancelScheduledNotificationAsync: noopAsync,
  cancelAllScheduledNotificationsAsync: noopAsync,
  getBadgeCountAsync: async () => 0,
  setBadgeCountAsync: noopAsync,
};
