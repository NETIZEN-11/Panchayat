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
      body: message,
      type,
      relatedId: referenceId,
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
        data: { type, relatedId: referenceId?.toString() }
      });
      */
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

/**
 * Send notification to all users in a village
 * @param {string} village - Village name
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Type of notification
 * @param {string} excludeUserId - User to exclude (e.g., the sender)
 */
exports.sendToVillage = async (village, title, message, type = 'announcement', excludeUserId = null) => {
  try {
    const query = { village };
    if (excludeUserId) query._id = { $ne: excludeUserId };

    const users = await User.find(query);
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      body: message,
      type,
    }));

    await Notification.insertMany(notifications);
    console.log(`[VILLAGE NOTIFICATION] Sent "${title}" to ${users.length} users in ${village}`);
    return true;
  } catch (error) {
    console.error('Error sending village notification:', error);
    return false;
  }
};
