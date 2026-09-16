/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

// GET /api/orders - Get user's orders
router.get('/', verifyToken, async (req, res) => {
    try {
        const { status, limit = 10, page = 1 } = req.query;

        const filter = { customerId: req.user.id };
        if (status) filter.orderStatus = status;

        const orders = await Order.find(filter)
            .populate('supplierId', 'name storeName')
            .populate('items.productId', 'name image')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort('-createdAt');

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('customerId', 'name email phone')
            .populate('supplierId', 'name storeName')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify ownership
        if (order.customerId._id.toString() !== req.user.id && order.supplierId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
});

// POST /api/orders - Create order
router.post('/', verifyToken, async (req, res) => {
    try {
        const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            });
        }

        // Validate and get product details
        let total = 0;
        let supplierId = null;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }

            if (!supplierId) {
                supplierId = product.supplierId;
            }

            const subtotal = product.price * item.quantity;
            total += subtotal;

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal
            });
        }

        // Calculate totals
        const tax = total * 0.1; // 10% tax
        const finalTotal = total + tax;

        // Create order
        const order = new Order({
            customerId: req.user.id,
            supplierId,
            items: orderItems,
            total,
            tax,
            shippingCost: 0,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod: paymentMethod || 'card',
            orderStatus: 'pending',
            paymentStatus: 'pending'
        });

        await order.save();

        // Update product quantities
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity, sold: item.quantity } }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

// PUT /api/orders/:id - Update order status
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, trackingNumber, notes } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify supplier authorization
        if (order.supplierId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only supplier can update order status'
            });
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (notes) order.notes = notes;

        await order.save();

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order',
            error: error.message
        });
    }
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only customer can cancel
        if (order.customerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only customer can cancel this order'
            });
        }

        // Only pending orders can be cancelled
        if (order.orderStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be cancelled'
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        // Refund items to inventory
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: item.quantity, sold: -item.quantity } }
            );
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
});

module.exports = router;
