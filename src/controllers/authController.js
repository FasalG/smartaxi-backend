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

export const getMe = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            companyDetails: user.companyDetails
        };

        // If driver, we might want to return the company name from their admin (tenant)
        if (user.role === 'driver' && user.tenantId) {
            const admin = await User.findById(user.tenantId);
            if (admin && admin.companyDetails) {
                userResponse.companyDetails = admin.companyDetails;
            }
        }

        res.json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching profile' });
    }
};

export const setupUser = async (req, res) => {
    try {
        const { name, email, password, role, companyDetails, tenantId } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            companyDetails,
            tenantId
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
export const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching admins' });
    }
};
export const getDrivers = async (req, res) => {
    try {
        // Find all drivers belonging to this admin's tenant
        const query = { role: 'driver' };

        // If the requester is an admin, only show their drivers
        if (req.user.role === 'admin') {
            query.tenantId = req.user._id;
        }

        const drivers = await User.find(query).select('-password');
        res.json({
            success: true,
            data: drivers
        });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching drivers' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, email, role, companyDetails } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check permission: superadmin can update anyone, admin can update their own drivers or themselves
        if (req.user.role !== 'superadmin' && req.user._id.toString() !== user.tenantId?.toString() && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        if (companyDetails) user.companyDetails = companyDetails;

        if (req.body.password) {
            user.password = req.body.password;
        }

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyDetails: user.companyDetails
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error during update', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check permission
        if (req.user.role !== 'superadmin' && req.user._id.toString() !== user.tenantId?.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this user' });
        }

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error during deletion', error: error.message });
    }
};
