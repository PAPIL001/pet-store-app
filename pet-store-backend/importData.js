require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Import your Product model
const productsData = require('../pet-store-frontend/data/products.json'); // Adjust path to your products.json

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected for data import!');
        try {
            // Optional: Clear existing data before importing to prevent duplicates
            // Use with caution, as it will delete all current products in the collection!
            await Product.deleteMany({});
            console.log('Existing products cleared (if any).');

            // Insert the data from products.json
            await Product.insertMany(productsData);
            console.log('Products imported successfully!');
            process.exit(0); // Exit the script successfully
        } catch (err) {
            console.error('Error importing data:', err);
            process.exit(1); // Exit with error code
        }
    })
    .catch(err => {
        console.error('MongoDB connection error during import script:', err);
        process.exit(1); // Exit with error code
    });