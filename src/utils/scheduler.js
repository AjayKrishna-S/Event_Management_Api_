const cron = require('node-cron');
const Event = require('../models/Event');
const { sendEventReminder } = require('./notifications');


const sendDailyEventReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const events = await Event.find({
      date: {
        $gte: tomorrow,
        $lte: endOfTomorrow
      }
    });
    
    console.log(`Sending reminders for ${events.length} events happening tomorrow`);
    
    for (const event of events) {
      await sendEventReminder(event);
    }
    
    console.log('Daily event reminders sent successfully');
  } catch (error) {
    console.error('Error sending daily event reminders:', error);
  }
};

cron.schedule('0 9 * * *', async () => {
  console.log('Running daily event reminder job...');
  await sendDailyEventReminders();
});

module.exports = {
  sendDailyEventReminders
};