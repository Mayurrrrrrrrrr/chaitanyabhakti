// backend/hash.js
const bcrypt = require('bcryptjs');

const passwordToHash = 'admin123'; // <-- CHANGE THIS to your desired password

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(passwordToHash, salt);

console.log('Your password:', passwordToHash);
console.log('Your HASH (copy this):');
console.log(hash);