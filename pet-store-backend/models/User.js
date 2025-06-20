const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email must be unique for each user
        trim: true,
        lowercase: true, // Store emails in lowercase
        match: [/.+\@.+\..+/, 'Please fill a valid email address'] // Basic email regex validation
    },
    password: {
        type: String,
        // Password is no longer strictly 'required: true' at the schema level.
        // Users authenticated via Google will not have a local password stored in this field.
        // The pre('save') hook handles hashing only if a password is provided.
        minlength: [6, 'Password must be at least 6 characters long'] // Still enforce min length if provided
    },
    googleId: { // <--- NEW FIELD FOR GOOGLE AUTHENTICATION
        type: String,
        unique: true,
        sparse: true // Allows multiple documents to have a null value for googleId
                     // This is important because most users won't have a googleId initially.
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Define roles (e.g., 'user', 'admin')
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// --- Mongoose Middleware (Pre-save hook for password hashing) ---
// This runs BEFORE saving a user document, to hash the password if it's new or modified,
// AND if a password actually exists (i.e., not a Google-only login).
userSchema.pre('save', async function(next) {
    // Only hash the password if:
    // 1. A password field is present (e.g., not null or undefined, which might be the case for Google users)
    // 2. The password field has been modified (or is new)
    if (this.password && this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10); // Generate a salt (random string)
            this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
            next(); // Continue with the save operation
        } catch (err) {
            console.error('Error hashing password:', err);
            next(err); // Pass the error to the next middleware or save operation
        }
    } else {
        // If password is not provided (e.g., for Google auth) or not modified, skip hashing.
        next();
    }
});

// --- Method to compare entered password with hashed password ---
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Compare the entered plaintext password with the hashed password stored in the database
    // Ensure 'this.password' exists before attempting to compare, as Google users won't have it.
    if (!this.password) {
        return false; // Cannot match if there's no password stored (e.g., a Google-only user)
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);