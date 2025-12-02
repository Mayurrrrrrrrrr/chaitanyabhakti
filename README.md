# Chaitanya Bhakti

A spiritual application for tracking Japa, Meditation, and connecting with the Vaishnav community.

## Features

- **Japa Counter**: Track your daily rounds with a digital mala.
- **Breathe**: Mindfulness and breathing exercises with 432 Hz healing sound.
- **Satsang**: Watch daily spiritual videos and listen to kirtans.
- **Medicine Tracker**: Keep track of your daily medications.
- **Scripture Library**: Access sacred texts.
- **Family & Community**: Connect with your spiritual family.
- **Dashboard**: View your daily progress and streaks.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Setup

1.  **Clone the repository**
2.  **Install Dependencies**:
    ```bash
    cd backend && npm install
    cd frontend && npm install
    ```
3.  **Database Setup**:
    - Import `complete_schema.sql` into your MySQL database.
    - Configure `.env` in `backend/` with your DB credentials.
4.  **Run Application**:
    - Backend: `cd backend && npm start`
    - Frontend: `cd frontend && npm start`

## Deployment

- The application is configured to run on a VPS with NGINX.
- Use `pm2` to manage backend processes in production.

## License

Private