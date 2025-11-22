#!/bin/bash

# Vaishnav Bhakti App - Deployment Script
# This script helps deploy the app to Render and Vercel

echo "🚀 Vaishnav Bhakti App Deployment Script"
echo "========================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    exit 1
fi

# Check if GitHub remote is configured
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ GitHub remote not found. Please add your GitHub repository:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "git push -u origin main"
    exit 1
fi

echo "✅ Git repository configured"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js
if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "✅ Dependencies installed"

# Build frontend
echo "🏗️  Building frontend..."
cd frontend && npm run build && cd ..

echo "✅ Frontend built successfully"

# Create deployment summary
echo ""
echo "📝 Deployment Summary"
echo "===================="
echo ""
echo "Backend (Render):"
echo "- Service: vaishnav-bhakti-backend"
echo "- Framework: Node.js"
echo "- Build Command: cd backend && npm install"
echo "- Start Command: cd backend && npm start"
echo "- Port: 10000"
echo ""
echo "Frontend (Vercel):"
echo "- Framework: Create React App"
echo "- Build Command: npm run build"
echo "- Output Directory: build"
echo "- Environment: REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com"
echo ""
echo "Database (Render):"
echo "- Type: PostgreSQL"
echo "- Plan: Free"
echo "- Name: vaishnav_bhakti"
echo ""

echo "🎯 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy Backend (Render):"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will auto-detect render.yaml"
echo ""
echo "3. Deploy Frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Click 'New Project'"
echo "   - Import your GitHub repository"
echo "   - Configure frontend settings"
echo "   - Add REACT_APP_API_URL environment variable"
echo ""
echo "4. Update URLs:"
echo "   - After deployment, update CLIENT_URL in Render"
echo "   - Update API URLs if domains change"
echo ""
echo "🚀 Ready to deploy! Follow the steps above."
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"