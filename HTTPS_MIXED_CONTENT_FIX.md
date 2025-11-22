# Vaishnav Bhakti App - HTTPS Mixed Content Fix

## Problem Identified
Your frontend on Vercel (HTTPS) is trying to make API calls to `http://192.168.29.35:5000` (HTTP local IP), causing:
1. **Mixed Content Error**: HTTPS page requesting HTTP resources
2. **Connection Refused**: Local IP not accessible from Vercel

## Root Cause
The API service was defaulting to `localhost:5000` instead of your Render backend URL.

## Solution Applied

### 1. Updated API Base URL in services/api.js
```javascript
// Changed from:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// To:
const API_URL = process.env.REACT_APP_API_URL || 'https://vaishnav-bhakti-backend.onrender.com';
```

### 2. Environment Variables Required
**Frontend (Vercel):**
```
REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com
```

**Backend (Render):**
```
CLIENT_URL=https://chaitanyabhakti.vercel.app
```

## Testing Steps

1. **Deploy updated code to Vercel**
2. **Set environment variable:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com`
3. **Redeploy the project**
4. **Test login flow:**
   - Navigate to your Vercel URL
   - Try OTP login
   - Check browser console for any remaining errors

## Expected Behavior
- All API calls should go to `https://vaishnav-bhakti-backend.onrender.com/api/*`
- No more mixed content errors
- No more connection refused errors
- Login should work properly

## Common Issues After Fix

1. **CORS errors**: Ensure `CLIENT_URL` in backend matches your Vercel URL
2. **API endpoint errors**: Verify backend endpoints are working
3. **Token issues**: Clear browser localStorage and try again

## Verification
Open browser dev tools and check:
- Network tab: All API calls should be HTTPS to render.com
- Console: No mixed content errors
- Application should load and login should work

Your login should now work correctly on Vercel! 🎉