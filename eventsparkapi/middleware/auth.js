import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default function auth(role = 'optional') {
    return (req, res, next) => {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) {
            if (role === 'optional') return next();
            return res.status(401).json({ message: 'Unauthenticated' });
        }
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            return next();
        } catch {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
}
