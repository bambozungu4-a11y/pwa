# THE PLUG - Dispensary Hub E-Commerce Platform

Welcome to THE PLUG, a comprehensive e-commerce platform designed specifically for dispensary businesses. This full-stack application provides both customer and supplier functionality with modern authentication, shopping cart management, and order tracking.

## 📋 Project Overview

THE PLUG is built with:
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 with responsive design
- **Backend**: Node.js/Express.js REST API
- **Database**: MongoDB (recommended) or SQL
- **Storage**: Local Storage for frontend state, database for backend persistence

## 📁 Project Structure

```
wewewe/
├── index.html                 # Login page
├── signup-new.html            # Registration page (improved)
├── landing.html               # Customer dashboard/home
├── store-setup.html           # Product browsing (store)
├── past-orders.html           # Order history
├── account-setup.html         # Account configuration
├── cart.html                  # Shopping cart
├── supplier-dashboard.html    # Supplier dashboard
├── supplier-signup.html       # Supplier registration
├── supplier-store.html        # Supplier product management
├── supplier-reports.html      # Supplier analytics & reports
│
├── css/
│   └── shared.css             # Global styles & CSS variables
│
├── js/
│   ├── utils.js               # Shared utilities (API, validation, storage)
│   ├── components.js          # Reusable UI components
│   ├── login.js               # Login page logic
│   └── signup.js              # Signup page logic
│
├── backend/
│   ├── server.js              # Express server setup
│   ├── .env.example           # Environment configuration
│   ├── models/
│   │   └── schemas.js         # Database schemas documentation
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── products.js        # Product endpoints
│   │   ├── orders.js          # Order endpoints
│   │   └── users.js           # User endpoints
│   └── middleware/
│       └── auth.js            # Authentication middleware
│
├── assets/                    # Static assets (images, etc.)
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## 🚀 Getting Started

### Frontend Setup

1. **Open in browser** - The frontend files work directly in any modern browser
2. **Local server** (optional) - For development:
   ```bash
   # Install Python if needed
   python -m http.server 8000
   # Or with Node.js
   npx http-server
   ```
3. **Access**: Navigate to `http://localhost:8000/index.html`

### Backend Setup

1. **Install Node.js** (v16+ recommended)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your settings
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Or start production server**:
   ```bash
   npm start
   ```

The backend will run on `http://localhost:3000` by default.

## 🔐 Features Implemented

### Authentication System
- ✅ User registration (customer & supplier)
- ✅ Email/phone login with password verification
- ✅ SHA-256 password hashing
- ✅ Forgot password functionality
- ✅ Session management with localStorage
- ✅ JWT token support (backend ready)

### Frontend Validation
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Password strength requirements:
  - Minimum 8 characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 number
  - 1 special character (!@#$%^&*)
- ✅ Form error handling with user feedback

### User Management
- ✅ User profile management
- ✅ Customer vs Supplier roles
- ✅ Supplier store information
- ✅ User activity tracking

### Shopping Features
- ✅ Shopping cart with add/remove/update
- ✅ Cart persistence across sessions
- ✅ Order summary with tax calculation
- ✅ Product browsing (ready for integration)

### Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints for desktop/tablet/mobile
- ✅ Touch-friendly buttons and forms
- ✅ Fluid typography

### UI/UX
- ✅ Dark theme with glassmorphism
- ✅ Reusable component library
- ✅ Consistent styling system
- ✅ Loading states and spinners
- ✅ Error and success alerts

## 📚 API Endpoints (Ready to Implement)

### Authentication
```
POST   /api/auth/signup      # Create new user
POST   /api/auth/login       # User login
POST   /api/auth/logout      # User logout
POST   /api/auth/refresh     # Refresh token
```

### Products
```
GET    /api/products         # Get all products
GET    /api/products/:id     # Get product by ID
POST   /api/products         # Create product (supplier only)
PUT    /api/products/:id     # Update product
DELETE /api/products/:id     # Delete product
```

### Orders
```
GET    /api/orders           # Get user's orders
GET    /api/orders/:id       # Get order details
POST   /api/orders           # Create new order
PUT    /api/orders/:id       # Update order status
DELETE /api/orders/:id       # Cancel order
```

### Cart
```
GET    /api/cart             # Get current cart
POST   /api/cart/items       # Add item to cart
PUT    /api/cart/items/:id   # Update cart item
DELETE /api/cart/items/:id   # Remove from cart
DELETE /api/cart             # Clear cart
```

### Reviews
```
GET    /api/reviews          # Get product reviews
POST   /api/reviews          # Create review
PUT    /api/reviews/:id      # Update review
DELETE /api/reviews/:id      # Delete review
```

### Users
```
GET    /api/users/:id        # Get user profile
PUT    /api/users/:id        # Update profile
POST   /api/users/:id/avatar # Upload avatar
```

## 🛠️ Utility Functions

The `js/utils.js` file provides helper functions:

### API Calls
```javascript
apiCall(endpoint, options)  // Make HTTP requests
```

### Validation
```javascript
isValidEmail(email)         // Email format check
isValidPhone(phone)         // Phone format check
validatePassword(password)  // Password strength check
validateFormData(data, rules) // Complex form validation
```

### Storage Management
```javascript
getStoredData(key)          // Get from localStorage
storeData(key, value)       // Save to localStorage
removeStoredData(key)       // Delete from localStorage
clearAllStoredData()        // Clear all localStorage
```

### Session Management
```javascript
getCurrentUser()            // Get logged-in user
setCurrentUser(user)        // Set current user
getAuthToken()              // Get JWT token
setAuthToken(token)         // Set JWT token
isAuthenticated()           // Check if user is logged in
logout()                    // Clear session & redirect
```

### Shopping Cart
```javascript
getCart()                   # Get cart items
addToCart(item)            # Add item to cart
removeFromCart(itemId)     # Remove item from cart
updateCartQuantity(itemId, qty) # Update quantity
clearCart()                # Empty cart
getCartTotal()             # Get total amount
getCartItemCount()         # Get number of items
```

### UI Helpers
```javascript
showLoading(element)       # Show spinner
showError(message)         # Display error alert
showSuccess(message)       # Display success alert
displayFormErrors(errors)  # Show form validation errors
redirect(path)             # Navigate to page
getUrlParameter(name)      # Get query parameter
formatCurrency(amount)     # Format as currency
formatDate(date, format)   # Format date string
```

### Performance
```javascript
debounce(func, wait)       # Debounce function calls
throttle(func, limit)      # Throttle function calls
```

## 🎨 Design System

### Color Palette
```css
--primary-dark: #0f1115
--primary-light: #ffffff
--secondary-text: rgba(255, 255, 255, 0.72)
--border-light: rgba(255, 255, 255, 0.15)
--glass-bg: rgba(255, 255, 255, 0.08)
```

### Typography
- **Body**: Segoe UI, -apple-system, BlinkMacSystemFont
- **Base Size**: 16px
- **Line Height**: 1.75

### Spacing Scale
- Small (sm): 18px (border-radius)
- Medium (md): 26px
- Large (lg): 36px

### Components Available
- Buttons (primary, secondary, ghost)
- Forms (text inputs, selects, textarea)
- Cards (product cards, order cards)
- Panels (login, signup, summary)
- Alerts (success, error, warning, info)
- Navigation
- Footer

## 📱 Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Features

- ✅ SHA-256 password hashing
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ XSS protection ready
- ✅ JWT token support
- ✅ Rate limiting middleware
- ✅ HTTPS recommended (configure in .env)

## 📊 Database Schema

### User Collection
- Personal information
- Authentication credentials (hashed)
- Profile settings
- User type (customer/supplier)
- Timestamps

### Product Collection
- Product details (name, price, description)
- Supplier reference
- Inventory management
- Images/media
- Rating & reviews

### Order Collection
- Order details and items
- Customer & supplier info
- Payment status
- Shipping information
- Order status tracking

### Review Collection
- Product rating
- Customer feedback
- Helpful votes
- Timestamps

## 🧪 Testing

To run tests (when configured):
```bash
npm test
```

## 📈 Performance Optimization

- ✅ CSS variables for theme switching
- ✅ Responsive images ready
- ✅ Code splitting ready
- ✅ Lazy loading components
- ✅ Debounced/throttled functions
- ✅ Efficient DOM manipulation

## 🚢 Deployment

### Frontend
- Deploy to: Vercel, Netlify, GitHub Pages, or any static host
- Set `FRONTEND_URL` in backend .env

### Backend
- Deploy to: Heroku, Railway, AWS Lambda, DigitalOcean, etc.
- Set `DATABASE_URL` and other env vars

### Environment Variables Required
```
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## 🤝 Contributing

1. Follow the existing code style
2. Use semantic HTML
3. Keep CSS organized in shared.css
4. Use utility functions from utils.js
5. Test responsive design on mobile

## 📝 License

ISC License - Feel free to use for your project

## 📞 Support

For issues or questions, create an issue in your repository.

## 🗺️ Roadmap

- [ ] Complete backend API implementation
- [ ] Real payment processing (Stripe integration)
- [ ] Order tracking with notifications
- [ ] Supplier analytics dashboard
- [ ] Product search and filtering
- [ ] Review and rating system
- [ ] Wishlist functionality
- [ ] Admin dashboard
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Multi-language support

---

**Happy coding! 🎉**
