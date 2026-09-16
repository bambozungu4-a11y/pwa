/**
 * MongoDB Database Configuration
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
async function connectDB() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dispensary-hub';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB Connected Successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB Disconnected');
    } catch (error) {
        console.error('❌ MongoDB Disconnection Error:', error.message);
    }
}

module.exports = {
    connectDB,
    disconnectDB,
    mongoose
};
