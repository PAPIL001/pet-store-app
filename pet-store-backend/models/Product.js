const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Your existing product IDs
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'food', 'accessories', 'toys'
    animal: { type: String, required: true },   // e.g., 'dog', 'cat', 'both'
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Product', productSchema);