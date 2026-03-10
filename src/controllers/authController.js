import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_smarttaxi_key_2026', {
        expiresIn: '30d',
    });
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        console.time('findUser');
        const user = await User.findOne({ email }).select('+password');
        console.timeEnd('findUser');

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.time('matchPassword');
        const isMatch = await user.matchPassword(password);
        console.timeEnd('matchPassword');
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyDetails: user.companyDetails
        };

        res.json({
            success: true,
            message: 'Logged in successfully',
            data: {
                token: generateToken(user._id),
                user: userResponse
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};

export const setupUser = async (req, res) => {
    try {
        const { name, email, password, role, companyDetails } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            companyDetails
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyDetails: user.companyDetails,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Setup user error:', error);
        res.status(500).json({ success: false, message: 'Server error during setup', error: error.message });
    }
};
