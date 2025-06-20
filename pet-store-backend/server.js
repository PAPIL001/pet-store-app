// server.js

// --- Global Uncaught Exception and Unhandled Rejection Handlers ---
// Keep these at the very top to catch any immediate startup issues
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1); // Exit with a failure code
});
// --- END Global Handlers ---

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
// Temporarily remove imports for middleware and modules we are testing
// const cors = require('cors');
// const connectDB = require('./config/db'); // TEMPORARILY COMMENTED OUT FOR THIS TEST
// const errorHandler = require('./middleware/errorHandler');

// Temporarily remove Passport & Sessions imports
// const passport = require('passport');
// const session = require('express-session');
// require('./config/passport'); // Don't run passport config if passport not used

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database (TEMPORARILY COMMENTED OUT FOR THIS TEST)
// connectDB(); // TEMPORARILY COMMENTED OUT FOR THIS TEST

// --- Minimal Middleware ---
// Only express.json() for basic body parsing. Temporarily remove others.
// app.use(cors()); // Temporarily removed
app.use(express.json());

// --- Temporarily remove Passport & Session Middleware ---
// app.use(session({ /* ... */ })); // Temporarily removed
// app.use(passport.initialize()); // Temporarily removed
// app.use(passport.session()); // Temporarily removed

// --- Only the Basic Route (for health check) ---
// Temporarily remove all other route imports and app.use() lines for them
// const productRoutes = require('./routes/productRoutes');
// const orderRoutes = require.on('./routes/orderRoutes');
// const authRoutes = require('./routes/authRoutes');

// app.use('/api/products', productRoutes); // Temporarily removed
// app.use('/api/auth', authRoutes); // Temporarily removed
// app.use('/api/orders', orderRoutes); // Temporarily removed

// This is the ONLY route your server should have right now
app.get('/', (req, res) => {
    console.log('Health check route was hit! Sending explicit 200 OK.'); // Updated log
    res.status(200).send('Welcome to the Paws & Claws Emporium API - Health Check!'); // Explicit 200 OK
});

// --- Temporarily remove Error handling middleware ---
// app.use(errorHandler); // Temporarily removed

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});