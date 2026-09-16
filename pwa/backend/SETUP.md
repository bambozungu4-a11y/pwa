# Backend Setup Guide

## Prerequisites

Before getting started, ensure you have the following installed:
- **Node.js** (v16.0 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

From the root directory:
```bash
npm install
```

This will install all required packages including:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp backend/.env.example backend/.env
```

**Critical settings to configure:**
```
MONGODB_URI=mongodb://localhost:27017/dispensary-hub
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=development
PORT=3000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**On Windows:**
```bash
# If installed via Windows Installer
net start MongoDB

# Or if using MongoDB Community Edition
mongod
```

**On macOS:**
```bash
# Using Homebrew
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start the Backend Server

```bash
# Development mode (with auto-restart on file changes)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

The server will start on `http://localhost:3000` with these endpoints:

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
- `POST /api/auth/change-password` - Change password (requires auth)

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (supplier only)
- `PUT /api/products/:id` - Update product (supplier only)
- `DELETE /api/products/:id` - Delete product (supplier only)
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Add product review (customer only)

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (supplier only)
- `DELETE /api/orders/:id` - Cancel order (customer only)

### Cart (In-Memory)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

## Database Models

### User Schema
```javascript
{
  email: String (unique),
  phone: String (unique),
  password: String (hashed with bcrypt),
  name: String,
  userType: String (enum: 'customer', 'supplier', 'admin'),
  profile: Object,
  storeName: String (supplier only),
  storeDescription: String (supplier only),
  isVerified: Boolean,
  isActive: Boolean,
  rating: Number,
  totalSales: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  supplierId: ObjectId (ref: User),
  name: String,
  description: String,
  category: String (enum: 'flower', 'edibles', 'concentrate', 'accessories', 'other'),
  price: Number,
  comparePrice: Number,
  quantity: Number,
  sku: String (unique),
  image: String,
  images: Array,
  tags: Array,
  rating: Number,
  reviewCount: Number,
  sold: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  customerId: ObjectId (ref: User),
  supplierId: ObjectId (ref: User),
  items: Array of {
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  },
  total: Number,
  tax: Number,
  shippingCost: Number,
  shippingAddress: Object,
  billingAddress: Object,
  paymentMethod: String (enum: 'card', 'bank_transfer', 'cash'),
  paymentStatus: String (enum: 'pending', 'completed', 'failed', 'refunded'),
  orderStatus: String (enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'),
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date,
  deliveredAt: Date
}
```

### Review Schema
```javascript
{
  productId: ObjectId (ref: Product),
  customerId: ObjectId (ref: User),
  rating: Number (1-5),
  title: String,
  comment: String,
  helpful: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing the API

### Using cURL:
```bash
# Test health endpoint
curl http://localhost:3000/health

# Register new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "5551234567",
    "password": "SecurePass123!",
    "userType": "customer"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Get products
curl http://localhost:3000/api/products

# Create product (requires auth)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Premium Flower",
    "price": 45.99,
    "category": "flower",
    "quantity": 100
  }'
```

### Using Postman:
1. Import the included `postman-collection.json` (if available)
2. Set environment variables for token and base URL
3. Test endpoints from the collection

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Ensure MongoDB is running: `mongod` (Windows) or `brew services start mongodb-community` (macOS)
- Check MONGODB_URI in `.env` file
- Verify firewall isn't blocking port 27017

### Issue: "Port 3000 is already in use"
**Solution:**
- Change PORT in `.env` to a different port (e.g., 3001)
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`

### Issue: "JWT token errors"
**Solution:**
- Ensure JWT_SECRET is set in `.env`
- Verify token is in Authorization header: `Bearer <token>`
- Check token expiration (7 days by default)

### Issue: "Mongoose validation errors"
**Solution:**
- Check that required fields are provided
- Validate email format and phone number length
- Ensure password meets strength requirements

## Production Deployment

For production deployment, update `.env`:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=very-long-secure-random-string-min-32-chars
```

Then deploy using:
- **Heroku**: Push to Heroku git remote
- **AWS**: Deploy to EC2/ECS with proper security groups
- **DigitalOcean**: Deploy droplet with PM2 process manager
- **Railway/Render**: Push GitHub repo for auto-deploy

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure MongoDB connection
3. ✅ Set JWT_SECRET in `.env`
4. ✅ Start MongoDB server
5. ✅ Run: `npm run dev` or `npm start`
6. ✅ Test endpoints with cURL or Postman
7. ⏳ Integrate payment system (Stripe)
8. ⏳ Add email notifications (Nodemailer/SendGrid)
9. ⏳ Deploy to production

For more information, check the main [README.md](../README.md).
