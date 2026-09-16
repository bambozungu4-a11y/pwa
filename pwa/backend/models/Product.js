/**
 * Product Model
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    category: {
        type: String,
        enum: ['flower', 'edibles', 'concentrate', 'accessories', 'other'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    comparePrice: {
        type: Number,
        min: 0
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    image: String,
    images: [String],
    tags: [String],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for searching
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ supplierId: 1 });

module.exports = mongoose.model('Product', productSchema);
