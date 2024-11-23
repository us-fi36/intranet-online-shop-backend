import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Attach userId to the request
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
