# Vaishnav Bhakti App - Frontend

This is the React frontend for the Vaishnav Bhakti App.

## Deployment on Vercel

### Prerequisites
- Git repository with this code
- Vercel account (free tier)

### Automatic Deployment Steps
1. Fork/clone this repository to your GitHub account
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add environment variables:
   - `REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com`
7. Deploy!

### Manual Deployment (Alternative)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Follow the prompts and configure:
   - Project Name: vaishnav-bhakti-frontend
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

### Environment Variables
Create a `.env` file in the frontend directory with:
```
REACT_APP_API_URL=https://vaishnav-bhakti-backend.onrender.com
```

### API Configuration
The frontend is configured to proxy API requests to the backend through:
- `/api/*` → Backend API
- `/uploads/*` → Backend file uploads

This is configured in `vercel.json` for production deployment.

### Local Development
```bash
cd frontend
npm install
npm start
```

### Build for Production
```bash
cd frontend
npm run build
```

### Features
- User authentication
- Japa counter
- Family management
- Task tracking
- Medicine reminders
- Scripture library
- Community features
- Media management
- Event calendar
- Admin panel
- Breath exercise (breathe app)

### Technologies Used
- React 19
- React Router DOM
- Axios for API calls
- JWT for authentication
- Create React App
- React Icons
- React Player for media
