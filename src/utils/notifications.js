const admin = require('../utils/firebase.config');
const User = require('../models/User');
const Event = require('../models/Event');

const sendNotificationToUser = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
      console.log(`No device tokens found for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      tokens: user.deviceTokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(user.deviceTokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pull: { deviceTokens: { $in: failedTokens } }
        });
        console.log(`Removed ${failedTokens.length} invalid tokens for user ${userId}`);
      }
    }

    return response;
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
};

const sendEventNotification = async (eventId, notification) => {
  try {
    const tickets = await Ticket.find({ event: eventId })
      .populate('user', '_id');
    
    const userIds = [...new Set(tickets.map(ticket => ticket.user._id.toString()))];
    
    const promises = userIds.map(userId => 
      sendNotificationToUser(userId, notification)
    );
    
    await Promise.all(promises);
    
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error(`Error sending event notification:`, error);
    return { success: false, error: error.message };
  }
};

const sendEventReminder = async (event) => {
  const notification = {
    title: `Reminder: ${event.title}`,
    body: `Your event starts tomorrow at ${event.time}. Location: ${event.location}`,
    data: {
      eventId: event._id.toString(),
      type: 'event_reminder'
    }
  };
  
  return await sendEventNotification(event._id, notification);
};

module.exports = {
  sendNotificationToUser,
  sendEventNotification,
  sendEventReminder
};