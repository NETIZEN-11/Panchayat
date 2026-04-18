const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send a notification to a specific user
 * @param {string} userId - ID of the user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Type of notification (complaint, announcement, etc)
 * @param {string} referenceId - Optional ID of the related object
 */
exports.sendNotification = async (userId, title, message, type = 'complaint', referenceId = null) => {
  try {
    // 1. Save to database
    await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
    });

    // 2. Mock Push Notification (FCM logic would go here)
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      console.log(`[PUSH NOTIFICATION] Sending to ${user.name} (${user.fcmToken}): ${title} - ${message}`);
      // In production, you would use firebase-admin here:
      /*
      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body: message },
        data: { type, relatedId: relatedId?.toString() }
      });
      */
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};
