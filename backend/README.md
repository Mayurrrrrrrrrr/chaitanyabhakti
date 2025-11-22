# Vaishnav Bhakti App - Backend

This is the backend API for the Vaishnav Bhakti App, built with Express.js and MySQL.

## Deployment on Render

### Prerequisites
- Git repository with this code
- Render account (free tier)

### Automatic Deployment Steps
1. Fork/clone this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and create:
   - Backend web service
   - PostgreSQL database (free tier)
   - All environment variables

### Manual Deployment (Alternative)
1. Create a new "Web Service" on Render
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000` (Render's default)
   - Database connection variables from your database service
   - `JWT_SECRET` (generate a secure random string)
   - `CLIENT_URL=https://chaitanyabhakti.vercel.app`

### Database Setup
The database will be automatically created by Render. The backend uses MySQL syntax but Render provides PostgreSQL. The app should work with PostgreSQL as well since we're using standard SQL queries.

### API Endpoints
- `/api/auth/*` - Authentication routes
- `/api/japa` - Japa counter routes (protected)
- `/api/families` - Family management (protected)
- `/api/tasks` - Task management (protected)
- `/api/medicines` - Medicine tracking (protected)
- `/api/scriptures` - Scripture library (protected)
- `/api/community` - Community features (protected)
- `/api/media` - Media management (protected)
- `/api/user` - User profile (protected)
- `/api/events` - Event management (protected)
- `/api/admin/*` - Admin routes (protected + admin only)

### File Uploads
The app supports file uploads for images, audio, video, and PDFs. Files are stored locally on the server in the `/uploads` directory.

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000 locally, 10000 on Render)
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS

### Local Development
```bash
cd backend
npm install
npm run dev
```