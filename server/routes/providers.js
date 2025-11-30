// server/routes/providers.js
/**
 * Provider Routes
 * POST / - Create provider profile
 * PUT /:id/slots - Add appointment slots
 * GET / - List all providers
 * GET /:id - Get provider details
 */

const express = require('express');
const { DateTime } = require('luxon');
const auth = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');

const router = express.Router();

/**
 * POST /
 * Create provider profile (provider only)
 */
router.post('/', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can create profiles' });
    }

    const { title, specialties, services } = req.body;

    if (!title || !specialties || !services) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if profile already exists - if so, update it instead
    let profile = await ProviderProfile.findOne({ userId: req.user.id });
    if (profile) {
      // Update existing profile
      profile.title = title;
      profile.specialties = specialties;
      profile.services = services;
      await profile.save();
      return res.status(200).json(profile);
    }

    // Create new profile
    profile = new ProviderProfile({
      userId: req.user.id,
      title,
      specialties,
      services,
      slots: [],
    });

    await profile.save();

    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /:id/slots
 * Add appointment slots (provider only)
 * Converts client-provided ISO strings to UTC
 */
router.put('/:id/slots', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can manage slots' });
    }

    const { id } = req.params;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Invalid slots format' });
    }

    const profile = await ProviderProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Cannot modify other provider profiles' });
    }

    // Convert ISO strings to UTC dates
    const convertedSlots = slots.map((slot) => {
      const start = DateTime.fromISO(slot.start).toUTC().toJSDate();
      const end = DateTime.fromISO(slot.end).toUTC().toJSDate();

      return {
        start,
        end,
        booked: false,
      };
    });

    // Add new slots
    profile.slots.push(...convertedSlots);
    await profile.save();

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /
 * List all providers with basic info
 * If authenticated provider, returns their own profile if they have one
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    // If authenticated and is provider, check for their profile first
    if (req.user && req.user.role === 'provider') {
      const profile = await ProviderProfile.findOne({ userId: req.user.id }).populate(
        'userId',
        'name email phone'
      );
      if (profile) {
        const availableSlots = profile.slots.filter((slot) => !slot.booked);
        return res.json({
          isOwn: true,
          id: profile._id,
          userId: profile.userId._id,
          name: profile.userId.name,
          email: profile.userId.email,
          phone: profile.userId.phone,
          title: profile.title,
          specialties: profile.specialties,
          services: profile.services,
          slots: profile.slots,
          availableSlots: availableSlots,
        });
      }
      // No profile found yet, return empty own profile indicator
      return res.json({ isOwn: true, slots: [], availableSlots: [] });
    }

    // Otherwise return all providers (for patient/public view)
    const providers = await ProviderProfile.find().populate('userId', 'name email phone');

    const formattedProviders = providers.map((p) => ({
      id: p._id,
      userId: p.userId._id,
      name: p.userId.name,
      email: p.userId.email,
      phone: p.userId.phone,
      title: p.title,
      specialties: p.specialties,
      services: p.services,
    }));

    res.json(formattedProviders);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:id
 * Get provider profile with all slots (booked and available)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id).populate(
      'userId',
      'name email phone timeZone'
    );

    if (!profile) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Return all slots (both booked and available) for dashboard view
    const allSlots = profile.slots;
    
    // Also return available slots for patient booking
    const availableSlots = profile.slots.filter((slot) => !slot.booked);

    res.json({
      id: profile._id,
      userId: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      title: profile.title,
      specialties: profile.specialties,
      services: profile.services,
      slots: allSlots,
      availableSlots: availableSlots,
      timeZone: profile.timeZone,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
