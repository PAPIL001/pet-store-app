const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
        ref: 'Product',
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String } // Store image URL for easier display in orders
});

const orderSchema = new mongoose.Schema({
    customerInfo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true },
        phone: { type: String, required: true }
    },
    items: [orderItemSchema], // Array of products in the order
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true, enum: ['cod', 'razorpay'] }, // e.g., 'cod', 'razorpay'
    status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
    // You might add fields like paymentResult: { id, status, update_time, email_address } for Razorpay
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Order', orderSchema);