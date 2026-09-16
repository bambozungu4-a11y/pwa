/**
 * Dispensary Hub - Shared JavaScript Utilities
 */

// ==========================================
// API Configuration
// ==========================================
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

/**
 * Make API requests
 */
async function apiCall(endpoint, options = {}) {
    const {
        method = 'GET',
        body = null,
        headers = {},
        credentials = 'include'
    } = options;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    // Add authorization header if token exists
    const token = getAuthToken();
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers: defaultHeaders,
        credentials
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==========================================
// Form Validation
// ==========================================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function isValidPhone(phone) {
    const phoneRegex = /^[0-9\-\+\(\)\s]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate form data
 */
function validateFormData(data, rules) {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
        const rule = rules[field];
        const value = data[field];
        
        if (rule.required && (!value || value.trim() === '')) {
            errors[field] = `${rule.label || field} is required`;
            return;
        }
        
        if (rule.type === 'email' && value && !isValidEmail(value)) {
            errors[field] = 'Please enter a valid email address';
        }
        
        if (rule.type === 'phone' && value && !isValidPhone(value)) {
            errors[field] = 'Please enter a valid phone number';
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
            errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
        }
        
        if (rule.maxLength && value && value.length > rule.maxLength) {
            errors[field] = `${rule.label || field} must be no more than ${rule.maxLength} characters`;
        }
        
        if (rule.pattern && value && !rule.pattern.test(value)) {
            errors[field] = rule.message || `${rule.label || field} format is invalid`;
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ==========================================
// Local Storage Management
// ==========================================

/**
 * Get stored data
 */
function getStoredData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error);
        return null;
    }
}

/**
 * Store data
 */
function storeData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error);
    }
}

/**
 * Remove stored data
 */
function removeStoredData(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
    }
}

/**
 * Clear all stored data
 */
function clearAllStoredData() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage', error);
    }
}

// ==========================================
// Session Management
// ==========================================

/**
 * Get current user from storage
 */
function getCurrentUser() {
    return getStoredData('currentUser');
}

/**
 * Set current user
 */
function setCurrentUser(user) {
    storeData('currentUser', user);
}

/**
 * Get authentication token
 */
function getAuthToken() {
    return getStoredData('authToken');
}

/**
 * Set authentication token
 */
function setAuthToken(token) {
    storeData('authToken', token);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getAuthToken() && !!getCurrentUser();
}

/**
 * Logout user
 */
function logout() {
    removeStoredData('authToken');
    removeStoredData('currentUser');
    removeStoredData('cart');
    window.location.href = '/index.html';
}

// ==========================================
// Shopping Cart
// ==========================================

/**
 * Get shopping cart
 */
function getCart() {
    return getStoredData('cart') || [];
}

/**
 * Add item to cart
 */
function addToCart(item) {
    const cart = getCart();
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += item.quantity || 1;
    } else {
        cart.push({
            ...item,
            quantity: item.quantity || 1
        });
    }
    
    storeData('cart', cart);
    return cart;
}

/**
 * Remove item from cart
 */
function removeFromCart(itemId) {
    const cart = getCart();
    const filtered = cart.filter(i => i.id !== itemId);
    storeData('cart', filtered);
    return filtered;
}

/**
 * Update cart item quantity
 */
function updateCartQuantity(itemId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(itemId);
        }
        item.quantity = quantity;
        storeData('cart', cart);
    }
    
    return cart;
}

/**
 * Clear cart
 */
function clearCart() {
    removeStoredData('cart');
    return [];
}

/**
 * Get cart total
 */
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Get cart item count
 */
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// ==========================================
// UI Helpers
// ==========================================

/**
 * Show loading spinner
 */
function showLoading(element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

/**
 * Display error message
 */
function showError(message, containerId) {
    const container = document.querySelector(containerId || '#error-container');
    if (container) {
        container.innerHTML = `<div class="alert alert-error">${message}</div>`;
    }
}

/**
 * Display success message
 */
function showSuccess(message, containerId) {
    const container = document.querySelector(containerId || '#success-container');
    if (container) {
        container.innerHTML = `<div class="alert alert-success">${message}</div>`;
    }
}

/**
 * Display form validation errors
 */
function displayFormErrors(errors, formElement) {
    // Clear previous errors
    formElement.querySelectorAll('.error-message').forEach(el => el.remove());
    formElement.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    
    // Display new errors
    Object.keys(errors).forEach(field => {
        const input = formElement.querySelector(`[name="${field}"]`);
        if (input) {
            input.parentElement.classList.add('form-error');
            const errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.textContent = errors[field];
            input.parentElement.appendChild(errorEl);
        }
    });
}

/**
 * Redirect to page
 */
function redirect(path) {
    window.location.href = path;
}

/**
 * Get URL parameter
 */
function getUrlParameter(name) {
    const url = new URLSearchParams(window.location.search);
    return url.get(name);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(date, format = 'MM/DD/YYYY') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year);
}

// ==========================================
// Debounce & Throttle
// ==========================================

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiCall,
        isValidEmail,
        isValidPhone,
        validatePassword,
        validateFormData,
        getStoredData,
        storeData,
        removeStoredData,
        clearAllStoredData,
        getCurrentUser,
        setCurrentUser,
        getAuthToken,
        setAuthToken,
        isAuthenticated,
        logout,
        getCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        showLoading,
        showError,
        showSuccess,
        displayFormErrors,
        redirect,
        getUrlParameter,
        formatCurrency,
        formatDate,
        debounce,
        throttle
    };
}
