/**
 * Product Routes - Working Implementation
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/products - Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, sort = '-createdAt', limit = 20, page = 1 } = req.query;

        // Build filter
        const filter = { isActive: true };
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Query with pagination
        const products = await Product.find(filter)
            .populate('supplierId', 'name storeName rating')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort)
            .exec();

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: products,
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
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// GET /api/products/:id - Get product details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate('supplierId', 'name storeName rating');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get reviews
        const reviews = await Review.find({ productId: id })
            .populate('customerId', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            data: {
                ...product.toObject(),
                reviews
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
});

// POST /api/products - Create product (Supplier only)
router.post('/', verifyToken, checkRole(['supplier']), async (req, res) => {
    try {
        const { name, price, description, category, quantity, sku, comparePrice, image } = req.body;

        // Validation
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, price, category'
            });
        }

        // Check for duplicate SKU
        if (sku) {
            const existingSku = await Product.findOne({ sku });
            if (existingSku) {
                return res.status(409).json({
                    success: false,
                    message: 'Product with this SKU already exists'
                });
            }
        }

        const product = new Product({
            supplierId: req.user.id,
            name,
            price,
            description,
            category,
            quantity: quantity || 0,
            sku,
            comparePrice,
            image,
            isActive: true
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', verifyToken, checkRole(['supplier']), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Verify ownership
        if (product.supplierId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        // Update fields
        Object.assign(product, updates);
        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', verifyToken, checkRole(['supplier']), async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Verify ownership
        if (product.supplierId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await Product.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

// GET /api/products/:id/reviews - Get product reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await Review.find({ productId: id })
            .populate('customerId', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
});

// POST /api/products/:id/reviews - Create review
router.post('/:id/reviews', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check for existing review
        const existingReview = await Review.findOne({
            productId: id,
            customerId: req.user.id
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        const review = new Review({
            productId: id,
            customerId: req.user.id,
            rating,
            title,
            comment
        });

        await review.save();

        // Update product rating
        const allReviews = await Review.find({ productId: id });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        product.rating = avgRating;
        product.reviewCount = allReviews.length;
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
});

module.exports = router;
