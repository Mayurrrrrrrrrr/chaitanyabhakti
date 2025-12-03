const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runSchemaUpdate() {
    console.log('🚀 Starting Schema Update...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to database.');

        // 1. Create notifications table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL, -- NULL means notification for all users
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'scripture', 'event', 'media', 'task', 'reminder', 'system') DEFAULT 'info',
                link VARCHAR(255) NULL, -- Link to relevant page
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_is_read (is_read),
                INDEX idx_created_at (created_at),
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        `;
        await connection.query(createTableQuery);
        console.log('✅ Table "notifications" checked/created.');

        // 2. Create Index idx_user_read
        try {
            await connection.query(`CREATE INDEX idx_user_read ON notifications(user_id, is_read);`);
            console.log('✅ Index "idx_user_read" created.');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ Index "idx_user_read" already exists.');
            } else {
                throw err;
            }
        }

        connection.release();
        console.log('🎉 Schema update completed successfully.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Schema update failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runSchemaUpdate();
