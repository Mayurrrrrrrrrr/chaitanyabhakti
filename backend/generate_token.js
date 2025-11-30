require('dotenv').config({ path: 'backend/.env' });
const jwt = require('jsonwebtoken');

const user = {
    id: 1,
    name: 'Test User',
    is_super_admin: 1
};

const payload = {
    user: user
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log(token);
