import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

// In Expo Go (SDK 53+), expo-notifications is replaced by a no-op mock via metro.config.js.
// In a real development build or production build, the real module is used.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    console.log('[Notifications] Unsupported platform — skipping');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return false;
  }

  return true;
};

export const registerForPushNotifications = async () => {
  try {
    if (!(await requestNotificationPermissions())) return null;

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectConfig: { projectId: 'your-expo-project-id' },
    });

    if (!expoPushToken) return null;

    await api.put('/auth/fcm-token', { fcmToken: expoPushToken });
    console.log('[Notifications] FCM token registered:', expoPushToken);

    return expoPushToken;
  } catch (error) {
    console.error('[Notifications] Registration failed:', error);
    return null;
  }
};

export const setupNotificationListeners = (onNotificationReceived) => {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Notifications] Received:', notification);
    if (onNotificationReceived) onNotificationReceived(notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Notifications] Response:', response);
  });

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
};
