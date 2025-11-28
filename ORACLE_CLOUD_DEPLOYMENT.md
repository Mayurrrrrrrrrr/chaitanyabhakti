# Oracle Cloud VPS Deployment Guide

Deploy Vaishnav Bhakti App to Oracle Cloud at **140.245.9.30**

---

## 🚀 Quick Deploy (Automated)

Run this command from your local machine:

```bash
cd /var/www/html/chaitanyabhakti
./deploy-to-oracle.sh
```

The script will:
1. ✅ Copy all files to Oracle Cloud
2. ✅ Install Node.js, PM2, NGINX, MySQL
3. ✅ Setup database and import schemas
4. ✅ Build frontend
5. ✅ Start backend with PM2
6. ✅ Configure NGINX
7. ✅ Setup firewall

**Time:** ~10-15 minutes

---

## 📋 Prerequisites

### 1. SSH Access
You need your Oracle Cloud SSH private key file:
- Downloaded when you created the instance
- Usually named something like `ssh-key-2025-11-26.key` or `oracle-cloud.pem`
- Location: probably in `~/Downloads/`

### 2. Oracle Cloud Username
Usually one of:
- `ubuntu` (for Ubuntu instances)
- `opc` (for Oracle Linux)

### 3. Test SSH Connection
```bash
# Replace with your username and key path
ssh -i ~/Downloads/your-key.pem ubuntu@140.245.9.30

# If this works, you're good to go!
```

---

## 🔐 Oracle Cloud Console Setup (CRITICAL!)

After running the deployment script, you MUST configure security rules:

### Step 1: Login to Oracle Cloud Console
Visit: https://cloud.oracle.com

### Step 2: Navigate to Your Instance
1. Menu → Compute → Instances
2. Click on your instance name

### Step 3: Configure Security List
1. Under "Instance Details", find "Primary VNIC"
2. Click on the **Subnet** link
3. Click on the **Security List** (e.g., "Default Security List")
4. Click **"Add Ingress Rules"**

### Step 4: Add HTTP Rule
- **Source Type**: CIDR
- **Source CIDR**: `0.0.0.0/0`
- **IP Protocol**: TCP
- **Source Port Range**: (leave empty)
- **Destination Port Range**: `80`
- **Description**: HTTP access for web app

Click **"Add Ingress Rules"**

### Step 5: (Optional) Add HTTPS Rule
Repeat step 4 but use port `443` for HTTPS

---

## 🧪 Testing After Deployment

### 1. Check from Local Machine
```bash
curl http://140.245.9.30/
```

### 2. Check in Browser
Open: http://140.245.9.30

You should see the Vaishnav Bhakti login page!

### 3. Check Services on Oracle (SSH)
```bash
ssh -i ~/Downloads/your-key.pem ubuntu@140.245.9.30

# On the Oracle server:
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql
```

---

## 🔧 Manual Deployment (Alternative)

If the automated script doesn't work, here's the manual process:

### Step 1: Copy Files
```bash
# From your local machine
scp -i ~/Downloads/your-key.pem -r /var/www/html/chaitanyabhakti ubuntu@140.245.9.30:~/
```

### Step 2: SSH to Oracle
```bash
ssh -i ~/Downloads/your-key.pem ubuntu@140.245.9.30
```

### Step 3: Install Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
npm install -g pm2

# Install NGINX
sudo apt install -y nginx

# Install MySQL
sudo apt install -y mysql-server
```

### Step 4: Setup Database
```bash
sudo mysql << 'EOF'
CREATE DATABASE vaishnav_bhakti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vaishnav_user'@'localhost' IDENTIFIED BY 'VaishnavaSecure2024!';
GRANT ALL PRIVILEGES ON vaishnav_bhakti.* TO 'vaishnav_user'@'localhost';
FLUSH PRIVILEGES;
EOF

cd ~/chaitanyabhakti/backend
sudo mysql vaishnav_bhakti < schema.sql
sudo mysql vaishnav_bhakti < breath_schema.sql
```

### Step 5: Create Environment File
```bash
cd ~/chaitanyabhakti/backend
nano .env
```

Add:
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vaishnav_bhakti
DB_USER=vaishnav_user
DB_PASSWORD=VaishnavaSecure2024!
JWT_SECRET=your_secure_random_32_char_string_here
CLIENT_URL=http://140.245.9.30
BACKEND_URL=http://140.245.9.30
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 6: Install Dependencies
```bash
cd ~/chaitanyabhakti/backend
npm install --production

cd ~/chaitanyabhakti/frontend
npm install
npm run build
```

### Step 7: Start Backend
```bash
cd ~/chaitanyabhakti
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Run the command it outputs
```

### Step 8: Configure NGINX
```bash
# Update nginx.conf
cd ~/chaitanyabhakti
sed -i 's|/var/www/html/chaitanyabhakti|/home/ubuntu/chaitanyabhakti|g' nginx.conf
sed -i 's/server_name.*/server_name 140.245.9.30;/' nginx.conf

# Copy to NGINX
sudo cp nginx.conf /etc/nginx/sites-available/chaitanyabhakti
sudo ln -sf /etc/nginx/sites-available/chaitanyabhakti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and start
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### Step 9: Configure Firewall (on instance)
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## 🚨 Troubleshooting

### Can't SSH to Oracle
```bash
# Fix key permissions
chmod 400 ~/Downloads/your-key.pem

# Try again
ssh -i ~/Downloads/your-key.pem ubuntu@140.245.9.30
```

### Site Still Not Accessible
1. **Check Oracle Security List** (most common issue!)
   - Must have ingress rule for port 80
   - Source: 0.0.0.0/0

2. **Check NGINX**
   ```bash
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check Backend**
   ```bash
   pm2 logs vaishnav-bhakti-backend
   ```

4. **Check Firewall on Instance**
   ```bash
   sudo iptables -L -n | grep 80
   ```

### Database Connection Errors
```bash
# Test database
mysql -u vaishnav_user -p vaishnav_bhakti -e "SHOW TABLES;"
# Password: VaishnavaSecure2024!

# Check backend logs
pm2 logs vaishnav-bhakti-backend --err
```

---

## 📊 Service Management

### View Status
```bash
pm2 status                    # Backend
sudo systemctl status nginx   # NGINX
sudo systemctl status mysql   # Database
```

### View Logs
```bash
pm2 logs vaishnav-bhakti-backend
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services
```bash
pm2 restart vaishnav-bhakti-backend
sudo systemctl restart nginx
```

---

## ✅ Success Checklist

- [ ] SSH connection works
- [ ] Automated script completed successfully
- [ ] Oracle Cloud Security List configured (port 80 open)
- [ ] `curl http://140.245.9.30/` returns HTML
- [ ] Browser shows login page at http://140.245.9.30
- [ ] Can register and login
- [ ] All features working

---

**Once security list is configured, your app will be live at http://140.245.9.30!** 🎉
