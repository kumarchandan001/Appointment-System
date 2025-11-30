// server/routes/appointments.js
/**
 * Appointment Routes
 * GET / - Get user appointments (role-based)
 * POST / - Book appointment (atomic reservation)
 * PUT /:id - Confirm/reject appointment
 * DELETE /:id - Cancel appointment
 */

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const ProviderProfile = require('../models/ProviderProfile');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmailStub');

const router = express.Router();

/**
 * GET /
 * Get appointments for current user (based on role)
 */
router.get('/', auth, async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'provider') {
      query = { providerId: req.user.id };
    } else if (req.user.role === 'patient') {
      query = { patientId: req.user.id };
    } else {
      query = {};
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('providerId', 'name email phone');

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /
 * Book appointment (atomic reservation to prevent double-booking)
 */
router.post('/', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book appointments' });
    }

    const { providerId, slotId, notes } = req.body;

    console.log('📍 Booking request received:', { providerId, slotId });

    if (!providerId || !slotId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First, let's verify the provider and slot exist
    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      console.log('❌ Provider not found:', providerId);
      return res.status(404).json({ error: 'Provider not found' });
    }

    console.log('✅ Provider found. Total slots:', provider.slots.length);
    console.log('📋 Available slots:', provider.slots.map(s => ({ id: s._id.toString(), booked: s.booked })));

    const targetSlot = provider.slots.find(s => s._id.toString() === slotId.toString());
    if (!targetSlot) {
      console.log('❌ Slot not found. Looking for:', slotId.toString());
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (targetSlot.booked) {
      console.log('❌ Slot already booked:', slotId);
      return res.status(409).json({ error: 'Slot is no longer available. Please select another.' });
    }

    // ATOMIC OPERATION: Prevent double-booking
    // This is the critical part - MongoDB atomic update
    const updatedProfile = await ProviderProfile.findOneAndUpdate(
      {
        _id: providerId,
        'slots._id': new mongoose.Types.ObjectId(slotId),
        'slots.booked': false,
      },
      {
        $set: { 'slots.$.booked': true },
      },
      { new: true }
    );

    if (!updatedProfile) {
      console.log('❌ Atomic update failed for providerId:', providerId, 'slotId:', slotId);
      return res.status(409).json({ error: 'Slot is no longer available. Please select another.' });
    }

    console.log('✅ Slot marked as booked');

    // Find the slot that was just booked
    const bookedSlot = updatedProfile.slots.find((s) => s._id.toString() === slotId.toString());
    if (!bookedSlot) {
      console.log('❌ Could not find booked slot after update');
      return res.status(409).json({ error: 'Slot not found' });
    }

    // Get provider's User ID from ProviderProfile
    const providerUserId = updatedProfile.userId;

    // Create appointment record
    const appointment = new Appointment({
      patientId: req.user.id,
      providerId: providerUserId,
      service: {
        name: 'Service',
        durationMinutes: Math.round(
          (bookedSlot.end - bookedSlot.start) / (1000 * 60)
        ),
        price: 0,
      },
      start: bookedSlot.start,
      end: bookedSlot.end,
      status: 'pending',
      notes,
    });

    await appointment.save();

    // Send notification email
    const patient = await User.findById(req.user.id);
    const providerUser = await User.findById(providerUserId);

    sendEmail(
      patient.email,
      'Appointment Booked',
      `Your appointment with ${providerUser.name} is pending confirmation.`
    );

    sendEmail(
      providerUser.email,
      'New Appointment Request',
      `${patient.name} has booked an appointment. Please confirm or reject.`
    );

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /:id
 * Provider confirms/rejects appointment
 */
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'email')
      .populate('providerId', 'email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only provider can confirm/reject
    if (req.user.role === 'provider' && appointment.providerId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Cannot modify other appointments' });
    }

    // Only patient can cancel
    if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Cannot cancel other appointments' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    // If rejected or cancelled, mark slot as available
    if ((status === 'rejected' || status === 'cancelled') && oldStatus !== 'rejected' && oldStatus !== 'cancelled') {
      const slotStart = appointment.start;
      const slotEnd = appointment.end;
      await ProviderProfile.updateOne(
        { _id: appointment.providerId._id, 'slots.start': slotStart, 'slots.end': slotEnd },
        { $set: { 'slots.$.booked': false } }
      ).catch(() => {}); // Silent fail - slot might not exist
    }

    // Send notification
    if (status === 'confirmed') {
      sendEmail(appointment.patientId.email, 'Appointment Confirmed', 'Your appointment has been confirmed!');
    } else if (status === 'rejected') {
      sendEmail(appointment.patientId.email, 'Appointment Rejected', 'Unfortunately, your appointment request was rejected.');
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /:id
 * Patient cancels appointment and frees up slot
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can cancel appointments' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Cannot cancel other appointments' });
    }

    // Free up the slot
    const provider = await ProviderProfile.findById(appointment.providerId);
    if (provider) {
      const slotIndex = provider.slots.findIndex(
        (slot) =>
          slot.start.getTime() === appointment.start.getTime() &&
          slot.end.getTime() === appointment.end.getTime()
      );

      if (slotIndex !== -1) {
        provider.slots[slotIndex].booked = false;
        await provider.save();
      }
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
