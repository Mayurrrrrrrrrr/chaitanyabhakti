#!/bin/bash

# Database Setup Script
# Run this to setup the MySQL database for Vaishnav Bhakti App

echo "Setting up MySQL database for Vaishnav Bhakti App..."
echo ""

# Create database and user
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS vaishnav_bhakti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vaishnav_user'@'localhost' IDENTIFIED BY 'VaishnavaSecure2024!';
GRANT ALL PRIVILEGES ON vaishnav_bhakti.* TO 'vaishnav_user'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully!' AS Status;
SHOW DATABASES;
EOF

echo ""
echo "Importing schema..."

# Import main schema
sudo mysql vaishnav_bhakti < /var/www/html/chaitanyabhakti/backend/schema.sql

# Import breath schema
sudo mysql vaishnav_bhakti < /var/www/html/chaitanyabhakti/backend/breath_schema.sql

echo ""
echo "Verifying tables..."
sudo mysql vaishnav_bhakti -e "SHOW TABLES;"

echo ""
echo "✅ Database setup complete!"
