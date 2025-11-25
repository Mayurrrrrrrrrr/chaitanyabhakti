-- Database Schema for Vaishnav Bhakti App
-- Generated based on codebase analysis

CREATE DATABASE IF NOT EXISTS vaishnavbhakti;
USE vaishnavbhakti;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    spiritual_name VARCHAR(100),
    password VARCHAR(255),
    profile_photo VARCHAR(255),
    is_super_admin BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    total_japa_count INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INT PRIMARY KEY,
    language VARCHAR(10) DEFAULT 'en',
    font_size VARCHAR(20) DEFAULT 'medium',
    high_contrast BOOLEAN DEFAULT 0,
    voice_commands BOOLEAN DEFAULT 0,
    text_to_speech BOOLEAN DEFAULT 0,
    notifications_enabled BOOLEAN DEFAULT 1,
    daily_reminder_time TIME,
    theme VARCHAR(20) DEFAULT 'light',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    otp_id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Families Table
CREATE TABLE IF NOT EXISTS families (
    family_id INT AUTO_INCREMENT PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    family_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 5. Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
    family_id INT,
    user_id INT,
    relation_label VARCHAR(50),
    is_admin BOOLEAN DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (family_id, user_id),
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT,
    created_by INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 7. Task Assignments Table
CREATE TABLE IF NOT EXISTS task_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    assigned_to_user_id INT,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    completed_at DATETIME,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 8. Japa Records Table
CREATE TABLE IF NOT EXISTS japa_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    family_id INT,
    mala_count INT DEFAULT 0,
    japa_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, japa_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE SET NULL
);

-- 9. Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    times JSON,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 10. Medicine Logs Table
CREATE TABLE IF NOT EXISTS medicine_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT,
    user_id INT,
    scheduled_time DATETIME,
    taken_at DATETIME,
    status ENUM('taken', 'skipped'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. Scriptures Table
CREATE TABLE IF NOT EXISTS scriptures (
    scripture_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    author VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    content_url VARCHAR(255),
    cover_url VARCHAR(255),
    audio_url VARCHAR(255),
    added_by INT,
    is_public BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(user_id)
);

-- 12. Reading List Table
CREATE TABLE IF NOT EXISTS reading_list (
    user_id INT,
    scripture_id INT,
    status ENUM('reading', 'completed', 'plan_to_read') DEFAULT 'plan_to_read',
    progress_percentage INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, scripture_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (scripture_id) REFERENCES scriptures(scripture_id) ON DELETE CASCADE
);

-- 13. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT,
    user_id INT,
    content TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    file_url VARCHAR(255),
    post_type ENUM('text', 'image', 'video', 'pdf') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 14. Audio Files Table
CREATE TABLE IF NOT EXISTS audio_files (
    audio_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    family_id INT,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    file_url VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'other',
    is_public BOOLEAN DEFAULT 0,
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE SET NULL
);

-- 15. Video Links Table
CREATE TABLE IF NOT EXISTS video_links (
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    added_by INT,
    family_id INT,
    title VARCHAR(255),
    title_en VARCHAR(255),
    youtube_url VARCHAR(255) NOT NULL,
    youtube_id VARCHAR(50),
    category VARCHAR(50) DEFAULT 'other',
    is_public BOOLEAN DEFAULT 1,
    description TEXT,
    thumbnail_url VARCHAR(255),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE SET NULL
);

-- 16. Global Events Table
CREATE TABLE IF NOT EXISTS global_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50),
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    description TEXT,
    location VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 17. Views (Optional but helpful)
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT user_id, name, spiritual_name, profile_photo, total_japa_count 
FROM users;

CREATE OR REPLACE VIEW family_leaderboard AS
SELECT f.family_id, u.user_id, u.name, u.spiritual_name, u.profile_photo, SUM(j.mala_count) as total_malas 
FROM families f 
JOIN family_members fm ON f.family_id = fm.family_id 
JOIN users u ON fm.user_id = u.user_id 
LEFT JOIN japa_records j ON u.user_id = j.user_id 
GROUP BY f.family_id, u.user_id;
