// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken'); // For creating JSON Web Tokens
const asyncHandler = require('express-async-handler'); // Simple wrapper for async functions to catch errors
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware for protecting routes (assuming it exists)

// --- NEW: Passport for Google OAuth ---
const passport = require('passport');
// --- END NEW ---

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields: name, email, and password.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ msg: 'User with that email already exists.' });
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password, // Password will be hashed by the pre-save hook in the User model
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // Send back a JWT
        });
    } else {
        res.status(400).json({ msg: 'Invalid user data.' });
    }
}));

// @desc    Authenticate user & get token (for local email/password login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    // If user exists and password matches
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // Send back a JWT
        });
    } else {
        res.status(401).json({ msg: 'Invalid email or password.' });
    }
}));

// --- NEW: Google OAuth Routes ---

// @desc    Authenticate with Google - Initiates the Google OAuth flow
// @route   GET /api/auth/google
// @access  Public
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }) // Request user's profile and email
);

// @desc    Google OAuth Callback - Handles the redirect from Google after authentication
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/api/auth/login-failure' }), // Redirect to this route on failure
    asyncHandler(async (req, res) => {
        // Successful authentication, Passport attaches the user to req.user
        if (req.user) {
            const token = generateToken(req.user._id); // Use your existing generateToken helper
            const userName = encodeURIComponent(req.user.name); // Ensure name is URL-encoded
            const userEmail = encodeURIComponent(req.user.email); // Ensure email is URL-encoded

            // --- IMPORTANT: How to send token to frontend ---
            // Redirect the user back to your frontend with the token included in the URL.
            // MODIFIED: Explicitly redirect to index.html with the full path Live Server is using
            const frontendRedirectUrl = `http://localhost:5500/my-pet-store-fullstack/pet-store-frontend/index.html?token=${token}&name=${userName}&email=${userEmail}`;
            res.redirect(frontendRedirectUrl);

        } else {
            // This case should ideally be caught by failureRedirect, but as a fallback:
            res.status(401).json({ msg: 'Google authentication failed due to unexpected error.' });
        }
    })
);

// @desc    Handle Google Auth Failure Redirect
// @route   GET /api/auth/login-failure
// @access  Public
router.get('/login-failure', (req, res) => {
    // You can render a proper error page or send a JSON response
    res.status(401).json({ msg: 'Google login failed. Please try again.' });
});

// --- END NEW ---

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
    // The 'protect' middleware adds the authenticated user's details to req.user (req.user._id, req.user.name, req.user.email, req.user.role)
    // We fetch the user again from DB to ensure we only send specific fields (e.g., exclude password)
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Add any other user profile fields you want to expose to the frontend
            // For example, if you add an 'address' field to your User model:
            // address: user.address,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));

module.exports = router;