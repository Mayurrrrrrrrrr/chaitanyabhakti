#!/bin/bash

# =====================================================
# Sync VPS to Local Script
# =====================================================

# Configuration
VPS_USER="ubuntu"
VPS_IP="140.245.9.30"
KEY_PATH="/home/samriddhi/.ssh/oracle.key"
REMOTE_DIR="/home/ubuntu/chaitanyabhakti"
LOCAL_DB_USER="vaishnav_user"
LOCAL_DB_PASS="password123"
LOCAL_DB_NAME="vaishnavbhakti"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Ensure key permissions
chmod 600 "$KEY_PATH"

print_warning "Starting sync from VPS ($VPS_IP)..."

# 1. Sync Code (Rsync)
print_warning "Syncing files..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i $KEY_PATH" \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'backend/node_modules' \
    --exclude 'frontend/node_modules' \
    --exclude '.env' \
    --exclude 'backend/.env' \
    --exclude 'logs' \
    "$VPS_USER@$VPS_IP:$REMOTE_DIR/" ./

if [ $? -eq 0 ]; then
    print_success "Files synced successfully."
else
    print_error "File sync failed."
    exit 1
fi

# 2. Backup Local DB
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="local_backup_$TIMESTAMP.sql"
print_warning "Backing up local database to $BACKUP_FILE..."
mysqldump -u"$LOCAL_DB_USER" -p"$LOCAL_DB_PASS" "$LOCAL_DB_NAME" > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Local backup created."
else
    print_warning "Could not create local backup (maybe DB doesn't exist yet?). Continuing..."
fi

# 3. Sync Database
print_warning "Syncing database from VPS..."
# We try to dump from remote and pipe to local
# Note: This assumes the remote user has permissions to dump without password or we can read .env
# We will try to read the remote .env to get credentials if possible, or assume standard ones.
# Since we don't have a robust way to parse remote .env in one line easily without risk, 
# we will try to use the same credentials as local if they match, or rely on 'sudo mysqldump' if user has sudo.
# Let's try to grab remote DB creds first.

print_warning "Fetching remote database credentials..."
REMOTE_DB_USER=$(ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$VPS_USER@$VPS_IP" "grep DB_USER $REMOTE_DIR/backend/.env | cut -d= -f2")
REMOTE_DB_PASS=$(ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$VPS_USER@$VPS_IP" "grep DB_PASSWORD $REMOTE_DIR/backend/.env | cut -d= -f2")
REMOTE_DB_NAME=$(ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$VPS_USER@$VPS_IP" "grep DB_NAME $REMOTE_DIR/backend/.env | cut -d= -f2")

# Clean up whitespace
REMOTE_DB_USER=$(echo "$REMOTE_DB_USER" | tr -d '\r')
REMOTE_DB_PASS=$(echo "$REMOTE_DB_PASS" | tr -d '\r')
REMOTE_DB_NAME=$(echo "$REMOTE_DB_NAME" | tr -d '\r')

if [ -z "$REMOTE_DB_USER" ]; then
    print_error "Could not fetch remote DB credentials. Aborting DB sync."
    exit 1
fi

print_warning "Dumping remote database ($REMOTE_DB_NAME)..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$VPS_USER@$VPS_IP" "mysqldump -u$REMOTE_DB_USER -p$REMOTE_DB_PASS $REMOTE_DB_NAME" | mysql -u"$LOCAL_DB_USER" -p"$LOCAL_DB_PASS" "$LOCAL_DB_NAME"

if [ $? -eq 0 ]; then
    print_success "Database synced successfully!"
else
    print_error "Database sync failed."
    exit 1
fi

print_success "🎉 Sync completed! Local environment is now up to date with VPS."
