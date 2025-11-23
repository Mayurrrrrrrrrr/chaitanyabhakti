# Vaishnav Bhakti App - Manual Vercel Deployment Guide

## ✅ Backend Status: DEPLOYED
Your backend is successfully deployed at: `https://chaitanyabhakti.onrender.com`

## 🚀 Frontend Deployment Steps

### Step 1: Go to Vercel Dashboard
1. Visit [https://vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"

### Step 2: Import Your Repository
1. Select your GitHub repository (Mayurrrrrrrrrr/chaitanyabhakti)
2. Click "Import"

### Step 3: Configure Project Settings
Set these configurations:
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### Step 4: Add Environment Variable
Add this environment variable:
```
REACT_APP_API_URL=https://chaitanyabhakti.onrender.com
```

### Step 5: Deploy
Click "Deploy" and wait for the build to complete.

## 🎯 Expected URLs After Deployment
- **Frontend**: `https://chaitanyabhakti.vercel.app` (or similar)
- **Backend**: `https://chaitanyabhakti.onrender.com`
- **API Base**: `https://chaitanyabhakti.onrender.com/api`

## ✅ Code Changes Already Applied
1. **Fixed API endpoints** to use `/api/*` prefix
2. **Updated backend URL** to `https://chaitanyabhakti.onrender.com`
3. **Updated CORS configuration** for new backend URL
4. **Fixed mixed content issues** (HTTPS to HTTPS)
5. **Pushed all changes** to GitHub

## 🔧 Configuration Files Updated
- `frontend/src/services/api.js` - API base URL
- `frontend/vercel.json` - Proxy configuration
- `backend/server.js` - CORS settings

## 🧪 Testing After Deployment

### Test Login Functionality:
1. Visit your deployed frontend URL
2. Try OTP login with mobile number: `1234567890`
3. Check browser console for any errors
4. Verify successful authentication and redirect

### Test API Endpoints:
```bash
# Test OTP endpoint
curl -X POST https://chaitanyabhakti.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"1234567890"}'

# Test login endpoint
curl -X POST https://chaitanyabhakti.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"1234567890","password":"test123"}'
```

## 🚨 Common Issues & Solutions

### Issue: Build fails on Vercel
**Solution**: Check the build logs in Vercel dashboard. Usually it's a missing dependency or environment variable.

### Issue: CORS errors
**Solution**: Ensure your frontend URL is added to backend CORS settings in `backend/server.js`

### Issue: API calls failing
**Solution**: Check browser console and network tab. Verify the API URL is correct.

### Issue: Login not working
**Solution**: Clear browser cache and localStorage, then try again.

## 📱 Mobile Testing
Test on mobile devices to ensure:
- Responsive design works
- Login functionality works
- No mixed content errors

## 🎉 Success Criteria
- [ ] Frontend loads without errors
- [ ] Login works with OTP
- [ ] Login works with password
- [ ] Dashboard loads after login
- [ ] No console errors
- [ ] API calls use HTTPS
- [ ] CORS working properly

Once deployed, your Vaishnav Bhakti App should be fully functional! 🕉️📿