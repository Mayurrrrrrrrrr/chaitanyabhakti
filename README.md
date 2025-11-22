# Vaishnav Bhakti App

A full-stack devotional application for Vaishnav Bhakti practitioners with features for japa counting, family management, scripture library, and more.

## 🌟 Features

- **User Authentication**: Secure login/registration with JWT
- **Japa Counter**: Track your daily chanting
- **Family Management**: Manage family members and their progress
- **Task Management**: Create and track devotional tasks
- **Medicine Reminders**: Health tracking for family members
- **Scripture Library**: Browse and read devotional texts
- **Community Features**: Connect with other devotees
- **Media Management**: Upload and share devotional content
- **Event Calendar**: Track important dates and events
- **Admin Panel**: Manage users and content
- **Breath Exercise**: Guided breathing exercises for meditation

## 🏗️ Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- JWT for authentication
- Create React App
- Tailwind CSS (if configured)

### Backend
- Node.js with Express
- MySQL/PostgreSQL database
- JWT authentication
- Multer for file uploads
- CORS enabled

### Deployment
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)
- **Database**: PostgreSQL on Render (free tier)

## 🚀 Quick Deployment

### Prerequisites
- GitHub account
- Node.js installed locally

### One-Command Deployment
```bash
# Clone the repository
git clone https://github.com/yourusername/vaishnav-bhakti-app.git
cd vaishnav-bhakti-app

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

#### 1. Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will auto-detect configuration

#### 2. Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure frontend settings

## 📁 Project Structure

```
vaishnav-bhakti-app/
├── backend/                 # Express.js backend
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads directory
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── App.js          # Main app component
│   ├── public/             # Static files
│   │   └── breathe/        # Breath exercise app
│   └── package.json
├── render.yaml             # Render deployment config
└── deployment guide files
```

## 🔧 Local Development

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Copy the `.env.example` files and fill in your values:
- `backend/.env.example`
- `frontend/.env.example`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify token

### Protected Routes (require authentication)
- `/api/japa/*` - Japa counter operations
- `/api/families/*` - Family management
- `/api/tasks/*` - Task management
- `/api/medicines/*` - Medicine tracking
- `/api/scriptures/*` - Scripture library
- `/api/community/*` - Community features
- `/api/media/*` - Media management
- `/api/user/*` - User profile
- `/api/events/*` - Event management

### Admin Routes (require admin role)
- `/api/admin/*` - Admin panel operations

## 📱 Features in Detail

### Japa Counter
- Track daily chanting counts
- Set goals and view progress
- Family member tracking
- Historical data

### Family Management
- Add family members
- Track individual progress
- Shared goals and achievements
- Medicine reminders for family

### Scripture Library
- Browse devotional texts
- Search and filter
- Reading progress tracking
- Admin-managed content

### Community Features
- Connect with other devotees
- Share experiences
- Community events
- Leaderboards

### Admin Panel
- User management
- Content moderation
- System statistics
- Bulk operations

## 🚀 Deployment Status

| Service | Platform | Status | URL |
|---------|----------|--------|-----|
| Frontend | Vercel | ✅ Ready | https://chaitanyabhakti.vercel.app |
| Backend | Render | ✅ Ready | https://vaishnav-bhakti-backend.onrender.com |
| Database | Render | ✅ Ready | PostgreSQL |

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Admin role-based access control
- Environment variable protection

## 📊 Monitoring

- Application logs available in Render dashboard
- Vercel analytics for frontend
- Database performance monitoring
- Error tracking and alerts

## 🛠️ Built With

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Node.js](https://nodejs.org/) - Runtime environment
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting

## 📞 Support

For issues and questions:
1. Check the deployment guide in `DEPLOYMENT_GUIDE.md`
2. Review the README files in `backend/` and `frontend/` directories
3. Create an issue in the GitHub repository

## 🙏 Acknowledgments

- Built for the Vaishnav community
- Inspired by devotional practices
- Designed for ease of use and accessibility

---

**Happy Devotional Journey!** 🕉️📿