// server/models/ProviderProfile.js
/**
 * Provider Profile Schema
 * Stores provider details, services, and available slots
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: String,
  durationMinutes: Number,
  price: Number,
});

const slotSchema = new mongoose.Schema({
  start: Date,
  end: Date,
  booked: {
    type: Boolean,
    default: false,
  },
});

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    specialties: [String],
    services: [serviceSchema],
    slots: [slotSchema],
    timeZone: {
      type: String,
      default: 'UTC',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
