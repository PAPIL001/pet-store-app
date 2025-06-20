// --- Global Uncaught Exception and Unhandled Rejection Handlers ---
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  // It's good practice to close your server before exiting
  // if your app is primarily server-based.
  // For now, let's just exit for immediate feedback.
  process.exit(1); // Exit with a failure code
});
// --- END Global Handlers ---

// Load environment variables from .env file
require('dotenv').config();
// ... rest of your server.js code
// server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import cors
const connectDB = require('./config/db'); // Import the connectDB function
const errorHandler = require('./middleware/errorHandler'); // Import error handler middleware

// --- NEW: For Passport & Sessions ---
const passport = require('passport');
const session = require('express-session');
require('./config/passport'); // This line runs your passport configuration
// --- END NEW ---

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// --- Middleware ---
// Enable CORS for all origins (for development)
// In production, you'd specify allowed origins: cors({ origin: 'http://yourfrontend.com' })
app.use(cors());
// Body parser for JSON data
app.use(express.json());

// --- NEW: Passport & Session Middleware ---
// This must come BEFORE your routes that use Passport for authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_fallback_secret_key_for_session_if_env_is_missing', // Use an environment variable for a real secret
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (https)
        maxAge: 1000 * 60 * 60 * 24 // 1 day in milliseconds
    }
}));
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session());    // Enable Passport session support
// --- END NEW ---

// --- Routes ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/products', productRoutes);
// Make sure /api/auth routes are placed here, after Passport initialization
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// --- Basic Route (for testing if server is running) ---
app.get('/', (req, res) => {
    res.send('Welcome to the Paws & Claws Emporium API!');
});

// --- Error handling middleware ---
// This should be the last middleware in your chain
app.use(errorHandler);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});