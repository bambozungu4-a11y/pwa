/**
 * Database Seeding Script
 * Populates MongoDB with sample data for testing
 * 
 * Usage: node backend/seed.js
 */

require('dotenv').config();
const { connectDB, mongoose } = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to MongoDB
        await connectDB();
        
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});
        console.log('🧹 Cleared existing data');
        
        // Create sample users
        const users = await User.create([
            {
                name: 'John Customer',
                email: 'customer@example.com',
                phone: '5551234567',
                password: 'Password123!', // Will be hashed by pre-save hook
                userType: 'customer',
                profile: {
                    address: '123 Main St',
                    city: 'Springfield',
                    state: 'IL',
                    zipCode: '62701',
                    country: 'USA'
                },
                isVerified: true,
                isActive: true
            },
            {
                name: 'Sarah Supplier',
                email: 'supplier@example.com',
                phone: '5559876543',
                password: 'Password123!',
                userType: 'supplier',
                storeName: 'Quality Botanicals',
                storeDescription: 'Premium cannabis products and accessories',
                profile: {
                    address: '456 Commerce Ave',
                    city: 'Portland',
                    state: 'OR',
                    zipCode: '97201',
                    country: 'USA'
                },
                rating: 4.8,
                totalSales: 150,
                isVerified: true,
                isActive: true
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                phone: '5555555555',
                password: 'AdminPass123!',
                userType: 'admin',
                isVerified: true,
                isActive: true
            }
        ]);
        
        console.log(`✅ Created ${users.length} users`);
        
        // Create sample products
        const products = await Product.create([
            {
                supplierId: users[1]._id,
                name: 'Blue Dream - Premium Flower',
                description: 'Sativa-dominant hybrid with blueberry notes and energetic effects',
                category: 'flower',
                price: 45.99,
                comparePrice: 55.99,
                quantity: 100,
                sku: 'FLOWER-001',
                image: 'https://via.placeholder.com/300x300?text=Blue+Dream',
                tags: ['sativa', 'hybrid', 'energetic'],
                rating: 4.8,
                reviewCount: 24,
                sold: 156,
                isActive: true
            },
            {
                supplierId: users[1]._id,
                name: 'Edibles - Gummy Mix Pack',
                description: 'Assorted cannabis-infused gummies, 10mg THC each',
                category: 'edibles',
                price: 35.00,
                comparePrice: 40.00,
                quantity: 150,
                sku: 'EDIBLE-001',
                image: 'https://via.placeholder.com/300x300?text=Gummies',
                tags: ['edibles', 'gummies', 'mixed'],
                rating: 4.5,
                reviewCount: 18,
                sold: 89,
                isActive: true
            },
            {
                supplierId: users[1]._id,
                name: 'Concentrate - Wax 1g',
                description: 'Pure cannabis wax concentrate, 85% THC',
                category: 'concentrate',
                price: 55.00,
                quantity: 50,
                sku: 'CONC-001',
                image: 'https://via.placeholder.com/300x300?text=Wax',
                tags: ['concentrate', 'wax', 'potent'],
                rating: 4.9,
                reviewCount: 42,
                sold: 234,
                isActive: true
            },
            {
                supplierId: users[1]._id,
                name: 'Glass Bong - Premium',
                description: 'High-quality borosilicate glass bong, 12 inches',
                category: 'accessories',
                price: 89.99,
                comparePrice: 120.00,
                quantity: 25,
                sku: 'ACC-001',
                image: 'https://via.placeholder.com/300x300?text=Bong',
                tags: ['accessories', 'glass', 'bong'],
                rating: 4.7,
                reviewCount: 31,
                sold: 67,
                isActive: true
            },
            {
                supplierId: users[1]._id,
                name: 'Rolling Papers - 50 Pack',
                description: 'Organic hemp rolling papers',
                category: 'accessories',
                price: 2.99,
                quantity: 500,
                sku: 'ACC-002',
                image: 'https://via.placeholder.com/300x300?text=Rolling+Papers',
                tags: ['accessories', 'papers'],
                rating: 4.3,
                reviewCount: 12,
                sold: 445,
                isActive: true
            },
            {
                supplierId: users[1]._id,
                name: 'OG Kush - Premium Flower',
                description: 'Classic indica strain with earthy and spicy aromas',
                category: 'flower',
                price: 52.99,
                comparePrice: 65.00,
                quantity: 75,
                sku: 'FLOWER-002',
                image: 'https://via.placeholder.com/300x300?text=OG+Kush',
                tags: ['indica', 'classic', 'relaxing'],
                rating: 4.9,
                reviewCount: 56,
                sold: 234,
                isActive: true
            }
        ]);
        
        console.log(`✅ Created ${products.length} products`);
        
        // Create sample orders
        const orders = await Order.create([
            {
                customerId: users[0]._id,
                supplierId: users[1]._id,
                items: [
                    {
                        productId: products[0]._id,
                        name: products[0].name,
                        price: products[0].price,
                        quantity: 2,
                        subtotal: products[0].price * 2
                    },
                    {
                        productId: products[4]._id,
                        name: products[4].name,
                        price: products[4].price,
                        quantity: 1,
                        subtotal: products[4].price
                    }
                ],
                total: (products[0].price * 2) + products[4].price,
                tax: ((products[0].price * 2) + products[4].price) * 0.1,
                shippingCost: 10.00,
                shippingAddress: {
                    street: '123 Main St',
                    city: 'Springfield',
                    state: 'IL',
                    zipCode: '62701',
                    country: 'USA'
                },
                paymentMethod: 'card',
                paymentStatus: 'completed',
                orderStatus: 'shipped',
                trackingNumber: 'TRACK123456789',
                isActive: true
            },
            {
                customerId: users[0]._id,
                supplierId: users[1]._id,
                items: [
                    {
                        productId: products[2]._id,
                        name: products[2].name,
                        price: products[2].price,
                        quantity: 1,
                        subtotal: products[2].price
                    }
                ],
                total: products[2].price,
                tax: products[2].price * 0.1,
                shippingCost: 0,
                shippingAddress: {
                    street: '123 Main St',
                    city: 'Springfield',
                    state: 'IL',
                    zipCode: '62701',
                    country: 'USA'
                },
                paymentMethod: 'card',
                paymentStatus: 'pending',
                orderStatus: 'pending',
                isActive: true
            }
        ]);
        
        console.log(`✅ Created ${orders.length} orders`);
        
        // Create sample reviews
        const reviews = await Review.create([
            {
                productId: products[0]._id,
                customerId: users[0]._id,
                rating: 5,
                title: 'Excellent quality!',
                comment: 'Great product with strong effects. Highly recommended!',
                helpful: 12
            },
            {
                productId: products[0]._id,
                customerId: users[0]._id,
                rating: 4,
                title: 'Good but pricey',
                comment: 'Quality is good but a bit expensive for the quantity',
                helpful: 5
            }
        ]);
        
        console.log(`✅ Created ${reviews.length} reviews`);
        
        // Print seed summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 Database seeded successfully!');
        console.log('='.repeat(50));
        console.log('\n📊 Summary:');
        console.log(`  Users: ${users.length}`);
        console.log(`  Products: ${products.length}`);
        console.log(`  Orders: ${orders.length}`);
        console.log(`  Reviews: ${reviews.length}`);
        
        console.log('\n👤 Test Credentials:');
        console.log('  Customer:');
        console.log('    Email: customer@example.com');
        console.log('    Password: Password123!');
        console.log('  Supplier:');
        console.log('    Email: supplier@example.com');
        console.log('    Password: Password123!');
        console.log('  Admin:');
        console.log('    Email: admin@example.com');
        console.log('    Password: AdminPass123!');
        
        console.log('\n🔗 API Endpoints to test:');
        console.log('  GET  /api/products');
        console.log('  POST /api/auth/login');
        console.log('  GET  /api/orders');
        console.log('\n✨ Ready to test the application!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

// Run seed function
seed();
