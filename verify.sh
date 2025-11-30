#!/bin/bash

# Smart Appointment Booking System - Complete File Verification
# Run after generation to verify all files exist

echo "🔍 Verifying Smart Appointment Booking System..."
echo ""

missing=0

# Root files
echo "📄 Root Files:"
for file in package.json .env .env.example .gitignore README.md QUICK_START.md PROJECT_STRUCTURE.md seed.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Server - Config:"
for file in server/config/db.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Server - Models:"
for file in server/models/User.js server/models/ProviderProfile.js server/models/Appointment.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Server - Middleware:"
for file in server/middleware/auth.js server/middleware/error.js server/middleware/rateLimit.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Server - Routes:"
for file in server/routes/auth.js server/routes/providers.js server/routes/appointments.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Server - Utils & Jobs:"
for file in server/utils/sendEmailStub.js server/jobs/reminders.js server/app.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Client - HTML Pages:"
for file in client/index.html client/pages/login.html client/pages/signup.html client/pages/provider.html client/pages/provider-dashboard.html client/pages/patient-dashboard.html client/pages/patient-book.html; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Client - JavaScript:"
for file in client/js/auth.js client/js/provider.js client/js/patient.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Client - CSS:"
for file in client/css/styles.css; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "📂 Tests:"
for file in tests/appointment.test.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $missing -eq 0 ]; then
  echo "✅ All files present! Project is ready to run."
  echo ""
  echo "Next steps:"
  echo "  1. npm install"
  echo "  2. npm run seed"
  echo "  3. npm run dev"
  echo "  4. Open http://localhost:4000"
else
  echo "❌ $missing file(s) missing! Please regenerate the project."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
