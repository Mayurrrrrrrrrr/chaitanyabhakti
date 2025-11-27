#!/bin/bash

# Non-interactive Oracle Cloud Deployment Script
# Uses pre-configured values

set -e

# Configuration (hardcoded for automation)
ORACLE_IP="140.245.9.30"
ORACLE_USER="ubuntu"
SSH_KEY="$HOME/.ssh/oracle.key"
REMOTE_DIR="/home/ubuntu/chaitanyabhakti"
LOCAL_DIR="/var/www/html/chaitanyabhakti"

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
echo -e "${BLUE}║     Deploy to Oracle Cloud (Automated)            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Test SSH
print_info "Step 1: Testing SSH connection..."
if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${ORACLE_USER}@${ORACLE_IP} "echo 'Connected'" 2>/dev/null | grep -q "Connected"; then
    print_success "SSH connection successful"
else
    print_error "Cannot connect to Oracle Cloud"
    exit 1
fi

# Step 2: Prepare server
print_info "Step 2: Preparing Oracle Cloud server..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    if [ -d ~/chaitanyabhakti ]; then
        echo "Creating backup..."
        cp -r ~/chaitanyabhakti ~/chaitanyabhakti.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    fi
    mkdir -p ~/chaitanyabhakti
ENDSSH
print_success "Server prepared"

# Step 3: Copy files
print_info "Step 3: Copying project files..."
rsync -az --progress -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'frontend/node_modules' \
    --exclude 'backend/node_modules' \
    --exclude 'frontend/build' \
    --exclude 'logs' \
    --exclude '.env' \
    ${LOCAL_DIR}/ \
    ${ORACLE_USER}@${ORACLE_IP}:${REMOTE_DIR}/
print_success "Files copied"

# Step 4: Create .env file
print_info "Step 4: Creating environment configuration..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
cat > ~/chaitanyabhakti/backend/.env <<'EOF'
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vaishnavbhakti
DB_USER=vaishnav_user
DB_PASSWORD=VaishnavaSecure2024!
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
CLIENT_URL=http://140.245.9.30
BACKEND_URL=http://140.245.9.30
EOF
ENDSSH
print_success "Environment configured"

# Step 5: Install software
print_info "Step 5: Installing software (Node  .js, PM2, NGINX, MySQL)..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    set -e
    sudo apt update -qq
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - >/dev/null 2>&1
        sudo apt install -y nodejs >/dev/null 2>&1
    fi
    
    # PM2
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        sudo npm install -g pm2 >/dev/null 2>&1
    fi
    
    # NGINX
    if ! command -v nginx &> /dev/null; then
        echo "Installing NGINX..."
        sudo apt install -y nginx >/dev/null 2>&1
    fi
    
    # MySQL
    if ! command -v mysql &> /dev/null; then
        echo "Installing MySQL..."
        sudo DEBIAN_FRONTEND=noninteractive apt install -y mysql-server >/dev/null 2>&1
    fi
    
    echo "Software installation complete"
ENDSSH
print_success "Software installed"

# Step 6: Setup database
print_info "Step 6: Setting up MySQL database..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    sudo mysql <<'EOF'
CREATE DATABASE IF NOT EXISTS vaishnavbhakti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vaishnav_user'@'localhost' IDENTIFIED BY 'VaishnavaSecure2024!';
GRANT ALL PRIVILEGES ON vaishnavbhakti.* TO 'vaishnav_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    cd ~/chaitanyabhakti/backend
    if [ -f schema.sql ]; then
        sudo mysql vaishnavbhakti < schema.sql 2>/dev/null || echo "Schema already exists"
    fi
    if [ -f breath_schema.sql ]; then
        sudo mysql vaishnavbhakti < breath_schema.sql 2>/dev/null || echo "Breath schema already exists"
    fi
ENDSSH
print_success "Database configured"

# Step 7: Install dependencies
print_info "Step 7: Installing dependencies..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    cd ~/chaitanyabhakti/backend
    npm install --production --silent
    
    cd ~/chaitanyabhakti/frontend
    export REACT_APP_API_URL=http://140.245.9.30
    npm install --silent
    npm run build --silent
ENDSSH
print_success "Dependencies installed and frontend built"

# Step 8: Start backend with PM2
print_info "Step 8: Starting backend with PM2..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    cd ~/chaitanyabhakti
    mkdir -p logs
    
    pm2 delete vaishnav-bhakti-backend 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup systemd -u $USER --hp $HOME 2>/dev/null | grep "sudo" | bash || true
ENDSSH
print_success "Backend started with PM2"

# Step 9: Configure NGINX
print_info "Step 9: Configuring NGINX..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    # Create fresh Nginx config
    cat > /tmp/chaitanyabhakti.conf <<'EOF'
server {
    listen 80;
    server_name 140.245.9.30;
    
    # Frontend - serve React app
    location / {
        root /home/ubuntu/chaitanyabhakti/frontend/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # Backend API - proxy to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve uploaded files
    location /uploads {
        alias /home/ubuntu/chaitanyabhakti/backend/uploads;
    }
}
EOF
    
    sudo cp /tmp/chaitanyabhakti.conf /etc/nginx/sites-available/chaitanyabhakti
    sudo ln -sf /etc/nginx/sites-available/chaitanyabhakti /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    sudo nginx -t
    sudo systemctl enable nginx
    sudo systemctl restart nginx
ENDSSH
print_success "NGINX configured"

# Step 10: Configure firewall
print_info "Step 10: Configuring firewall..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
    sudo netfilter-persistent save 2>/dev/null || sudo iptables-save | sudo tee /etc/iptables/rules.v4 >/dev/null 2>&1 || true
ENDSSH
print_success "Firewall configured"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            🎉 Deployment Complete! 🎉              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
print_success "Your app should be live at: http://140.245.9.30"
echo ""
print_warning "IMPORTANT: Configure Oracle Cloud Console Security List"
echo "Add Ingress Rule: Source 0.0.0.0/0, TCP Port 80"
echo ""

# Test status
print_info "Checking services..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} bash <<'ENDSSH'
    pm2 status
    sudo systemctl status nginx --no-pager | head -5
ENDSSH

print_success "Deployment script completed!"
