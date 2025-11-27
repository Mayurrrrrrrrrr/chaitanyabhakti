-- Complete Database Schema for Vaishnav Bhakti App
-- All tables required for full functionality

USE vaishnavbhakti;

-- 1. Users table (core authentication and user management)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    spiritual_name VARCHAR(100),
    password VARCHAR(255),
    profile_photo VARCHAR(255),
    is_super_admin TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_mobile (mobile_number),
    INDEX idx_active (is_active)
);

-- 2. OTP Verifications (for mobile login)
CREATE TABLE IF NOT EXISTS otp_verifications (
    otp_id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mobile (mobile_number),
    INDEX idx_expires (expires_at)
);

-- 3. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INT PRIMARY KEY,
    language VARCHAR(10) DEFAULT 'en',
    font_size VARCHAR(10) DEFAULT 'medium',
    high_contrast TINYINT(1) DEFAULT 0,
    voice_commands TINYINT(1) DEFAULT 0,
    text_to_speech TINYINT(1) DEFAULT 0,
    notifications_enabled TINYINT(1) DEFAULT 1,
    daily_reminder_time TIME DEFAULT '08:00:00',
    theme VARCHAR(20) DEFAULT 'light',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Families
CREATE TABLE IF NOT EXISTS families (
    family_id INT AUTO_INCREMENT PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    family_code VARCHAR(10) UNIQUE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_code (family_code)
);

-- 5. Family Members
CREATE TABLE IF NOT EXISTS family_members (
    family_id INT,
    user_id INT,
    is_admin TINYINT(1) DEFAULT 0,
    relation_label VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (family_id, user_id),
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- 6. Japa Records
CREATE TABLE IF NOT EXISTS japa_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rounds INT DEFAULT 0,
    japa_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, japa_date),
    INDEX idx_user_date (user_id, japa_date)
);

-- 7. Breath Records
CREATE TABLE IF NOT EXISTS breath_records (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    technique_id VARCHAR(50),
    technique_name VARCHAR(100),
    duration_seconds INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- 8. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT,
    created_by INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_family (family_id),
    INDEX idx_due_date (due_date)
);

-- 9. Task Assignments
CREATE TABLE IF NOT EXISTS task_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    assigned_to_user_id INT,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_status (assigned_to_user_id, status)
);

-- 10. Medicines
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
    reminder_enabled TINYINT(1) DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active)
);

-- 11. Medicine Logs
CREATE TABLE IF NOT EXISTS medicine_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT,
    user_id INT,
    scheduled_time DATETIME,
    taken_at DATETIME,
    status ENUM('taken', 'missed', 'skipped') DEFAULT 'taken',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, scheduled_time)
);

-- 12. Scriptures
CREATE TABLE IF NOT EXISTS scriptures (
    scripture_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    cover_url VARCHAR(255),
    content_url VARCHAR(255),
    audio_url VARCHAR(255),
    is_public TINYINT(1) DEFAULT 1,
    added_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_public (is_public)
);

-- 13. Reading List
CREATE TABLE IF NOT EXISTS reading_list (
    user_id INT,
    scripture_id INT,
    status ENUM('want_to_read', 'reading', 'completed') DEFAULT 'want_to_read',
    progress_percentage INT DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, scripture_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (scripture_id) REFERENCES scriptures(scripture_id) ON DELETE CASCADE
);

-- 14. Audio Files
CREATE TABLE IF NOT EXISTS audio_files (
    audio_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT,
    uploaded_by INT,
    title VARCHAR(200),
    title_en VARCHAR(200),
    category VARCHAR(50),
    file_url VARCHAR(255) NOT NULL,
    is_public TINYINT(1) DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_family_public (family_id, is_public)
);

-- 15. Video Links
CREATE TABLE IF NOT EXISTS video_links (
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT,
    added_by INT,
    title VARCHAR(200),
    video_url VARCHAR(500) NOT NULL,
    category VARCHAR(50),
    is_public TINYINT(1) DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_family_public (family_id, is_public)
);

-- 16. Community Posts
CREATE TABLE IF NOT EXISTS community_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT,
    user_id INT,
    content TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    file_url VARCHAR(255),
    post_type ENUM('text', 'image', 'video', 'file') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_family_date (family_id, created_at)
);

-- 17. Global Events
CREATE TABLE IF NOT EXISTS global_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    event_type ENUM('festival', 'ekadashi', 'appearance_day', 'other') DEFAULT 'other',
    start_date DATE NOT NULL,
    end_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_start_date (start_date)
);
