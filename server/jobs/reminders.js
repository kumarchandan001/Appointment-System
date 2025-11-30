// server/jobs/reminders.js
/**
 * Appointment Reminder Cron Job
 * Runs every minute to check for appointments within 60 minutes
 */

const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmailStub');

let isRunning = false;

const startReminders = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const now = new Date();
      const in60Min = new Date(now.getTime() + 60 * 60 * 1000);

      // Find confirmed appointments within 60 minutes
      const appointments = await Appointment.find({
        status: 'confirmed',
        start: { $gte: now, $lte: in60Min },
      })
        .populate('patientId', 'email name')
        .populate('providerId', 'email name');

      for (const appointment of appointments) {
        const timeUntil = Math.round((appointment.start - now) / (1000 * 60));

        sendEmail(
          appointment.patientId.email,
          'Appointment Reminder',
          `Your appointment with ${appointment.providerId.name} is in ${timeUntil} minutes.`
        );

        sendEmail(
          appointment.providerId.email,
          'Appointment Reminder',
          `Upcoming appointment with ${appointment.patientId.name} in ${timeUntil} minutes.`
        );
      }
    } catch (error) {
      console.error('Error in reminder job:', error);
    } finally {
      isRunning = false;
    }
  });

  console.log('✓ Appointment reminder job started');
};

module.exports = startReminders;
