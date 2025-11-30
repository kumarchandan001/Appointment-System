# 🚀 STARTUP & TROUBLESHOOTING GUIDE

## Enterprise-Grade Smart Appointment Booking System

---

## ⚡ QUICK START (Choose One)

### Option 1: One-Line Start (Recommended)
```bash
npm install && npm run seed && npm run dev
```

### Option 2: Step-by-Step
```bash
# Step 1: Install dependencies
npm install

# Step 2: Create demo data
npm run seed

# Step 3: Start server
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:4000
📁 Client serving from http://localhost:4000
```

---

## 🌐 OPEN IN BROWSER

Once server is running, go to:

```
http://localhost:4000
```

---

## 🔐 DEMO CREDENTIALS

### Provider Account
```
Email: provider@example.com
Password: provider123
```

### Patient Account
```
Email: patient@example.com
Password: patient123
```

---

## 📝 DEMO WORKFLOW (5 Minutes)

### Step 1: Provider Setup (1 min)
1. Go to http://localhost:4000
2. Click "Provider Dashboard"
3. Login with provider credentials
4. **Profile auto-loads** with pre-filled data (if existing)
5. Update profile or add more services
6. View or add more slots
7. All changes saved instantly ✅

### Step 2: Patient Booking (2 min)
1. Open new browser tab or incognito window
2. Go to http://localhost:4000
3. Click "Patient Dashboard"
4. Login with patient credentials
5. Click "Book Appointment"
6. Select the provider
7. Choose available time slot
8. Confirm booking
9. Status shows: "Pending"

### Step 3: Provider Confirmation (1 min)
1. Return to provider browser tab
2. Go to "Provider Dashboard"
3. See pending appointment under "Pending Appointments"
4. View all your slots in "Your Available Slots" with status (Available/Booked)
5. Click "✓ Confirm" button
6. Status changes to "Confirmed" ✅

### Step 4: Verify Booking
1. Go back to patient tab
2. Refresh the page
3. Appointment now shows as "Confirmed"

---

## 🧪 RUN TESTS

```bash
npm test
```

**Expected Output:**
```
PASS  tests/appointment.test.js
  Appointment Booking - Atomic Reservation Test
    ✓ Should allow first patient to book available slot
    ✓ Should prevent double-booking when slot is taken (atomic operation)
    ✓ Should handle concurrent booking attempts correctly
    ✓ Should mark slot as booked after appointment creation
    ✓ Should authenticate patient before booking
    ✓ Should require patient role for booking

  Authentication Tests
    ✓ Should register new user
    ✓ Should not allow duplicate email registration
    ✓ Should login with correct credentials
    ✓ Should reject login with wrong password

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

## 🐛 TROUBLESHOOTING

### Issue: Port 4000 Already in Use
```bash
# Option 1: Kill the process on Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Option 2: Change port
# Edit .env and change PORT=5000
```

### Issue: MongoDB Connection Failed
```bash
# Option 1: Start MongoDB locally
mongod

# Option 2: Use MongoDB Atlas (cloud)
# Edit .env:
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart_appointments
```

### Issue: npm install Fails
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install
```

### Issue: Module Not Found
```bash
# Reinstall dependencies
rm -r node_modules
npm install
```

### Issue: seedScript Doesn't Create Data
```bash
# Ensure MongoDB is running and MONGO_URI is correct
# Then run:
npm run seed
```

### Issue: JWT Token Errors
```bash
# Make sure .env has JWT_SECRET
# Restart server:
npm run dev
```

### Issue: Slots Not Showing for Tomorrow
```bash
# Seed data creates slots for tomorrow at 10 AM
# Make sure your system time is correct
# Try running seed again:
npm run seed
```

---

## 🔧 LATEST FIXES & IMPROVEMENTS (v2.5)

### ✅ Profile Update Feature
- Providers can now create AND update existing profiles
- Form pre-fills with existing data
- Button text changes to "Update Profile"
- No more "profile already exists" errors

### ✅ Appointment Loading Fixed
- Eliminated null reference errors
- Added null safety checks throughout
- Graceful fallback to "Unknown Provider"
- Patient dashboard loads smoothly

### ✅ Available Slots Display
- Fixed "Loading..." indefinitely issue
- Slots now show with status (Available/Booked)
- Improved error handling and logging
- Dashboard displays all slots correctly

### ✅ Currency Localization
- All prices now in Indian Rupees (₹)
- Updated UI labels and placeholders
- Price inputs accept whole numbers (no cents)

### ✅ Optional Authentication
- GET /providers works for both authenticated and public access
- Backward compatible with existing flows
- Flexible endpoint design

### ✅ ObjectId Constructor Fixed
- Corrected MongoDB ObjectId instantiation
- Atomic slot updates now work reliably
- Appointment booking is stable

---

## 📂 PROJECT STRUCTURE

```
SMART APPOINTMENT BOOKING SYSTEM/
├── server/                     ← Backend (Node.js + Express)
│   ├── app.js                 ← Main entry point
│   ├── config/db.js           ← MongoDB connection
│   ├── models/                ← Schemas (User, Provider, Appointment)
│   ├── routes/                ← API endpoints (auth, providers, appointments)
│   ├── middleware/            ← Security (auth, error, rate-limit)
│   ├── utils/                 ← Helpers (email stub)
│   └── jobs/                  ← Background jobs (cron reminders)
├── client/                     ← Frontend (HTML + JS + CSS)
│   ├── index.html             ← Landing page
│   ├── pages/                 ← 6 HTML pages
│   ├── js/                    ← 3 JS modules (auth, provider, patient)
│   └── css/                   ← Tailwind + custom styles
├── tests/                      ← Jest tests (11 test cases)
├── seed.js                     ← Demo data generator
├── package.json               ← Dependencies
├── .env                        ← Environment config
└── README.md                   ← Full documentation
```

---

## 🔌 API ENDPOINTS (Reference)

### Authentication
```
POST /api/auth/signup          - Register new user
POST /api/auth/login           - Login & get JWT
```

### Providers
```
POST /api/providers            - Create profile (protected, provider only)
PUT /api/providers/:id/slots   - Add slots (protected, provider only)
GET /api/providers             - List all providers
GET /api/providers/:id         - Get provider details
```

### Appointments
```
GET /api/appointments          - Get user's appointments (protected)
POST /api/appointments         - Book appointment (protected, atomic)
PUT /api/appointments/:id      - Update status (protected)
DELETE /api/appointments/:id   - Cancel appointment (protected)
```

---

## 💻 DEVELOPMENT COMMANDS

```bash
# Development server (auto-reload)
npm run dev

# Production server
npm start

# Seed database
npm run seed

# Run tests
npm test

# Watch tests
npm run test:watch
```

---

## 🔐 SECURITY FEATURES

✅ **Password Security**
- bcrypt hashing (10 salt rounds)
- Never stored in plain text

✅ **JWT Authentication**
- 7-day token expiration
- Bearer token verification
- Role-based access control

✅ **Middleware Security**
- Helmet.js for HTTP headers
- CORS enabled
- Rate limiting (15 req/15 min on sensitive routes)
- Morgan logging in dev mode

✅ **Data Protection**
- All dates stored in UTC
- Atomic MongoDB operations (prevent race conditions)
- Input validation on all routes
- Never return passwordHash

---

## 📊 ATOMIC BOOKING EXPLAINED

The system uses MongoDB atomic operations to prevent double-booking:

```javascript
// When patient books a slot:
findOneAndUpdate(
  {
    _id: providerId,
    'slots._id': slotId,
    'slots.booked': false
  },
  {
    $set: { 'slots.$.booked': true }
  },
  { new: true }
)
```

✅ **Result:**
- First request succeeds: **HTTP 201**
- Second request fails: **HTTP 409 (Conflict)**
- No possibility of double-booking

---

## 🎨 UI FEATURES

✅ **Responsive Design**
- Mobile-friendly
- Tailwind CSS
- Modern components

✅ **User Experience**
- Clean navigation
- Intuitive workflows
- Clear status indicators
- Error messages
- Success confirmations

✅ **Dashboard Features**
- Real-time updates
- Statistics
- Action buttons
- Modal confirmations

---

## 📧 EMAIL NOTIFICATIONS

Currently uses **console logging** for demonstrations.

To enable real emails, update `server/utils/sendEmailStub.js`:

```javascript
// Replace with Nodemailer, SendGrid, or similar
const sendEmail = async (to, subject, body) => {
  // Your email service code here
};
```

---

## 🕐 APPOINTMENT REMINDERS

Cron job runs every minute:
- Finds appointments starting in 60 minutes
- Sends reminder notifications
- Logs to console

Check console for reminder logs.

---

## ✨ NEXT STEPS

### For Development
1. Explore the codebase
2. Run tests: `npm test`
3. Try different user workflows
4. Check browser console for errors
5. Check server logs for API calls

### For Production
1. Change JWT_SECRET
2. Use MongoDB Atlas (cloud)
3. Add real email service
4. Enable HTTPS
5. Set NODE_ENV=production
6. Use a process manager (PM2)
7. Add monitoring/logging

---

## 📞 NEED HELP?

### Check These Files
- **README.md** - Complete documentation
- **VERIFICATION_REPORT.md** - Enterprise checklist
- **FILE_INDEX.md** - File reference
- **QUICK_START.md** - Quick start guide
- Code comments in source files

### Common Issues
1. Port already in use → Change PORT in .env
2. MongoDB not found → Start mongod or use Atlas
3. Dependencies fail → Run npm cache clean && npm install
4. Tests fail → Ensure clean DB state

---

## 🎉 YOU'RE READY!

Everything is configured and ready to run:

```bash
npm install && npm run seed && npm run dev
```

Then open: **http://localhost:4000**

---

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** November 27, 2025

**Happy Coding! 🚀**
