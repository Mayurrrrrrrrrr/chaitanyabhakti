#!/bin/bash

# =====================================================
# Deploy to Oracle Cloud VPS
# Target: 140.245.9.30
# =====================================================

set -e

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
echo -e "${BLUE}║     Deploy to Oracle Cloud VPS (140.245.9.30)     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
ORACLE_IP="140.245.9.30"
ORACLE_USER=""  # Will be prompted
SSH_KEY=""      # Will be prompted
REMOTE_DIR="/home/\$ORACLE_USER/chaitanyabhakti"

# Get Oracle Cloud credentials
print_warning "Oracle Cloud VPS Configuration"
echo ""
read -p "Enter Oracle Cloud username (usually 'ubuntu' or 'opc'): " ORACLE_USER
echo ""
read -p "Enter path to SSH private key (e.g., ~/.ssh/id_rsa or ~/Downloads/oracle-key.pem): " SSH_KEY

# Expand tilde
SSH_KEY="${SSH_KEY/#\~/$HOME}"

# Verify SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key not found at: $SSH_KEY"
    exit 1
fi

# Update remote directory with actual username
REMOTE_DIR="/home/${ORACLE_USER}/chaitanyabhakti"

print_info "Testing SSH connection to Oracle Cloud..."
if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${ORACLE_USER}@${ORACLE_IP} "echo 'Connection successful'" 2>/dev/null; then
    print_success "SSH connection successful"
else
    print_error "Cannot connect to Oracle Cloud server"
    print_warning "Please check:"
    echo "  1. SSH key is correct"
    echo "  2. Username is correct (ubuntu or opc)"
    echo "  3. Oracle Cloud Security List allows SSH (port 22)"
    echo "  4. Instance is running"
    exit 1
fi

# Step 1: Create backup and clean directory on Oracle
print_info "Step 1: Preparing Oracle Cloud server..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    # Backup existing if present
    if [ -d ~/chaitanyabhakti ]; then
        echo "Creating backup..."
        cp -r ~/chaitanyabhakti ~/chaitanyabhakti.backup.$(date +%Y%m%d_%H%M%S)
    fi
    # Create fresh directory
    mkdir -p ~/chaitanyabhakti
ENDSSH
print_success "Server prepared"

# Step 2: Copy project files
print_info "Step 2: Copying project files to Oracle Cloud..."
print_warning "This may take a few minutes depending on your internet speed..."

rsync -avz --progress -e "ssh -i $SSH_KEY" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'frontend/node_modules' \
    --exclude 'backend/node_modules' \
    --exclude 'frontend/build' \
    --exclude 'logs' \
    --exclude '.env' \
    /var/www/html/chaitanyabhakti/ \
    ${ORACLE_USER}@${ORACLE_IP}:${REMOTE_DIR}/

print_success "Files copied successfully"

# Step 3: Setup environment file
print_info "Step 3: Creating environment configuration..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << ENDSSH
cat > ${REMOTE_DIR}/backend/.env << 'EOF'
# Backend Environment Variables for Oracle Cloud
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vaishnav_bhakti
DB_USER=vaishnav_user
DB_PASSWORD=VaishnavaSecure2024!

# JWT Secret (generate new one for production)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || echo "CHANGE_THIS_TO_SECURE_SECRET_KEY_MINIMUM_32_CHARACTERS")

# URLs
CLIENT_URL=http://140.245.9.30
BACKEND_URL=http://140.245.9.30
EOF
ENDSSH
print_success "Environment configured"

# Step 4: Install dependencies and setup server
print_info "Step 4: Installing software on Oracle Cloud..."
print_warning "This will install Node.js, PM2, NGINX, and MySQL..."

ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    set -e
    
    echo "Updating system..."
    sudo apt update
    
    echo "Installing Node.js..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    echo "Installing PM2..."
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    echo "Installing NGINX..."
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
    fi
    
    echo "Installing MySQL..."
    if ! command -v mysql &> /dev/null; then
        sudo apt install -y mysql-server
    fi
    
    echo "Software installation complete!"
ENDSSH
print_success "Software installed"

# Step 5: Setup database
print_info "Step 5: Setting up MySQL database..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    sudo mysql << 'EOF'
CREATE DATABASE IF NOT EXISTS vaishnav_bhakti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vaishnav_user'@'localhost' IDENTIFIED BY 'VaishnavaSecure2024!';
GRANT ALL PRIVILEGES ON vaishnav_bhakti.* TO 'vaishnav_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    # Import schemas
    cd ~/chaitanyabhakti/backend
    sudo mysql vaishnav_bhakti < schema.sql
    sudo mysql vaishnav_bhakti < breath_schema.sql
    
    echo "Database setup complete!"
ENDSSH
print_success "Database configured"

# Step 6: Install dependencies
print_info "Step 6: Installing Node.js dependencies..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    # Backend dependencies
    cd ~/chaitanyabhakti/backend
    npm install --production
    
    # Frontend dependencies and build
    cd ~/chaitanyabhakti/frontend
    npm install
    npm run build
ENDSSH
print_success "Dependencies installed and frontend built"

# Step 7: Setup PM2
print_info "Step 7: Starting backend with PM2..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    cd ~/chaitanyabhakti
    mkdir -p logs
    
    pm2 delete vaishnav-bhakti-backend 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup systemd -u $USER --hp $HOME | grep "sudo" | bash || true
ENDSSH
print_success "Backend started with PM2"

# Step 8: Configure NGINX
print_info "Step 8: Configuring NGINX..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    # Update nginx.conf with correct server_name
    sed -i "s/server_name.*/server_name 140.245.9.30;/" ~/chaitanyabhakti/nginx.conf
    
    # Update paths in nginx.conf to match Oracle paths
    sed -i "s|/var/www/html/chaitanyabhakti|/home/$USER/chaitanyabhakti|g" ~/chaitanyabhakti/nginx.conf
    
    # Copy to NGINX sites
    sudo cp ~/chaitanyabhakti/nginx.conf /etc/nginx/sites-available/chaitanyabhakti
    sudo ln -sf /etc/nginx/sites-available/chaitanyabhakti /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload
    sudo nginx -t
    sudo systemctl enable nginx
    sudo systemctl restart nginx
ENDSSH
print_success "NGINX configured"

# Step 9: Configure Oracle Cloud firewall
print_info "Step 9: Configuring Oracle Cloud firewall..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    # Open firewall ports on the instance
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
    sudo netfilter-persistent save 2>/dev/null || sudo iptables-save | sudo tee /etc/iptables/rules.v4 > /dev/null
ENDSSH
print_success "Firewall configured"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            🎉 Deployment Complete! 🎉              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

print_success "Your app is deployed at: http://140.245.9.30"
echo ""

print_warning "IMPORTANT: Oracle Cloud Security List Configuration"
echo ""
echo "You MUST also configure Oracle Cloud Console:"
echo "1. Go to: Oracle Cloud Console → Compute → Instances"
echo "2. Click on your instance"
echo "3. Click on the subnet link"
echo "4. Click on the Security List"
echo "5. Add Ingress Rules:"
echo "   - Source: 0.0.0.0/0"
echo "   - IP Protocol: TCP"
echo "   - Destination Port: 80"
echo "   - Description: HTTP access"
echo ""
echo "6. (Optional) Add HTTPS rule for port 443"
echo ""

print_info "Testing deployment..."
ssh -i "$SSH_KEY" ${ORACLE_USER}@${ORACLE_IP} << 'ENDSSH'
    echo ""
    echo "Services Status:"
    pm2 status
    echo ""
    sudo systemctl status nginx --no-pager | head -10
ENDSSH

echo ""
print_success "Deployment script completed!"
print_info "Visit http://140.245.9.30 in your browser"
