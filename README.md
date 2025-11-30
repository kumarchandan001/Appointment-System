# Smart Appointment Booking System

A production-ready full-stack appointment booking platform built with Node.js, Express, MongoDB, and Vanilla JavaScript.

## Features

- **User Authentication**: JWT-based secure login & signup with role-based access (Patient, Provider, Admin)
- **Provider Management**: Providers can create profiles, add services with pricing, and manage availability slots
- **Profile Management**: Providers can create and update their profiles seamlessly
- **Appointment Booking**: Patients can browse providers, view availability, and book appointments with atomic reservation (no double-booking)
- **Appointment Status Management**: Appointments have clear status tracking (pending, confirmed, rejected, cancelled, completed)
- **Appointment Reminders**: Automated cron job sends reminders 60 minutes before appointments
- **Email Notifications**: Stubbed email system for appointment confirmations and reminders (extensible)
- **Slots Management**: Providers can add multiple availability slots and view booked/available status on dashboard
- **Rupee Pricing**: All service prices displayed in Indian Rupees (₹)
- **Security**: Helmet middleware, rate limiting on sensitive routes, bcrypt password hashing, JWT authentication
- **Responsive UI**: Beautiful Tailwind CSS design, mobile-friendly with modern components
- **Atomic Reservations**: MongoDB atomic operations prevent double-booking race conditions
- **Error Handling**: Comprehensive null safety checks and error boundaries throughout the application

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN)
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **Utilities**: node-cron, luxon (date/time), morgan (logging)

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas connection string)
- npm or yarn

### Setup Steps

1. **Clone/Extract the project**
   ```bash
   cd "SMART APPOINTMENT BOOKING SYSTEM"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update `MONGO_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a strong secret key
   - Update `PORT` if needed (default 4000)

4. **Seed database with demo data**
   ```bash
   npm run seed
   ```
   This creates:
   - Provider user: `provider@example.com` / `provider123`
   - Patient user: `patient@example.com` / `patient123`

5. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:4000`

## Running Tests

```bash
npm test
```

Tests verify atomic booking behavior to prevent double-bookings.

## Recent Improvements

### Bug Fixes & Enhancements (Latest)

1. **Profile Update Feature**
   - Providers can now create AND update their existing profiles
   - POST /api/providers endpoint now intelligently creates or updates profiles
   - Profile form displays pre-filled data for existing profiles
   - Button text changes to "Update Profile" when profile exists

2. **Appointment Loading Fixes**
   - Fixed null reference errors when loading appointments
   - Added null safety checks for providerId references
   - Graceful fallback to "Unknown Provider" when data unavailable
   - Console errors eliminated in patient dashboard

3. **Available Slots Display**
   - Fixed "Loading..." issue in provider dashboard slots table
   - Added proper error handling and logging
   - Slots now properly display with booked/available status
   - GET /providers endpoint enhanced to return both slots and availableSlots arrays

4. **Optional Authentication Middleware**
   - Added optionalAuth middleware for flexible endpoint access
   - GET /providers endpoint works for both authenticated and public access
   - Maintains backward compatibility with existing patient/public views

5. **Currency Localization**
   - Changed all pricing from USD ($) to Indian Rupees (₹)
   - Updated UI labels and placeholders throughout application
   - Service price inputs now use step of 1 (no decimal cents)

6. **ObjectId Constructor Fix**
   - Fixed MongoDB ObjectId instantiation errors
   - Updated to use `new mongoose.Types.ObjectId()` syntax
   - Atomic slot update operations now work correctly

### Step 1: Provider Setup
1. Navigate to http://localhost:4000
2. Click "Provider Dashboard" or go to `pages/provider.html`
3. **Already logged in** as `provider@example.com` (use seed credentials if needed)
4. You will see:
   - Existing profile loaded (if one exists) with all your previous data
   - Form populated with title, specialties, and services
   - Button text showing "Update Profile"
5. Add or update a service:
   - Title: "Dermatology Consultation"
   - Specialties: "Skin Care, Acne Treatment"
   - Service name: "30-min Consultation", Duration: 30 min, Price: ₹500
6. Add appointment slots:
   - Set future dates/times (e.g., tomorrow 10:00 AM - 5:00 PM)
7. Observe slots appear in the "Your Available Slots" table with status indicators

### Step 2: Patient Booking
1. In a new browser tab, navigate to http://localhost:4000
2. Go to "Patient Dashboard" or `pages/patient-book.html`
3. **Already logged in** as `patient@example.com`
4. Click "Book Appointment"
5. Select the provider you just created
6. Choose an available date and time slot
7. Click "Book Now" → Confirmation modal appears
8. Click "Confirm" → Appointment created with "pending" status

### Step 3: Provider Confirmation
1. Return to provider browser tab (or refresh provider-dashboard.html)
2. Under "Pending Appointments", see the booking from Step 2
3. Click "Confirm" button
4. Status changes to "confirmed"
5. (Optional) Go back to patient dashboard to see confirmed appointment

### Step 4: Verify Atomic Reservation
1. Open two browser windows with patient logged in
2. Both try to book the **same slot** simultaneously
3. One succeeds (201), second gets conflict error (409)
4. This proves atomic MongoDB operations prevent double-booking

## Architecture Overview

### Backend Structure
```
server/
├── app.js              # Express app setup, middleware, routes
├── config/
│   └── db.js          # MongoDB connection
├── middleware/
│   ├── auth.js        # JWT verification
│   ├── error.js       # Error handler
│   └── rateLimit.js   # Rate limiting
├── models/
│   ├── User.js        # User schema (patient, provider, admin)
│   ├── ProviderProfile.js  # Provider details, services, slots
│   └── Appointment.js  # Appointment records
├── routes/
│   ├── auth.js        # Sign up, login
│   ├── providers.js   # Provider CRUD
│   └── appointments.js # Appointment booking & management
├── utils/
│   └── sendEmailStub.js  # Email notification stub
└── jobs/
    └── reminders.js   # Cron job for 60-min reminders
```

### Database Schema

**User**
- name, email (unique), passwordHash, role, phone, timeZone, createdAt

**ProviderProfile**
- userId (ref User), title, specialties, services, slots, timeZone, createdAt

**Appointment**
- patientId, providerId, service, start (UTC), end (UTC), status, notes, createdAt

### Frontend Structure
```
client/
├── index.html                # Landing page
├── css/styles.css           # Custom Tailwind styles
├── js/
│   ├── auth.js             # Login/signup logic
│   ├── provider.js         # Provider functionality
│   └── patient.js          # Patient booking logic
└── pages/
    ├── login.html
    ├── signup.html
    ├── provider.html
    ├── provider-dashboard.html
    ├── patient-dashboard.html
    └── patient-book.html
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT

### Providers
- `POST /api/providers` - Create or update provider profile (protected)
  - Now intelligently creates new profile or updates existing one
  - Returns `id`, `title`, `specialties`, `services`, `slots`, `availableSlots`
- `GET /api/providers` - Get own profile (if authenticated provider) or list all providers
  - For authenticated providers: Returns their own profile with `isOwn: true` flag
  - For public/patients: Returns all providers
  - Returns both `slots` (all) and `availableSlots` (unbooked only)
- `PUT /api/providers/:id/slots` - Add appointment slots (protected)
- `GET /api/providers/:id` - Get provider details with slots

### Appointments
- `GET /api/appointments` - Get user's appointments (protected)
  - Automatically filters based on user role (patient/provider)
  - Populates provider/patient information
- `POST /api/appointments` - Book appointment (protected, atomic)
  - Prevents double-booking with atomic MongoDB operations
- `PUT /api/appointments/:id` - Confirm/reject appointment (protected)
  - Frees up slots when appointments are rejected/cancelled
- `DELETE /api/appointments/:id` - Cancel appointment (protected)

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth with role verification
- **Optional Authentication**: `optionalAuth` middleware allows endpoints to work with or without authentication
- **Rate Limiting**: 15 requests per 15 minutes on auth and appointment routes
- **Helmet Middleware**: Sets secure HTTP headers
- **CORS**: Configured for frontend origin
- **Input Validation**: Basic checks on routes with null safety
- **UTC Storage**: All dates stored in UTC, converted client-side
- **Atomic Operations**: MongoDB atomic updates prevent race conditions during booking

## Email Stub & Notifications

Currently, emails are logged to console via `sendEmailStub()`. To integrate real email:

1. Replace `sendEmailStub()` in `utils/sendEmailStub.js` with Nodemailer or SendGrid
2. Set `EMAIL_FROM` in `.env` to your email service account
3. Update environment variables for SMTP or API keys

## Cron Job - Appointment Reminders

Every minute, the job checks for appointments starting within 60 minutes and sends notifications. Logs appear in server console.

To disable: Comment out the cron job in `server/jobs/reminders.js`

## Notes for Production Deployment

- Change `JWT_SECRET` to a strong, random value
- Use `NODE_ENV=production`
- Connect to MongoDB Atlas (cloud)
- Replace email stub with real service
- Add request validation library (joi, yup)
- Enable HTTPS
- Use environment-specific configs
- Add logging service (Winston, Bunyan)
- Set up CI/CD pipeline

## Troubleshooting

**Port already in use**: Change `PORT` in `.env`

**MongoDB connection fails**: 
- Ensure MongoDB is running locally: `mongod`
- Or check your connection string in `.env`

**JWT errors during requests**: 
- Ensure `JWT_SECRET` is set in `.env`
- Check token format: `Authorization: Bearer <token>`

**Slots not appearing in dashboard**: 
- Verify `providerId` is saved in localStorage
- Check browser console for errors
- Ensure provider profile has slots added
- Try refreshing the page

**Profile not loading**: 
- Ensure you're authenticated as a provider
- Check that provider profile exists in database
- Verify JWT token is valid

**Appointments showing "Unknown Provider"**: 
- This is expected if populate failed
- Check that provider still exists in database
- Verify appointment was created with valid providerId

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Provider profile already exists" error when updating | Fixed in v2.1 - Now supports profile updates automatically |
| "Cannot read properties of null (reading 'name')" | Fixed in v2.2 - Added null safety checks throughout |
| Slots show "Loading..." indefinitely | Fixed in v2.3 - Improved error handling and data flow |
| Prices showing in dollars instead of rupees | Fixed in v2.4 - All prices now display in ₹ (Indian Rupees) |
| Appointment booking fails with ObjectId error | Fixed in v2.5 - Updated MongoDB ObjectId constructor usage |

## License

ISC
