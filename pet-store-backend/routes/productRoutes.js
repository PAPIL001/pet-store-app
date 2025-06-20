const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import the Product model

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}); // Find all products in the database
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id }); // Find product by its custom 'id' field
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/products
// @desc    Create a new product (Admin only, later)
// @access  Private (e.g., Admin)
router.post('/', async (req, res) => {
    // Destructure the product fields from the request body
    const { id, name, category, animal, price, image, description, brand, stock, rating } = req.body;

    try {
        // Check if a product with the same ID already exists
        let product = await Product.findOne({ id });
        if (product) {
            return res.status(400).json({ msg: 'Product with this ID already exists' });
        }

        // Create a new Product instance
        product = new Product({
            id, name, category, animal, price, image, description, brand, stock, rating
        });

        // Save the new product to the database
        await product.save();
        res.status(201).json(product); // 201 Created response
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// You'd add PUT (update) and DELETE (delete) routes here for full CRUD operations later.

module.exports = router;