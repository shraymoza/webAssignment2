import jwt from 'jsonwebtoken';
import fs from 'node:fs';

const token = jwt.sign(
    { id: 'usr_demo1', name: 'Demo' },     // payload
    process.env.JWT_SECRET || 'topsecret', // same secret as in .env
    { expiresIn: '1d' }
);
fs.writeFileSync('demo.token.txt', token);
console.log('Token saved to demo.token.txt');
