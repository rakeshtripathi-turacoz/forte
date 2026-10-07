# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Forte Institute Website - Complete Step-by-Step Guide

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before starting deployment, ensure you have:

- [ ] Production server (VPS/Dedicated Server)
- [ ] Domain name configured with DNS pointing to server IP
- [ ] SSH access to the server
- [ ] MySQL database installed on server
- [ ] Node.js 18+ installed on server
- [ ] Nginx or Apache installed on server
- [ ] SSL certificate (Let's Encrypt recommended)

---

## 🔧 STEP 1: Configure Environment Files

### A. Frontend Configuration

**File:** `.env.production` (already created)

```bash
# Edit this file
nano .env.production
```

**Change this line:**
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

**Replace `yourdomain.com` with your actual domain:**
```env
# Example:
REACT_APP_API_URL=https://forteinstitute.com/api
```

### B. Backend Configuration

**File:** `backend/.env.production` (already created)

```bash
# Edit this file
cd backend
nano .env.production
```

**Update these critical values:**

1. **Frontend URL:**
```env
FRONTEND_URL=https://yourdomain.com
```

2. **Generate JWT Secret:**
```bash
# Run this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the output and paste into .env.production:
JWT_SECRET=paste-the-generated-secret-here
```

3. **Database Configuration:**
```env
DB_HOST=localhost
DB_USER=forte_db_user
DB_PASSWORD=your-strong-password-here
DB_NAME=forte_institute
```

---

## 📦 STEP 2: Build Frontend

```bash
# In project root directory
cd /path/to/forte-institute-website

# Install dependencies (if not done)
npm install

# Build for production (uses .env.production)
npm run build

# Verify build folder created
ls -la build/
# Should show: index.html, static/, etc.

# Check build size (should be 2-5 MB)
du -sh build/
```

**✅ Verification:**
```bash
# Check if production API URL is in build
grep -r "localhost:5000" build/static/js/*.js

# Should return NOTHING (if it shows localhost, rebuild!)
```

---

## 🔐 STEP 3: Prepare Backend

```bash
# Go to backend directory
cd backend

# Install production dependencies
npm install --production

# Rename .env.production to .env (or copy it)
cp .env.production .env

# Edit .env with actual production values
nano .env

# Generate JWT Secret if not done
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output and paste in .env as JWT_SECRET

# Test if backend starts
npm start

# Should show:
# ✅ Database connected successfully!
# 🚀 Server started successfully!

# Stop with Ctrl+C (we'll use PM2 later)
```

---

## 🗄️ STEP 4: Setup Production Database

### A. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE forte_institute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create dedicated user (DO NOT use root!)
CREATE USER 'forte_db_user'@'localhost' IDENTIFIED BY 'YourStrongPasswordHere123!@#';

# Grant privileges
GRANT ALL PRIVILEGES ON forte_institute.* TO 'forte_db_user'@'localhost';

# Apply changes
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### B. Import Database Schema

```bash
# Import the schema
mysql -u forte_db_user -p forte_institute < database_schema.sql

# Verify tables created
mysql -u forte_db_user -p -e "USE forte_institute; SHOW TABLES;"

# Should list all tables (hero_section, admin_users, etc.)
```

### C. Update Backend .env with Database Credentials

```env
DB_HOST=localhost
DB_USER=forte_db_user
DB_PASSWORD=YourStrongPasswordHere123!@#
DB_NAME=forte_institute
```

---

## 📤 STEP 5: Upload Files to Server

### Option A: Using SCP (Secure Copy)

```bash
# Upload frontend build
scp -r build/* user@your-server-ip:/var/www/forte-institute/

# Upload backend
scp -r backend/* user@your-server-ip:/var/www/forte-institute/backend/

# Upload database schema (if needed)
scp database_schema.sql user@your-server-ip:/var/www/forte-institute/
```

### Option B: Using Git (Recommended)

```bash
# On your server
ssh user@your-server-ip

# Clone repository
cd /var/www/
git clone https://github.com/yourusername/forte-institute-website.git

# Install frontend dependencies
cd forte-institute-website
npm install

# Build frontend on server
npm run build

# Install backend dependencies
cd backend
npm install --production

# Create .env from .env.production
cp .env.production .env
nano .env  # Edit with production values
```

### Option C: Using FTP/SFTP

Use FileZilla or similar tool:
- Upload `build/` folder to `/var/www/forte-institute/`
- Upload `backend/` folder to `/var/www/forte-institute/backend/`

---

## 🌐 STEP 6: Configure Nginx

### A. Create Nginx Configuration

```bash
# SSH to server
ssh user@your-server-ip

# Create site configuration
sudo nano /etc/nginx/sites-available/forte-institute
```

**Paste this configuration:**

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - React build files
    location / {
        root /var/www/forte-institute/build;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploaded files - CRITICAL for images!
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;

        # Cache uploaded images
        add_header Cache-Control "public, max-age=31536000";
    }

    # File upload size limit (adjust if needed)
    client_max_body_size 10M;

    # Error pages
    error_page 404 /index.html;
}
```

**⚠️ IMPORTANT: Replace `yourdomain.com` with your actual domain!**

### B. Enable Site & Test Configuration

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/forte-institute /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Should show: "syntax is okay" and "test is successful"

# Reload Nginx
sudo systemctl reload nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

## 🔒 STEP 7: Install SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (2 - Redirect HTTP to HTTPS)

# Certbot will automatically update Nginx config

# Test auto-renewal
sudo certbot renew --dry-run

# Certificate will auto-renew every 90 days
```

---

## 🚀 STEP 8: Start Backend with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Go to backend directory
cd /var/www/forte-institute/backend

# Create uploads directory with permissions
mkdir -p uploads/hero-images uploads/banners uploads/logos uploads/documents uploads/gallery uploads/events uploads/leadership uploads/news
chmod -R 755 uploads/

# Start backend
pm2 start server.js --name forte-backend

# Save PM2 configuration
pm2 save

# Enable PM2 to start on server boot
pm2 startup
# Copy and run the command shown

# Check status
pm2 status

# View logs
pm2 logs forte-backend

# Should show:
# ✅ Database connected successfully!
# 🚀 Server started successfully!
```

---

## ✅ STEP 9: Verification & Testing

### A. Test Frontend

```bash
# Visit your domain
https://yourdomain.com

# Should show the homepage
```

### B. Test Backend API

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

### C. Test Image Upload

1. Visit: `https://yourdomain.com/login`
2. Login with admin credentials
3. Go to admin panel
4. Try uploading an image
5. Should upload successfully! ✅

### D. Test Image Display

```bash
# Upload an image via admin panel
# Then test if it's accessible:
curl -I https://yourdomain.com/uploads/hero-images/hero-1234567.jpg

# Should return: HTTP/2 200
```

### E. Check Browser Console

```javascript
// Open DevTools → Console on your site
console.log('API URL:', process.env.REACT_APP_API_URL);

// Should show: https://yourdomain.com/api
// NOT: http://localhost:5000/api
```

---

## 🔧 STEP 10: Post-Deployment Configuration

### A. Change Default Admin Password

```bash
# Login to admin panel
https://yourdomain.com/login

# Email: admin@forte.edu.in
# Password: admin123

# IMMEDIATELY change password after first login!
```

### B. Configure Firewall

```bash
# Install UFW (if not installed)
sudo apt install ufw

# Allow SSH (IMPORTANT - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### C. Setup Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-forte-db.sh
```

**Paste this:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/forte-institute"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u forte_db_user -p'YourPasswordHere' forte_institute | gzip > $BACKUP_DIR/forte_db_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "forte_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: forte_db_$DATE.sql.gz"
```

**Make executable and schedule:**
```bash
sudo chmod +x /usr/local/bin/backup-forte-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-forte-db.sh
```

---

## 📊 STEP 11: Monitoring & Maintenance

### A. Monitor Backend Logs

```bash
# Real-time logs
pm2 logs forte-backend

# View last 100 lines
pm2 logs forte-backend --lines 100

# Error logs only
pm2 logs forte-backend --err
```

### B. Monitor System Resources

```bash
# CPU and Memory usage
pm2 monit

# Detailed system info
htop
```

### C. Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### D. Restart Services

```bash
# Restart backend
pm2 restart forte-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql
```

---

## 🚨 TROUBLESHOOTING

### Issue 1: Images Not Uploading

**Check:**
```bash
# Backend is running
pm2 status

# Uploads directory exists and is writable
ls -la /var/www/forte-institute/backend/uploads/
chmod -R 755 /var/www/forte-institute/backend/uploads/

# Nginx is proxying /uploads correctly
sudo nginx -t
```

### Issue 2: CORS Error

**Check backend .env:**
```env
FRONTEND_URL=https://yourdomain.com
```

**Restart backend:**
```bash
pm2 restart forte-backend
```

### Issue 3: 502 Bad Gateway

**Backend not running:**
```bash
pm2 start server.js --name forte-backend
```

### Issue 4: Database Connection Error

**Check credentials:**
```bash
mysql -u forte_db_user -p forte_institute

# If fails, reset password:
mysql -u root -p
ALTER USER 'forte_db_user'@'localhost' IDENTIFIED BY 'NewPassword';
FLUSH PRIVILEGES;
EXIT;

# Update backend/.env with new password
```

---

## 📱 QUICK COMMANDS REFERENCE

```bash
# View backend status
pm2 status

# View logs
pm2 logs forte-backend

# Restart backend
pm2 restart forte-backend

# Stop backend
pm2 stop forte-backend

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx errors
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Database backup
mysqldump -u forte_db_user -p forte_institute > backup.sql

# Restore database
mysql -u forte_db_user -p forte_institute < backup.sql
```

---

## 🎯 DEPLOYMENT COMPLETE!

Your website should now be live at: **https://yourdomain.com**

### Final Checklist:

- [x] Frontend accessible at https://yourdomain.com
- [x] Backend API working at https://yourdomain.com/api/health
- [x] Admin panel accessible at https://yourdomain.com/login
- [x] Images uploading successfully
- [x] Images displaying on frontend
- [x] SSL certificate installed (HTTPS working)
- [x] PM2 keeping backend running
- [x] Firewall configured
- [x] Database backups scheduled
- [x] Default admin password changed

---

## 📞 SUPPORT

If you encounter issues:

1. Check PM2 logs: `pm2 logs forte-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check browser console for errors
4. Verify all environment variables are correct
5. Ensure backend is running: `pm2 status`

---

**🎉 Congratulations! Your Forte Institute website is now live!**
