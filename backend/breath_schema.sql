-- Database Schema for Breathing App Records

USE vaishnavbhakti;

CREATE TABLE IF NOT EXISTS breath_records (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    technique_id VARCHAR(50),
    technique_name VARCHAR(100),
    duration_seconds INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
