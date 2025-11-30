// seed.js
/**
 * Seed Database with Demo Data
 * Run: npm run seed
 */

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DateTime } = require('luxon');

const User = require('./server/models/User');
const ProviderProfile = require('./server/models/ProviderProfile');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await ProviderProfile.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create provider user
    const providerPassword = await bcrypt.hash('provider123', 10);
    const provider = await User.create({
      name: 'Dr. Shiv Kumar',
      email: 'provider@example.com',
      passwordHash: providerPassword,
      role: 'provider',
      phone: '+91 9383839393',
      timeZone: 'Asia/kolkata',
    });
    console.log('✓ Created provider user');

    // Create provider profile with services and slots
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slots = [];
    // Add 5 future slots starting tomorrow
    for (let i = 0; i < 5; i++) {
      const slotDate = new Date(tomorrow);
      slotDate.setDate(slotDate.getDate() + i);
      slotDate.setHours(10, 0, 0, 0);

      const start = slotDate;
      const end = new Date(slotDate);
      end.setMinutes(end.getMinutes() + 30);

      slots.push({
        start: DateTime.fromJSDate(start).toUTC().toJSDate(),
        end: DateTime.fromJSDate(end).toUTC().toJSDate(),
        booked: false,
      });
    }

    const providerProfile = await ProviderProfile.create({
      userId: provider._id,
      title: 'Dermatologist',
      specialties: ['Skin Care', 'Acne Treatment', 'Anti-aging'],
      services: [
        {
          name: '30-min Consultation',
          durationMinutes: 30,
          price: 75,
        },
        {
          name: '60-min Comprehensive',
          durationMinutes: 60,
          price: 150,
        },
      ],
      slots,
      timeZone: 'America/New_York',
    });
    console.log('✓ Created provider profile with 5 slots');

    // Create patient user
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patient = await User.create({
      name: 'John Smith',
      email: 'patient@example.com',
      passwordHash: patientPassword,
      role: 'patient',
      phone: '+1 (555) 987-6543',
      timeZone: 'America/New_York',
    });
    console.log('✓ Created patient user');

    // Print credentials
    console.log('\n✨ Seeding complete!\n');
    console.log('📝 Demo Credentials:');
    console.log('---');
    console.log('PROVIDER:');
    console.log('  Email: provider@example.com');
    console.log('  Password: provider123');
    console.log('  ID: ' + provider._id);
    console.log('');
    console.log('PATIENT:');
    console.log('  Email: patient@example.com');
    console.log('  Password: patient123');
    console.log('  ID: ' + patient._id);
    console.log('---\n');

    console.log('🎯 Next steps:');
    console.log('1. npm run dev (start server)');
    console.log('2. Navigate to http://localhost:4000');
    console.log('3. Login with demo credentials');
    console.log('4. Explore the app!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
