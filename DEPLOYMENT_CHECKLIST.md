# Vaishnav Bhakti App - Deployment Checklist

## Pre-Deployment Checklist

### Repository Setup
- [ ] Code is committed to GitHub
- [ ] All environment variables are configured
- [ ] Database schema is ready
- [ ] File upload directories exist

### Backend (Render)
- [ ] `render.yaml` file is present
- [ ] Backend runs locally without errors
- [ ] All API endpoints are working
- [ ] Database connection is configured
- [ ] File upload functionality tested

### Frontend (Vercel)
- [ ] `vercel.json` file is present
- [ ] Frontend builds successfully
- [ ] All routes are working
- [ ] API calls are configured
- [ ] Static assets are accessible

### Environment Variables
**Backend (Render):**
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `DB_HOST` (from Render database)
- [ ] `DB_PORT` (from Render database)
- [ ] `DB_NAME=vaishnav_bhakti`
- [ ] `DB_USER` (from Render database)
- [ ] `DB_PASSWORD` (from Render database)
- [ ] `JWT_SECRET` (secure random string)
- [ ] `CLIENT_URL=https://chaitanyabhakti.vercel.app`

**Frontend (Vercel):**
- [ ] `REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com`

## Deployment Steps

### Step 1: Deploy Backend
1. [ ] Go to [Render Dashboard](https://dashboard.render.com)
2. [ ] Click "New" → "Blueprint"
3. [ ] Connect GitHub repository
4. [ ] Wait for automatic deployment
5. [ ] Note the backend URL
6. [ ] Update frontend environment variables if URL changed

### Step 2: Deploy Frontend
1. [ ] Go to [Vercel Dashboard](https://vercel.com)
2. [ ] Click "New Project"
3. [ ] Import GitHub repository
4. [ ] Configure:
   - [ ] Framework: Create React App
   - [ ] Root Directory: `frontend`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `build`
5. [ ] Add environment variable: `REACT_APP_API_URL`
6. [ ] Deploy and note the frontend URL

### Step 3: Post-Deployment
1. [ ] Test user registration/login
2. [ ] Test all features:
   - [ ] Japa counter
   - [ ] Family management
   - [ ] Task management
   - [ ] Medicine reminders
   - [ ] Scripture library
   - [ ] Community features
   - [ ] Media uploads
   - [ ] Admin panel
   - [ ] Breath exercise
3. [ ] Check browser console for errors
4. [ ] Verify CORS is working
5. [ ] Test file uploads
6. [ ] Check database connectivity

### Step 4: Monitoring
1. [ ] Check Render logs for backend errors
2. [ ] Check Vercel deployment logs
3. [ ] Monitor database performance
4. [ ] Set up alerts if needed
5. [ ] Test on different devices/browsers

## Expected URLs
- **Frontend**: `https://chaitanyabhakti.vercel.app`
- **Backend**: `https://vaishnav-bhakti-backend.onrender.com`
- **API Base**: `https://vaishnav-bhakti-backend.onrender.com/api`

## Troubleshooting

### Common Issues
- [ ] CORS errors: Check `CLIENT_URL` in backend
- [ ] Database connection: Verify credentials in Render
- [ ] Build failures: Check logs in respective dashboards
- [ ] File uploads: Ensure `/uploads` directory exists
- [ ] Authentication: Check JWT secret configuration

### Support Resources
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Success Criteria
- [ ] App loads without errors
- [ ] User can register and login
- [ ] All features work as expected
- [ ] File uploads function properly
- [ ] Admin panel is accessible
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Mobile responsive

---

**Once all items are checked, your deployment is complete!** 🎉