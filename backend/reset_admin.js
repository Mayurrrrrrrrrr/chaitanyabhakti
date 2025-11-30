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

    const mobileNumber = '1234567890'; // Default Admin ID
    const plainPassword = 'admin123';  // Default Admin Password
    const name = 'Super Admin';

    try {
        // 1. Check if 'password' column exists
        try {
            await pool.query('SELECT password FROM users LIMIT 1');
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                console.log('⚠️  Column "password" missing. Adding it now...');
                await pool.query('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER spiritual_name');
                console.log('✅ Column "password" added successfully.');
            } else {
                throw err;
            }
        }

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
