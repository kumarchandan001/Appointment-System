// server/models/Appointment.js
/**
 * Appointment Schema
 * Tracks bookings between patients and providers
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      durationMinutes: Number,
      price: Number,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
