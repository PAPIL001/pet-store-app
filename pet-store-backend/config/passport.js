const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust path if your User model is elsewhere

// Serialize user: Determines which user data should be stored in the session.
// Here, we store the MongoDB user ID.
passport.serializeUser((user, done) => {
    done(null, user.id); // user.id refers to the MongoDB document _id
});

// Deserialize user: Retrieves user data from the stored session ID.
// This function is called on subsequent requests after the user is logged in.
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth 2.0 Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback', // This must match the redirect URI in Google Cloud Console
            scope: ['profile', 'email'] // Request user's profile and email
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if a user with this Google ID already exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, return the user
                    return done(null, user);
                } else {
                    // Check if a user with this email already exists but without a Google ID
                    // This handles cases where a user might have registered locally first
                    // and now tries to sign in with Google using the same email.
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // User exists with this email, link the Google ID
                        user.googleId = profile.id;
                        await user.save(); // Save the updated user with googleId
                        return done(null, user);
                    } else {
                        // No user found, create a new one
                        const newUser = new User({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            // For Google logins, we don't need a password.
                            // The User model's pre-save hook will handle this gracefully.
                            // You might want to assign a placeholder password or null,
                            // but if the password field is not required, it's fine to omit.
                            // password: "GOOGLE_AUTH_USER_PLACEHOLDER" // Optional: if your schema requires a value
                        });
                        await newUser.save();
                        return done(null, newUser);
                    }
                }
            } catch (err) {
                console.error('Error during Google authentication:', err);
                return done(err, null);
            }
        }
    )
);