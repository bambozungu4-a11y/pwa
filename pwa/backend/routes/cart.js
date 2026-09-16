/**
 * Cart Routes
 * Temporary cart management before checkout
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// In-memory cart storage (in production, use Redis or database)
const carts = new Map();

// GET /api/cart - Get user's cart
router.get('/', verifyToken, (req, res) => {
    try {
        const userId = req.user.id;
        const cart = carts.get(userId) || { items: [], total: 0 };

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
            error: error.message
        });
    }
});

// POST /api/cart/add - Add item to cart
router.post('/add', verifyToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity, price, name, image } = req.body;

        if (!productId || !quantity || !price) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: productId, quantity, price'
            });
        }

        let cart = carts.get(userId) || { items: [], total: 0 };

        // Check if item already in cart
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            cart.items.push({
                productId,
                name,
                price,
                quantity,
                image,
                subtotal: quantity * price
            });
        }

        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        carts.set(userId, cart);

        res.json({
            success: true,
            message: 'Item added to cart',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
});

// PUT /api/cart/update/:productId - Update item quantity
router.put('/update/:productId', verifyToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        let cart = carts.get(userId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.find(item => item.productId === productId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        if (quantity === 0) {
            cart.items = cart.items.filter(item => item.productId !== productId);
        } else {
            item.quantity = quantity;
            item.subtotal = quantity * item.price;
        }

        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        carts.set(userId, cart);

        res.json({
            success: true,
            message: 'Cart updated',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
});

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', verifyToken, (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        let cart = carts.get(userId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        carts.set(userId, cart);

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove item',
            error: error.message
        });
    }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', verifyToken, (req, res) => {
    try {
        const userId = req.user.id;
        carts.set(userId, { items: [], total: 0 });

        res.json({
            success: true,
            message: 'Cart cleared',
            data: { items: [], total: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
});

module.exports = router;
