#!/bin/bash

# =====================================================
# Quick Setup Script - Continue from Step 5.2
# Vaishnav Bhakti App VPS Deployment
# =====================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Vaishnav Bhakti App - Quick Setup Script      ║${NC}"
echo -e "${BLUE}║         Continuing from Step 5.2                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Project directory
PROJECT_DIR="/var/www/html/chaitanyabhakti"
cd $PROJECT_DIR

# Step 1: Install PM2 (if not installed)
print_info "Step 1: Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_success "PM2 already installed"
fi

# Step 2: Install NGINX (if not installed)
print_info "Step 2: Checking NGINX installation..."
if ! command -v nginx &> /dev/null; then
    print_warning "NGINX not found. Installing NGINX..."
    sudo apt update
    sudo apt install -y nginx
    print_success "NGINX installed successfully"
else
    print_success "NGINX already installed"
fi

# Step 3: Create logs directory
print_info "Step 3: Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Step 4: Install backend dependencies
print_info "Step 4: Installing backend dependencies..."
cd backend
npm install --production
cd ..
print_success "Backend dependencies installed"

# Step 5: Setup database
print_warning "Step 5: Database Setup"
echo "Please run the following commands in MySQL:"
echo ""
echo "sudo mysql -u root -p"
echo ""
echo "Then run these SQL commands:"
echo "---------------------------------------------------"
echo "CREATE DATABASE IF NOT EXISTS vaishnav_bhakti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "CREATE USER IF NOT EXISTS 'vaishnav_user'@'localhost' IDENTIFIED BY 'VaishnavaSecure2024!';"
echo "GRANT ALL PRIVILEGES ON vaishnav_bhakti.* TO 'vaishnav_user'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"
echo "---------------------------------------------------"
echo ""
echo "Then import schema:"
echo "mysql -u vaishnav_user -p vaishnav_bhakti < backend/schema.sql"
echo "mysql -u vaishnav_user -p vaishnav_bhakti < backend/breath_schema.sql"
echo ""
read -p "Press Enter when database setup is complete..."

# Step 6: Start backend with PM2
print_info "Step 6: Starting backend with PM2..."
pm2 stop vaishnav-bhakti-backend 2>/dev/null || true
pm2 delete vaishnav-bhakti-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
print_success "Backend started with PM2"

# Step 7: Setup PM2 startup
print_info "Step 7: Setting up PM2 startup script..."
pm2 startup systemd -u $USER --hp $HOME | grep "sudo" | bash || true
print_success "PM2 startup configured"

# Step 8: Configure NGINX
print_info "Step 8: Configuring NGINX..."
sudo cp nginx.conf /etc/nginx/sites-available/chaitanyabhakti
sudo ln -sf /etc/nginx/sites-available/chaitanyabhakti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
print_success "NGINX configuration copied"

# Step 9: Test and reload NGINX
print_info "Step 9: Testing NGINX configuration..."
sudo nginx -t
print_success "NGINX configuration test passed"

print_info "Starting and reloading NGINX..."
sudo systemctl enable nginx
sudo systemctl start nginx 2>/dev/null || true
sudo systemctl reload nginx
print_success "NGINX started and reloaded"

# Step 10: Configure firewall (optional)
print_warning "Step 10: Firewall Configuration (Optional)"
read -p "Do you want to configure UFW firewall? (y/n): " configure_firewall
if [[ $configure_firewall == "y" ]]; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    print_success "Firewall configured"
else
    print_info "Skipping firewall configuration"
fi

# Final checks
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Deployment Status Check               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

print_info "Checking services status..."
echo ""

# Check PM2
if pm2 status | grep -q "vaishnav-bhakti-backend"; then
    print_success "Backend is running (PM2)"
else
    print_error "Backend is NOT running"
fi

# Check NGINX
if sudo systemctl is-active --quiet nginx; then
    print_success "NGINX is running"
else
    print_error "NGINX is NOT running"
fi

# Check MySQL
if sudo systemctl is-active --quiet mysql; then
    print_success "MySQL is running"
else
    print_error "MySQL is NOT running"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                Test Your Application               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

print_info "Testing endpoints..."
echo ""

# Test frontend
print_info "Testing frontend: http://140.245.9.30/"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://140.245.9.30/ || print_warning "Frontend test failed"

# Test API
print_info "Testing API: http://140.245.9.30/api/"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://140.245.9.30/api/ || print_warning "API test failed"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            🎉 Deployment Complete! 🎉              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

print_success "Frontend: http://140.245.9.30"
print_success "Backend API: http://140.245.9.30/api"
echo ""

print_info "Useful Commands:"
echo "  View backend logs:  pm2 logs vaishnav-bhakti-backend"
echo "  View NGINX logs:    sudo tail -f /var/log/nginx/error.log"
echo "  Restart backend:    pm2 restart vaishnav-bhakti-backend"
echo "  Restart NGINX:      sudo systemctl restart nginx"
echo "  Quick redeploy:     ./deploy-vps.sh"
echo ""

print_warning "IMPORTANT: Make sure to update your backend/.env file with:"
print_warning "  - DB_PASSWORD (from database setup)"
print_warning "  - JWT_SECRET (generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
echo ""

print_success "Your Vaishnav Bhakti App is now live! 🕉️📿"
