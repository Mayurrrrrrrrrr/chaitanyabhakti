const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdmin() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const mobileNumber = '1234567890';
    const plainPassword = 'admin123';
    const name = 'Super Admin';

    try {
        console.log('🔍 Checking database schema...');

        // Get current columns
        const [columns] = await pool.query('SHOW COLUMNS FROM users');
        const existingColumns = columns.map(col => col.Field);

        const requiredColumns = [
            { name: 'spiritual_name', definition: 'VARCHAR(100)' },
            { name: 'password', definition: 'VARCHAR(255)' },
            { name: 'profile_photo', definition: 'VARCHAR(255)' },
            { name: 'is_super_admin', definition: 'TINYINT(1) DEFAULT 0' },
            { name: 'is_active', definition: 'TINYINT(1) DEFAULT 1' },
            { name: 'current_streak', definition: 'INT DEFAULT 0' },
            { name: 'longest_streak', definition: 'INT DEFAULT 0' },
            { name: 'last_login', definition: 'TIMESTAMP NULL' }
        ];

        for (const col of requiredColumns) {
            if (!existingColumns.includes(col.name)) {
                console.log(`⚠️  Column "${col.name}" missing. Adding it...`);
                // We don't use AFTER to avoid dependency chains if previous cols are missing
                // MySQL adds to the end by default which is fine for functionality
                await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`);
                console.log(`✅ Column "${col.name}" added.`);
            }
        }

        console.log('✅ Schema check complete.');

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Check if user exists
        const [rows] = await pool.query('SELECT * FROM users WHERE mobile_number = ?', [mobileNumber]);

        if (rows.length > 0) {
            // Update existing user
            await pool.query(
                'UPDATE users SET password = ?, is_super_admin = 1, name = ? WHERE mobile_number = ?',
                [hashedPassword, name, mobileNumber]
            );
            console.log(`✅ Admin updated!`);
        } else {
            // Create new user
            await pool.query(
                'INSERT INTO users (mobile_number, name, password, is_super_admin) VALUES (?, ?, ?, 1)',
                [mobileNumber, name, hashedPassword]
            );
            console.log(`✅ Admin created!`);
        }

        console.log(`\n🔑 Credentials:`);
        console.log(`Mobile: ${mobileNumber}`);
        console.log(`Password: ${plainPassword}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

resetAdmin();
