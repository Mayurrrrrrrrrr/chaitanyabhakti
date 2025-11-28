# Quick Start - Continue from Step 5.2

You mentioned you've completed up to **Step 5.2** in your deployment. Here's what comes next:

## ✅ What You've Completed (Steps 1-5.2)
- Prerequisites and system setup
- Database configuration
- Backend deployment
- Frontend build
- NGINX installation
- **NGINX configuration for frontend (Step 5.2)**

## 🚀 Next Steps: Continue from Step 5.3

### Step 5.3: Setup Reverse Proxy for Backend

The NGINX configuration file (`/var/www/html/chaitanyabhakti/nginx.conf`) already includes the reverse proxy settings. You need to:

1. **Verify the configuration is in place:**
```bash
sudo nano /etc/nginx/sites-available/chaitanyabhakti
```

The file should include the `/api/` location block that proxies requests to your backend on port 5000.

2. **Check that backend is running:**
```bash
# Check PM2 status
pm2 status

# If not running, start it
cd /var/www/html/chaitanyabhakti
pm2 start ecosystem.config.js
```

### Step 5.4: Enable and Test Configuration

```bash
# Test NGINX configuration syntax
sudo nginx -t

# If test passes, reload NGINX
sudo systemctl reload nginx

# Check NGINX status
sudo systemctl status nginx
```

### Step 5.5: Verify Everything Works

```bash
# Test frontend (should return HTML)
curl http://140.245.9.30/

# Test API proxy (should return JSON or API response)
curl -X POST http://140.245.9.30/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"1234567890"}'
```

## 🌐 Access Your App

Open your browser and navigate to:
- **Frontend**: http://140.245.9.30
- **API**: http://140.245.9.30/api

## 📝 Quick Reference Commands

```bash
# Check all services
pm2 status                          # Backend
sudo systemctl status nginx         # NGINX
sudo systemctl status mysql         # Database

# View logs
pm2 logs                            # Backend logs
sudo tail -f /var/log/nginx/error.log  # NGINX errors

# Restart services
pm2 restart all                     # Restart backend
sudo systemctl reload nginx         # Reload NGINX

# Quick deployment (after making changes)
cd /var/www/html/chaitanyabhakti
./deploy-vps.sh
```

## 🚨 Troubleshooting

If something doesn't work:

1. **Check backend is running:**
   ```bash
   pm2 status
   pm2 logs vaishnav-bhakti-backend
   ```

2. **Check NGINX config:**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check database connection:**
   ```bash
   mysql -u vaishnav_user -p vaishnav_bhakti -e "SHOW TABLES;"
   ```

## 📚 Full Documentation

For complete details, see:
- [VPS_DEPLOYMENT_GUIDE.md](file:///var/www/html/chaitanyabhakti/VPS_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [nginx.conf](file:///var/www/html/chaitanyabhakti/nginx.conf) - NGINX configuration
- [ecosystem.config.js](file:///var/www/html/chaitanyabhakti/ecosystem.config.js) - PM2 configuration
- [deploy-vps.sh](file:///var/www/html/chaitanyabhakti/deploy-vps.sh) - Automated deployment script

---

**Ready to continue? Run the commands in Step 5.3 above!** 🚀
