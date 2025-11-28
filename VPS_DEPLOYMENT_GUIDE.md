# Vaishnav Bhakti App - VPS Deployment Guide

Complete guide for deploying the Vaishnav Bhakti App on VPS server **140.245.9.30**

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Database Setup](#2-database-setup)
3. [Backend Deployment](#3-backend-deployment)
4. [Frontend Build](#4-frontend-build)
5. [NGINX Configuration](#5-nginx-configuration)
   - [5.1 Install NGINX](#51-install-nginx)
   - [5.2 Configure NGINX for Frontend](#52-configure-nginx-for-frontend)
   - [5.3 Setup Reverse Proxy for Backend](#53-setup-reverse-proxy-for-backend)
   - [5.4 Enable and Test Configuration](#54-enable-and-test-configuration)
6. [SSL/HTTPS Setup (Optional)](#6-sslhttps-setup-optional)
7. [Firewall Configuration](#7-firewall-configuration)
8. [Monitoring & Maintenance](#8-monitoring--maintenance)

---

## 1. Prerequisites

### 1.1 System Requirements
- **OS**: Ubuntu 20.04+ or Debian 10+
- **RAM**: Minimum 2GB
- **Storage**: Minimum 10GB free space
- **Node.js**: v16+ or v18+
- **MySQL/MariaDB**: v5.7+ or v10.3+

### 1.2 Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL/MariaDB (if not already installed)
sudo apt install -y mysql-server

# Install PM2 globally
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install -y git

# Verify installations
node --version
npm --version
mysql --version
pm2 --version
```

### 1.3 Clone Repository (if not already cloned)

```bash
# Navigate to web root
cd /var/www/html

# Clone your repository (if not already there)
# git clone https://github.com/Mayurrrrrrrrrr/chaitanyabhakti.git

# Or ensure you're in the correct directory
cd /var/www/html/chaitanyabhakti
```

---

## 2. Database Setup

### 2.1 Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

### 2.2 Create Database and User

```bash
# Login to MySQL as root
sudo mysql -u root -p

# Run these SQL commands:
```

```sql
-- Create database
CREATE DATABASE vaishnav_bhakti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
CREATE USER 'vaishnav_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON vaishnav_bhakti.* TO 'vaishnav_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user='vaishnav_user';

-- Exit
EXIT;
```

### 2.3 Import Database Schema

```bash
# If you have a SQL dump file
cd /var/www/html/chaitanyabhakti
mysql -u vaishnav_user -p vaishnav_bhakti < backend/database/schema.sql

# Or create tables manually using your schema
```

### 2.4 Test Database Connection

```bash
mysql -u vaishnav_user -p vaishnav_bhakti -e "SHOW TABLES;"
```

---

## 3. Backend Deployment

### 3.1 Setup Environment Variables

```bash
cd /var/www/html/chaitanyabhakti/backend

# Create .env file
nano .env
```

Add the following content (modify values as needed):

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vaishnav_bhakti
DB_USER=vaishnav_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration (generate a secure random string)
JWT_SECRET=your_very_secure_jwt_secret_here_minimum_32_characters

# Frontend URL for CORS
CLIENT_URL=http://140.245.9.30

# Backend URL
BACKEND_URL=http://140.245.9.30
```

**Generate secure JWT secret:**
```bash
# Generate random string for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.2 Install Backend Dependencies

```bash
cd /var/www/html/chaitanyabhakti/backend
npm install --production
```

### 3.3 Create Logs Directory

```bash
cd /var/www/html/chaitanyabhakti
mkdir -p logs
```

### 3.4 Start Backend with PM2

```bash
cd /var/www/html/chaitanyabhakti

# Start using ecosystem file
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Run the command it outputs (starts with sudo)

# Check status
pm2 status
pm2 logs vaishnav-bhakti-backend --lines 50
```

### 3.5 Test Backend API

```bash
# Test root endpoint
curl http://localhost:5000/

# Test API health
curl http://localhost:5000/api/auth/send-otp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"1234567890"}'
```

---

## 4. Frontend Build

### 4.1 Update Frontend API URL

```bash
cd /var/www/html/chaitanyabhakti/frontend

# Create/update .env file
nano .env
```

Add:
```env
REACT_APP_API_URL=http://140.245.9.30
```

### 4.2 Install Dependencies and Build

```bash
cd /var/www/html/chaitanyabhakti/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

This will create a `build` directory with optimized production files.

### 4.3 Verify Build

```bash
ls -la /var/www/html/chaitanyabhakti/frontend/build
# Should see index.html, static/, and other files
```

---

## 5. NGINX Configuration

### 5.1 Install NGINX

```bash
# Install NGINX
sudo apt install -y nginx

# Start and enable NGINX
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 5.2 Configure NGINX for Frontend

```bash
# Copy the NGINX configuration
sudo cp /var/www/html/chaitanyabhakti/nginx.conf /etc/nginx/sites-available/chaitanyabhakti

# If you want to edit it:
sudo nano /etc/nginx/sites-available/chaitanyabhakti
```

**⭐ YOU ARE HERE (Step 5.2 Complete)** - You mentioned you completed up to 5.2!

### 5.3 Setup Reverse Proxy for Backend

The configuration file already includes reverse proxy settings. Verify the following sections in `/etc/nginx/sites-available/chaitanyabhakti`:

```nginx
# This section proxies /api/ requests to your backend
location /api/ {
    proxy_pass http://localhost:5000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 5.4 Enable and Test Configuration

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/chaitanyabhakti /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
sudo nginx -t

# If test passes, reload NGINX
sudo systemctl reload nginx

# Check NGINX status
sudo systemctl status nginx
```

### 5.5 Verify Deployment

```bash
# Test frontend
curl http://140.245.9.30/

# Test API proxy
curl http://140.245.9.30/api/auth/send-otp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"1234567890"}'

# Test uploads serving
curl -I http://140.245.9.30/uploads/
```

---

## 6. SSL/HTTPS Setup (Optional)

### 6.1 Using Let's Encrypt (Recommended if you have a domain)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Certbot will automatically update your NGINX config
# Auto-renewal is set up automatically

# Test auto-renewal
sudo certbot renew --dry-run
```

### 6.2 Update Environment Variables for HTTPS

If you setup SSL, update these files:

**Backend .env:**
```env
CLIENT_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com
```

**Frontend .env:**
```env
REACT_APP_API_URL=https://your-domain.com
```

Then rebuild frontend and restart backend:
```bash
cd /var/www/html/chaitanyabhakti/frontend
npm run build

cd ..
pm2 restart vaishnav-bhakti-backend
```

---

## 7. Firewall Configuration

### 7.1 Setup UFW Firewall

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow OpenSSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optional: Allow direct backend access for testing (not recommended for production)
# sudo ufw allow 5000/tcp

# Check status
sudo ufw status verbose
```

### 7.2 Security Hardening

```bash
# Ensure MySQL only listens on localhost
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Verify or add:
# bind-address = 127.0.0.1

# Restart MySQL
sudo systemctl restart mysql
```

---

## 8. Monitoring & Maintenance

### 8.1 Monitor PM2 Processes

```bash
# View status
pm2 status

# View logs
pm2 logs vaishnav-bhakti-backend

# View real-time logs
pm2 logs vaishnav-bhakti-backend --lines 100

# Monitor CPU and Memory
pm2 monit
```

### 8.2 Monitor NGINX

```bash
# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### 8.3 Monitor MySQL

```bash
# Check status
sudo systemctl status mysql

# View logs
sudo tail -f /var/log/mysql/error.log

# Monitor active connections
mysql -u vaishnav_user -p -e "SHOW PROCESSLIST;"
```

### 8.4 Setup Log Rotation

PM2 logs can grow large. Setup rotation:

```bash
pm2 install pm2-logrotate

# Configure (optional)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 8.5 Automated Deployment

Use the deployment script:

```bash
# Make script executable
chmod +x /var/www/html/chaitanyabhakti/deploy-vps.sh

# Run deployment
cd /var/www/html/chaitanyabhakti
./deploy-vps.sh
```

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Backend server is running (`pm2 status`)
- [ ] API responds to health check (`curl http://140.245.9.30/api/`)
- [ ] OTP API works
- [ ] Login API works
- [ ] Database connection is working

### Frontend Tests
- [ ] Frontend loads in browser (`http://140.245.9.30`)
- [ ] No console errors
- [ ] Login page displays correctly
- [ ] Assets load properly
- [ ] Routing works

### Integration Tests
- [ ] User can register
- [ ] User can login
- [ ] Japa counter works
- [ ] Family management works
- [ ] File uploads work
- [ ] Images display correctly

### System Tests
- [ ] PM2 auto-restarts on crash
- [ ] NGINX serves requests
- [ ] Firewall is configured
- [ ] Services start on boot

---

## 🚨 Troubleshooting

### Issue: Frontend shows 404 or blank page

```bash
# Check if build folder exists
ls -la /var/www/html/chaitanyabhakti/frontend/build

# Verify NGINX config
sudo nginx -t

# Check NGINX error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: API calls failing (CORS errors)

```bash
# Check backend logs
pm2 logs vaishnav-bhakti-backend

# Verify CORS origins in backend/server.js
# Ensure CLIENT_URL in .env matches your frontend URL
```

### Issue: Backend not starting

```bash
# Check PM2 logs
pm2 logs vaishnav-bhakti-backend --err

# Check environment variables
cat /var/www/html/chaitanyabhakti/backend/.env

# Test database connection
mysql -u vaishnav_user -p vaishnav_bhakti -e "SELECT 1;"
```

### Issue: File uploads failing

```bash
# Check uploads directory exists
ls -la /var/www/html/chaitanyabhakti/backend/uploads

# Check permissions
sudo chown -R $USER:$USER /var/www/html/chaitanyabhakti/backend/uploads
chmod -R 755 /var/www/html/chaitanyabhakti/backend/uploads

# Check client_max_body_size in NGINX
sudo nano /etc/nginx/sites-available/chaitanyabhakti
# Should have: client_max_body_size 50M;
```

---

## 📚 Useful Commands

```bash
# Restart all services
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mysql

# View all logs
pm2 logs --lines 100
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/mysql/error.log

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
ps aux | grep nginx

# Quick deployment
cd /var/www/html/chaitanyabhakti && ./deploy-vps.sh
```

---

## ✨ Success Criteria

Your deployment is successful when:

✅ You can access the frontend at `http://140.245.9.30`  
✅ You can register and login  
✅ All features work (japa counter, family management, etc.)  
✅ File uploads work correctly  
✅ No console errors in browser  
✅ Backend API responds correctly  
✅ Services auto-start on server reboot  

---

## 🎉 Next Steps

1. **Setup Domain Name** (optional): Point a domain to 140.245.9.30
2. **Enable HTTPS**: Use Let's Encrypt for free SSL
3. **Setup Backups**: Backup database regularly
4. **Monitor Performance**: Use tools like PM2 monitoring
5. **Scale**: Add load balancing if needed

---

**Your Vaishnav Bhakti App is now live!** 🕉️📿
