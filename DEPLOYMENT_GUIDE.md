# Vaishnav Bhakti App - Complete Deployment Guide

This guide will help you deploy the entire Vaishnav Bhakti App (frontend, backend, and database) to free hosting services.

## Architecture Overview

```
Frontend (React) → Vercel
Backend (Express) → Render
Database (PostgreSQL) → Render
```

## Deployment Steps

### 1. Backend Deployment (Render)

**Option A: Automatic (Recommended)**
1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and create:
   - Backend web service
   - PostgreSQL database (free tier)
   - All environment variables

**Option B: Manual**
1. Create a new "Web Service" on Render
2. Connect your GitHub repository
3. Configure:
   - Name: `vaishnav-bhakti-backend`
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - Database credentials (from Render database)
   - `JWT_SECRET` (generate secure random string)
   - `CLIENT_URL=https://chaitanyabhakti.vercel.app`

### 2. Frontend Deployment (Vercel)

**Option A: Automatic**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variable:
   - `REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com`
6. Deploy!

**Option B: Manual**
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend: `cd frontend`
3. Run: `vercel`
4. Follow prompts with same configuration as above

### 3. Database Setup

The database is automatically created by Render when using the Blueprint method. It's a free PostgreSQL instance with:
- 1GB storage
- 100 concurrent connections
- Daily backups

### 4. Environment Variables

**Backend (Render):**
```
NODE_ENV=production
PORT=10000
DB_HOST=[from Render database]
DB_PORT=[from Render database]
DB_NAME=vaishnav_bhakti
DB_USER=[from Render database]
DB_PASSWORD=[from Render database]
JWT_SECRET=[generate random string]
CLIENT_URL=https://chaitanyabhakti.vercel.app
```

**Frontend (Vercel):**
```
REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com
```

### 5. Post-Deployment Configuration

1. **Update Backend CORS**: The backend is already configured to accept requests from `https://chaitanyabhakti.vercel.app`

2. **Update Frontend API URL**: The frontend `vercel.json` is configured to proxy API requests to the backend

3. **File Uploads**: Files are stored locally on the Render server. For production, consider using cloud storage like AWS S3 or Cloudinary (free tiers available)

### 6. Testing

After deployment:
1. Visit your Vercel URL (e.g., `https://chaitanyabhakti.vercel.app`)
2. Test user registration/login
3. Test all features (japa counter, family management, etc.)
4. Check browser console for any CORS or API errors

### 7. Monitoring

**Render Dashboard:**
- View logs, metrics, and database performance
- Set up alerts for downtime
- Monitor resource usage

**Vercel Dashboard:**
- View deployment logs
- Monitor performance metrics
- Check for build errors

### 8. Maintenance

- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular backups (handled by Render)
- Scale up if needed (paid plans available)

## Free Tier Limits

**Render (Free):**
- 750 hours/month (enough for one service)
- 512MB RAM
- 1GB storage for database
- 100GB bandwidth/month

**Vercel (Free):**
- 100GB bandwidth/month
- 6000 build minutes/month
- Serverless functions (not used here)
- Automatic HTTPS

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Check that `CLIENT_URL` in backend matches your Vercel URL
2. **Database Connection**: Verify database credentials in Render dashboard
3. **Build Failures**: Check build logs in Vercel/Render dashboards
4. **File Uploads**: Ensure `/uploads` directory exists (created automatically)

### Support:
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- Create issues in your GitHub repository

## Security Considerations

- JWT secret is automatically generated and secure
- Database credentials are managed by Render
- HTTPS is enabled automatically on both services
- Consider adding rate limiting for production use

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Add monitoring/alerting
3. Consider file storage optimization
4. Add more features as needed
5. Scale up when user base grows

Your app should now be fully deployed and accessible worldwide! 🚀