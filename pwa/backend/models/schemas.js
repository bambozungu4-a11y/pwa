/**
 * Database Models for Dispensary Hub
 */

// ==========================================
// User Model Schema
// ==========================================
const userSchema = {
    _id: 'ObjectId',
    email: 'String (unique)',
    phone: 'String (unique)',
    password: 'String (hashed)',
    name: 'String',
    userType: 'String (customer|supplier|admin)',
    profile: {
        avatar: 'String',
        bio: 'String',
        address: 'String',
        city: 'String',
        state: 'String',
        zipCode: 'String',
        country: 'String'
    },
    storeName: 'String (for suppliers)',
    storeDescription: 'String (for suppliers)',
    isVerified: 'Boolean',
    isActive: 'Boolean',
    createdAt: 'Date',
    updatedAt: 'Date'
};

// ==========================================
// Product Model Schema
// ==========================================
const productSchema = {
    _id: 'ObjectId',
    supplierId: 'ObjectId (ref: User)',
    name: 'String',
    description: 'String',
    category: 'String',
    price: 'Number',
    comparePrice: 'Number',
    quantity: 'Number',
    sku: 'String (unique)',
    image: 'String',
    images: 'Array<String>',
    tags: 'Array<String>',
    rating: 'Number (0-5)',
    reviewCount: 'Number',
    isActive: 'Boolean',
    createdAt: 'Date',
    updatedAt: 'Date'
};

// ==========================================
// Order Model Schema
// ==========================================
const orderSchema = {
    _id: 'ObjectId',
    customerId: 'ObjectId (ref: User)',
    supplierId: 'ObjectId (ref: User)',
    items: 'Array<Object>',
    items: [
        {
            productId: 'ObjectId (ref: Product)',
            name: 'String',
            price: 'Number',
            quantity: 'Number',
            subtotal: 'Number'
        }
    ],
    total: 'Number',
    tax: 'Number',
    shippingCost: 'Number',
    shippingAddress: 'Object',
    billingAddress: 'Object',
    paymentMethod: 'String',
    paymentStatus: 'String (pending|completed|failed)',
    orderStatus: 'String (pending|processing|shipped|delivered|cancelled)',
    trackingNumber: 'String',
    notes: 'String',
    createdAt: 'Date',
    updatedAt: 'Date',
    deliveredAt: 'Date'
};

// ==========================================
// Review Model Schema
// ==========================================
const reviewSchema = {
    _id: 'ObjectId',
    productId: 'ObjectId (ref: Product)',
    customerId: 'ObjectId (ref: User)',
    rating: 'Number (1-5)',
    title: 'String',
    comment: 'String',
    helpful: 'Number',
    createdAt: 'Date',
    updatedAt: 'Date'
};

// ==========================================
// Cart Model Schema
// ==========================================
const cartSchema = {
    _id: 'ObjectId',
    customerId: 'ObjectId (ref: User)',
    items: 'Array<Object>',
    items: [
        {
            productId: 'ObjectId (ref: Product)',
            quantity: 'Number',
            price: 'Number'
        }
    ],
    total: 'Number',
    createdAt: 'Date',
    updatedAt: 'Date'
};

// ==========================================
// Category Model Schema
// ==========================================
const categorySchema = {
    _id: 'ObjectId',
    name: 'String (unique)',
    slug: 'String (unique)',
    description: 'String',
    image: 'String',
    isActive: 'Boolean',
    createdAt: 'Date'
};

// ==========================================
// Transaction Model Schema
// ==========================================
const transactionSchema = {
    _id: 'ObjectId',
    orderId: 'ObjectId (ref: Order)',
    customerId: 'ObjectId (ref: User)',
    amount: 'Number',
    currency: 'String',
    paymentMethod: 'String (card|bank|paypal)',
    transactionId: 'String',
    status: 'String (pending|success|failed)',
    createdAt: 'Date',
    updatedAt: 'Date'
};

// ==========================================
// Notification Model Schema
// ==========================================
const notificationSchema = {
    _id: 'ObjectId',
    userId: 'ObjectId (ref: User)',
    type: 'String (order|message|system)',
    title: 'String',
    message: 'String',
    data: 'Object',
    read: 'Boolean',
    createdAt: 'Date'
};

// Export schemas for reference
const schemas = {
    user: userSchema,
    product: productSchema,
    order: orderSchema,
    review: reviewSchema,
    cart: cartSchema,
    category: categorySchema,
    transaction: transactionSchema,
    notification: notificationSchema
};

module.exports = schemas;

/*
MONGODB CONNECTION EXAMPLE:

const mongoose = require('mongoose');

// User Schema Implementation
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    userType: { type: String, enum: ['customer', 'supplier', 'admin'], default: 'customer' },
    profile: {
        avatar: String,
        bio: String,
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    storeName: String,
    storeDescription: String,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Product Schema Implementation
const productSchema = new mongoose.Schema({
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    comparePrice: Number,
    quantity: { type: Number, default: 0 },
    sku: { type: String, unique: true, required: true },
    image: String,
    images: [String],
    tags: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Order Schema Implementation
const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number
    }],
    total: Number,
    tax: Number,
    shippingCost: Number,
    shippingAddress: mongoose.Schema.Types.Mixed,
    billingAddress: mongoose.Schema.Types.Mixed,
    paymentMethod: String,
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    trackingNumber: String,
    notes: String,
    deliveredAt: Date,
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = { User, Product, Order };
*/
