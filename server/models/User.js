// server/models/User.js
/**
 * User Schema
 * Supports: Patient, Provider, Admin roles
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['patient', 'provider', 'admin'],
      default: 'patient',
    },
    phone: {
      type: String,
      trim: true,
    },
    timeZone: {
      type: String,
      default: 'UTC',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
