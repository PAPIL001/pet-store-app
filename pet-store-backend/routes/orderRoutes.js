const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Import the Order model
const Product = require('../models/Product'); // Also need Product model to check stock

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public (for now, will be private with authentication later)
router.post('/', async (req, res) => {
    const { customerInfo, items, total, paymentMethod } = req.body;

    if (!customerInfo || !items || items.length === 0 || !total || !paymentMethod) {
        return res.status(400).json({ msg: 'Please provide all required order details.' });
    }

    try {
        // Basic stock check (more robust validation can be added)
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // We're looking up by product.id (your custom string ID), not _id
            const productFromDb = await Product.findOne({ id: item.id });

            if (!productFromDb) {
                return res.status(404).json({ msg: `Product with ID ${item.id} not found.` });
            }
            if (productFromDb.stock < item.quantity) {
                return res.status(400).json({ msg: `Not enough stock for ${productFromDb.name}. Available: ${productFromDb.stock}` });
            }
            // Important: Replace frontend item.id with backend's product._id for reference
            items[i].product = productFromDb._id;
            // Also, ensure price is consistent with backend data (optional but good for integrity)
            items[i].price = productFromDb.price;
        }

        const newOrder = new Order({
            customerInfo,
            items,
            total,
            paymentMethod,
            status: 'Pending' // Initial status
        });

        const savedOrder = await newOrder.save();

        // Optional: Reduce stock from Product model after successful order
        for (const item of savedOrder.items) {
            // Find the product by its actual MongoDB _id (now stored in item.product)
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }


        res.status(201).json({ msg: 'Order placed successfully!', orderId: savedOrder._id });

    } catch (err) {
        console.error('Error creating order:', err.message);
        res.status(500).send('Server Error during order creation.');
    }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only, later)
// @access  Private (for now, can be accessed publicly for testing)
router.get('/', async (req, res) => {
    try {
        // Populate 'product' field in items to get product details (name, image etc.)
        const orders = await Order.find({}).populate('items.product', 'name image');
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private (for now, can be accessed publicly for testing)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product', 'name image');
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;