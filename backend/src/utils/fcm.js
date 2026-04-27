const admin = require('firebase-admin');

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail ||
      projectId === 'your_firebase_project_id' ||
      privateKey === 'your_firebase_private_key') {
    console.log('[FCM] Firebase credentials not configured — push notifications disabled');
    return false;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });
    firebaseInitialized = true;
    console.log('[FCM] Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('[FCM] Failed to initialize Firebase:', error.message);
    return false;
  }
};

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!firebaseInitialized) initializeFirebase();
  if (!firebaseInitialized) return false;

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).filter(([, v]) => v != null)
      ),
      android: {
        priority: 'high',
        notification: {
          channelId: 'panchayat_notifications',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    await admin.messaging().send(message);
    return true;
  } catch (error) {
    if (error.code === 'messaging/registration-token-not-registered') {
      console.log(`[FCM] Stale token for user — ignoring`);
    } else {
      console.error('[FCM] Send error:', error.message);
    }
    return false;
  }
};

module.exports = { initializeFirebase, sendPushNotification };
