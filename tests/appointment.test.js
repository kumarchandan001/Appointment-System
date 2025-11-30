// tests/appointment.test.js
/**
 * Appointment Booking Tests
 * Tests atomic reservation to prevent double-booking
 * Run: npm test
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { DateTime } = require('luxon');

const app = require('../server/app');
const User = require('../server/models/User');
const ProviderProfile = require('../server/models/ProviderProfile');
const Appointment = require('../server/models/Appointment');

let mongoServer;

// Setup
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.disconnect();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Teardown
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear data between tests
beforeEach(async () => {
  await User.deleteMany({});
  await ProviderProfile.deleteMany({});
  await Appointment.deleteMany({});
});

describe('Appointment Booking - Atomic Reservation Test', () => {
  let providerToken, patientToken1, patientToken2;
  let providerId, providerId_id;
  let slotId;

  beforeEach(async () => {
    // Create provider
    const providerPassword = await bcrypt.hash('test123', 10);
    const provider = await User.create({
      name: 'Dr. Test',
      email: 'provider@test.com',
      passwordHash: providerPassword,
      role: 'provider',
      phone: '555-0001',
    });

    // Create provider profile with 1 slot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const start = DateTime.fromJSDate(tomorrow).toUTC().toJSDate();
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    const profile = await ProviderProfile.create({
      userId: provider._id,
      title: 'Test Doctor',
      specialties: ['Testing'],
      services: [
        {
          name: 'Test Service',
          durationMinutes: 30,
          price: 50,
        },
      ],
      slots: [
        {
          start,
          end,
          booked: false,
        },
      ],
    });

    providerId = profile._id;
    providerId_id = provider._id;
    slotId = profile.slots[0]._id;

    // Get provider token
    const providerRes = await request(app).post('/api/auth/login').send({
      email: 'provider@test.com',
      password: 'test123',
    });
    providerToken = providerRes.body.token;

    // Create patient 1
    const patient1Password = await bcrypt.hash('test123', 10);
    const patient1 = await User.create({
      name: 'Patient One',
      email: 'patient1@test.com',
      passwordHash: patient1Password,
      role: 'patient',
      phone: '555-0002',
    });

    const patient1Res = await request(app).post('/api/auth/login').send({
      email: 'patient1@test.com',
      password: 'test123',
    });
    patientToken1 = patient1Res.body.token;

    // Create patient 2
    const patient2Password = await bcrypt.hash('test123', 10);
    const patient2 = await User.create({
      name: 'Patient Two',
      email: 'patient2@test.com',
      passwordHash: patient2Password,
      role: 'patient',
      phone: '555-0003',
    });

    const patient2Res = await request(app).post('/api/auth/login').send({
      email: 'patient2@test.com',
      password: 'test123',
    });
    patientToken2 = patient2Res.body.token;
  });

  test('Should allow first patient to book available slot', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken1}`)
      .send({
        providerId: providerId.toString(),
        slotId: slotId.toString(),
        notes: 'First booking',
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending');
    expect(response.body.patientId).toBeDefined();
  });

  test('Should prevent double-booking when slot is taken (atomic operation)', async () => {
    // Patient 1 books the slot
    const booking1 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken1}`)
      .send({
        providerId: providerId.toString(),
        slotId: slotId.toString(),
        notes: 'First booking',
      });

    expect(booking1.status).toBe(201);

    // Patient 2 tries to book the same slot
    const booking2 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken2}`)
      .send({
        providerId: providerId.toString(),
        slotId: slotId.toString(),
        notes: 'Second booking attempt',
      });

    // Should be rejected with 409 Conflict
    expect(booking2.status).toBe(409);
    expect(booking2.body.error).toContain('not available');

    // Verify only one appointment exists
    const appointments = await Appointment.find();
    expect(appointments.length).toBe(1);
  });

  test('Should handle concurrent booking attempts correctly', async () => {
    // Simulate concurrent requests
    const [booking1, booking2] = await Promise.all([
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          providerId: providerId.toString(),
          slotId: slotId.toString(),
          notes: 'Concurrent 1',
        }),
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken2}`)
        .send({
          providerId: providerId.toString(),
          slotId: slotId.toString(),
          notes: 'Concurrent 2',
        }),
    ]);

    // One should succeed, one should fail
    const statuses = [booking1.status, booking2.status].sort();
    expect(statuses).toEqual([201, 409]);

    // Verify only one appointment exists
    const appointments = await Appointment.find();
    expect(appointments.length).toBe(1);
  });

  test('Should mark slot as booked after appointment creation', async () => {
    // Book the slot
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken1}`)
      .send({
        providerId: providerId.toString(),
        slotId: slotId.toString(),
        notes: 'Test booking',
      });

    // Check provider profile
    const profile = await ProviderProfile.findById(providerId);
    const slot = profile.slots.find((s) => s._id.equals(slotId));

    expect(slot.booked).toBe(true);
  });

  test('Should authenticate patient before booking', async () => {
    const response = await request(app).post('/api/appointments').send({
      providerId: providerId.toString(),
      slotId: slotId.toString(),
      notes: 'Unauthorized booking',
    });

    expect(response.status).toBe(401);
  });

  test('Should require patient role for booking', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        providerId: providerId.toString(),
        slotId: slotId.toString(),
        notes: 'Provider booking attempt',
      });

    expect(response.status).toBe(403);
  });
});

describe('Authentication Tests', () => {
  test('Should register new user', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'securepass123',
      role: 'patient',
      phone: '555-0000',
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('Should not allow duplicate email registration', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'User 1',
      email: 'duplicate@example.com',
      password: 'pass123',
      role: 'patient',
    });

    const response = await request(app).post('/api/auth/signup').send({
      name: 'User 2',
      email: 'duplicate@example.com',
      password: 'pass123',
      role: 'patient',
    });

    expect(response.status).toBe(409);
  });

  test('Should login with correct credentials', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'login@example.com',
      password: 'mypass123',
      role: 'patient',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'mypass123',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('Should reject login with wrong password', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'wrongpass@example.com',
      password: 'correctpass',
      role: 'patient',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'wrongpass',
    });

    expect(response.status).toBe(401);
  });
});
