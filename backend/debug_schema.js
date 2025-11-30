require('dotenv').config({ path: 'backend/.env' });
const mysql = require('mysql2/promise');

async function debug() {
    console.log('Connecting to DB...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log('Connected!');

    try {
        const [videoColumns] = await connection.query('SHOW COLUMNS FROM video_links');
        console.log('\n--- video_links columns ---');
        console.table(videoColumns);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

debug();
