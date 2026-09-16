/**
 * Signup Page Script - Registration Handler with Validation
 */

const signupForm = document.getElementById('signup-form');
const userTypeButtons = document.querySelectorAll('.user-type-btn');
const userTypeInput = document.getElementById('userType');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const supplierFields = document.getElementById('supplier-fields');
const errorContainer = document.getElementById('error-container');

// Password requirement checkers
const checks = {
    length: document.getElementById('check-length'),
    upper: document.getElementById('check-upper'),
    lower: document.getElementById('check-lower'),
    number: document.getElementById('check-number'),
    special: document.getElementById('check-special')
};

/**
 * Display error message
 */
function displayError(message) {
    errorContainer.innerHTML = `<div class="alert alert-error">${message}</div>`;
    window.scrollTo(0, 0);
    setTimeout(() => {
        errorContainer.innerHTML = '';
    }, 5000);
}

/**
 * Display success message
 */
function displaySuccess(message) {
    errorContainer.innerHTML = `<div class="alert alert-success">${message}</div>`;
}

/**
 * Update password strength indicators
 */
passwordInput.addEventListener('input', function() {
    const password = this.value;
    
    // Check requirements
    checks.length.classList.toggle('checked', password.length >= 8);
    checks.upper.classList.toggle('checked', /[A-Z]/.test(password));
    checks.lower.classList.toggle('checked', /[a-z]/.test(password));
    checks.number.classList.toggle('checked', /[0-9]/.test(password));
    checks.special.classList.toggle('checked', /[!@#$%^&*]/.test(password));
});

/**
 * Handle user type selection
 */
userTypeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        userTypeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update hidden input
        const type = btn.dataset.type;
        userTypeInput.value = type;
        
        // Show/hide supplier fields
        if (type === 'supplier') {
            supplierFields.style.display = 'block';
            document.getElementById('storeName').required = true;
        } else {
            supplierFields.style.display = 'none';
            document.getElementById('storeName').required = false;
        }
    });
});

/**
 * Handle form submission
 */
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
        userType: userTypeInput.value,
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        country: document.getElementById('country').value.trim(),
        terms: document.getElementById('terms').checked
    };
    
    // Add supplier fields if applicable
    if (formData.userType === 'supplier') {
        formData.storeName = document.getElementById('storeName').value.trim();
        formData.storeDescription = document.getElementById('storeDescription').value.trim();
    }
    
    // Validation rules
    const rules = {
        name: { required: true, minLength: 2, label: 'Full Name' },
        email: { required: true, type: 'email', label: 'Email' },
        phone: { required: true, type: 'phone', label: 'Phone' },
        password: { required: true, minLength: 8, label: 'Password' },
        terms: { required: true }
    };
    
    if (formData.userType === 'supplier') {
        rules.storeName = { required: true, label: 'Store Name' };
    }
    
    // Validate form
    const validation = validateFormData(formData, rules);
    if (!validation.isValid) {
        displayError('Please fix the following errors: ' + Object.values(validation.errors).join(', '));
        return;
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
        displayError('Password is too weak. ' + passwordValidation.errors.join(' '));
        return;
    }
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
        displayError('Passwords do not match.');
        return;
    }
    
    // Check if email already exists
    const existingCustomer = getStoredData('signupData');
    const existingSupplier = getStoredData('supplierData');
    
    if (existingCustomer && existingCustomer.email === formData.email) {
        displayError('This email is already registered as a customer.');
        return;
    }
    
    if (existingSupplier && existingSupplier.email === formData.email) {
        displayError('This email is already registered as a supplier.');
        return;
    }
    
    // Hash password
    try {
        const passwordHash = await hashPassword(formData.password);
        
        // Prepare data for API
        const signupData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            userType: formData.userType
        };
        
        // Try backend API first
        try {
            const response = await apiCall('/auth/signup', {
                method: 'POST',
                body: signupData
            });
            
            if (response.success) {
                // Store token
                setAuthToken(response.token);
                
                // Store user info
                setCurrentUser({
                    id: response.user.id || response.user._id,
                    name: response.user.name,
                    email: response.user.email,
                    userType: response.user.userType
                });
                
                displaySuccess('Account created successfully! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                return;
            } else {
                // Check for duplicate email error
                if (response.message && response.message.includes('already exists')) {
                    displayError(response.message);
                    return;
                }
                displayError(response.message || 'Signup failed. Please try again.');
                return;
            }
        } catch (apiError) {
            // Fallback to localStorage for offline demo
            console.warn('Backend API unavailable, using offline mode');
            
            // Check if email already exists
            const existingCustomer = getStoredData('signupData');
            const existingSupplier = getStoredData('supplierData');
            
            if (existingCustomer && existingCustomer.email === formData.email) {
                displayError('This email is already registered as a customer.');
                return;
            }
            
            if (existingSupplier && existingSupplier.email === formData.email) {
                displayError('This email is already registered as a supplier.');
                return;
            }
            
            // Prepare data for local storage
            const userData = {
                id: 'user-' + Date.now(),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                passwordHash: passwordHash,
                userType: formData.userType,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country,
                createdAt: new Date().toISOString(),
                isVerified: false,
                isActive: true
            };
            
            // Add supplier-specific fields
            if (formData.userType === 'supplier') {
                userData.storeName = formData.storeName;
                userData.storeDescription = formData.storeDescription;
            }
            
            // Save to localStorage
            if (formData.userType === 'supplier') {
                storeData('supplierData', userData);
            } else {
                storeData('signupData', userData);
            }
            
            // Simulate API response
            setCurrentUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                userType: userData.userType
            });
            
            setAuthToken('demo-token-' + Date.now());
            
            displaySuccess('Account created successfully! Redirecting to login...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
        
    } catch (error) {
        displayError('An error occurred while creating your account. Please try again.');
        console.error('Signup error:', error);
    }
});

/**
 * Hash password using SHA-256
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
