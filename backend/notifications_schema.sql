-- ⚠️ IMPORTANT: RUN THIS IN YOUR MySQL DATABASE ⚠️
-- (The one your Node.js backend connects to, usually via phpMyAdmin or DBeaver)
-- DO NOT RUN THIS IN SUPABASE (PostgreSQL)

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'general', -- 'scripture', 'event', 'media', 'task', 'reminder'
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Define index here so it's only created if the table is created
  INDEX idx_notifications_user (user_id, is_read)
);
