/**
 * Backend Server - Express.js Setup with Database
 * Main entry point for the Dispensary Hub API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');
const { logger } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware
// ==========================================

// Connect to database
connectDB().catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

// Logging middleware
app.use(logger);

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:8000', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// ==========================================
// Health Check
// ==========================================

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// API Routes
// ==========================================

// Auth Routes
app.use('/api/auth', authRoutes);

// Product Routes
app.use('/api/products', productRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Cart Routes
app.use('/api/cart', cartRoutes);

// ==========================================
// Error Handling
// ==========================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    
    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🚀 THE PLUG - Dispensary Hub API    ║
    ║   Server Running on Port ${PORT}            ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
    ║   MongoDB: Connected ✓                 ║
    ╚════════════════════════════════════════╝
    `);
    console.log(`📝 API Docs: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Server shutting down...');
    process.exit(0);
});

module.exports = app;
