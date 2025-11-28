#!/bin/bash

# =====================================================
# Vaishnav Bhakti App - VPS Deployment Script
# =====================================================

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/var/www/html/chaitanyabhakti"

# Function to print colored output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Navigate to project directory
cd $PROJECT_DIR || { print_error "Project directory not found!"; exit 1; }

# Step 1: Pull latest code
print_warning "Pulling latest code from git..."
git pull origin main || git pull origin master || print_warning "Git pull failed or not a git repo"
print_success "Code updated"

# Step 2: Install/update backend dependencies
print_warning "Installing backend dependencies..."
cd backend
npm install --production
print_success "Backend dependencies installed"

# Step 3: Build frontend
print_warning "Building frontend..."
cd ../frontend
npm install
npm run build
print_success "Frontend built successfully"

# Step 4: Restart backend with PM2
print_warning "Restarting backend with PM2..."
cd ..
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
print_success "Backend restarted"

# Step 5: Reload NGINX
print_warning "Reloading NGINX..."
sudo nginx -t && sudo systemctl reload nginx
print_success "NGINX reloaded"

# Step 6: Check status
print_warning "Checking services status..."
echo ""
echo "Backend PM2 Status:"
pm2 status
echo ""
echo "NGINX Status:"
sudo systemctl status nginx --no-pager -l
echo ""

print_success "🎉 Deployment completed successfully!"
print_success "Frontend: http://140.245.9.30"
print_success "Backend API: http://140.245.9.30/api"

# Show recent logs
print_warning "Recent PM2 logs:"
pm2 logs --lines 20 --nostream
