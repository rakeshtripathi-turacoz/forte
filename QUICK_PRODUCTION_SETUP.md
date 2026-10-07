# ⚡ QUICK PRODUCTION SETUP - 5 MINUTE GUIDE

## 🎯 Files Created:

✅ `.env.production` (Frontend)
✅ `backend/.env.production` (Backend)
✅ `PRODUCTION_DEPLOYMENT_GUIDE.md` (Full guide)

---

## 🔧 STEP 1: Edit Frontend Environment (1 minute)

**File:** `.env.production`

**Change THIS line:**
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

**TO your actual domain:**
```env
# Example:
REACT_APP_API_URL=https://forteinstitute.com/api
```

---

## 🔧 STEP 2: Edit Backend Environment (2 minutes)

**File:** `backend/.env.production`

**Change THESE lines:**

### A. Frontend URL
```env
FRONTEND_URL=https://yourdomain.com
```

### B. Generate JWT Secret
```bash
# Run this command:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the output (looks like: a7f3b2e1c9d8...)
```

**Paste in .env.production:**
```env
JWT_SECRET=paste-the-generated-secret-here
```

### C. Database Credentials
```env
DB_HOST=localhost
DB_USER=forte_db_user
DB_PASSWORD=your-strong-password-here
DB_NAME=forte_institute
```

---

## 📦 STEP 3: Build Frontend (1 minute)

```bash
# In project root
npm run build
```

**✅ Should create `build/` folder**

---

## 🚀 STEP 4: Deploy (1 minute)

### Quick Deploy Script:

```bash
# Upload frontend
scp -r build/* user@yourserver:/var/www/forte-institute/

# Upload backend
scp -r backend/* user@yourserver:/var/www/forte-institute/backend/

# SSH to server
ssh user@yourserver

# Install backend dependencies
cd /var/www/forte-institute/backend
npm install --production

# Copy production env
cp .env.production .env

# Start with PM2
pm2 start server.js --name forte-backend
pm2 save
```

---

## ✅ STEP 5: Verify

### Test these URLs:

```bash
# Frontend
https://yourdomain.com

# API Health
https://yourdomain.com/api/health

# Admin Login
https://yourdomain.com/login
```

---

## 🎯 MOST COMMON ISSUES:

### Issue 1: Images Not Uploading

**Solution:**
```bash
# Check .env.production has correct domain (no localhost!)
cat .env.production

# Should show: REACT_APP_API_URL=https://yourdomain.com/api
# NOT: http://localhost:5000/api

# If wrong, rebuild:
npm run build
```

### Issue 2: CORS Error

**Solution:**
```bash
# Backend .env must match frontend domain
# backend/.env:
FRONTEND_URL=https://yourdomain.com

# Restart backend:
pm2 restart forte-backend
```

### Issue 3: 502 Bad Gateway

**Solution:**
```bash
# Backend not running
pm2 start server.js --name forte-backend
```

---

## 📋 CHECKLIST:

Before going live:

- [ ] `.env.production` has your domain (not yourdomain.com)
- [ ] `backend/.env.production` has your domain
- [ ] JWT_SECRET is generated (not default)
- [ ] Database password is strong (not root)
- [ ] Run `npm run build`
- [ ] Upload `build/` folder to server
- [ ] Upload `backend/` folder to server
- [ ] Start backend with PM2
- [ ] Test image upload

---

## 🆘 NEED HELP?

Read the full guide: **PRODUCTION_DEPLOYMENT_GUIDE.md**

---

**That's it! 5 steps, 5 minutes, and you're live! 🚀**
