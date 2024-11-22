import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
    const { username, name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    if (!email.endsWith('@intranet-shop.com')) {
        return res.status(400).json({
            message: 'Email must end with "@intranet-shop.com".',
        });
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@$%?]).{8,}$/.test(password)) {
        return res.status(400).json({
            message: 'Password must have at least 8 characters, including one uppercase letter, one number, and one special character.',
        });
    }

    const existingUser = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await query('INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)', [username, name, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error('Error registering user:', err.message);
        res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ message: 'Invalid password.' });

        const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, userId: user.user_id });
    } catch (err) {
        console.error('Error logging in user:', err.message);
        res.status(500).json({ message: 'Login failed.', error: err.message });
    }
};
