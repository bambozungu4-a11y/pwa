/**
 * Login Page Script - Authentication Handler
 */

const step1Form = document.getElementById('step1-form');
const step2Form = document.getElementById('step2-form');
const resetForm = document.getElementById('reset-form');
const loginInput = document.getElementById('login-input');
const showLoginIdentifier = document.getElementById('show-login-identifier');
const resetLoginIdentifier = document.getElementById('reset-login-identifier');
const passwordInput = document.getElementById('password-input');
const newPasswordInput = document.getElementById('new-password-input');
const confirmPasswordInput = document.getElementById('confirm-password-input');
const backButton = document.getElementById('back-button');
const resetBackButton = document.getElementById('reset-back-button');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const errorContainer = document.getElementById('error-container');

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

/**
 * Show error message
 */
function displayError(message) {
    errorContainer.innerHTML = `<div class="alert alert-error">${message}</div>`;
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
 * Find account in localStorage
 */
function findAccount(loginValue) {
    const savedSignup = JSON.parse(localStorage.getItem('signupData') || 'null');
    const savedSupplier = JSON.parse(localStorage.getItem('supplierData') || 'null');
    
    if (savedSignup && (savedSignup.email === loginValue || savedSignup.phone === loginValue)) {
        return { record: savedSignup, storageKey: 'signupData' };
    }
    if (savedSupplier && (savedSupplier.email === loginValue || savedSupplier.phone === loginValue)) {
        return { record: savedSupplier, storageKey: 'supplierData' };
    }
    return null;
}

/**
 * Verify password against stored hash
 */
async function verifyPassword(record, passwordValue) {
    if (record.passwordHash) {
        const hashValue = await hashPassword(passwordValue);
        return hashValue === record.passwordHash;
    }
    // Fallback for plain text passwords (legacy)
    return record.password === passwordValue;
}

/**
 * Step 1: Collect login identifier
 */
step1Form.addEventListener('submit', function(e) {
    e.preventDefault();
    const loginValue = loginInput.value.trim();
    
    if (!loginValue) {
        displayError('Please enter your email or phone number to continue.');
        return;
    }
    
    // Validate email or phone
    if (!isValidEmail(loginValue) && !isValidPhone(loginValue)) {
        displayError('Please enter a valid email address or phone number.');
        return;
    }
    
    showLoginIdentifier.textContent = loginValue;
    step1Form.style.display = 'none';
    step2Form.style.display = 'block';
    errorContainer.innerHTML = '';
});

/**
 * Back button from Step 2
 */
backButton.addEventListener('click', function() {
    step2Form.style.display = 'none';
    resetForm.style.display = 'none';
    step1Form.style.display = 'block';
    passwordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    errorContainer.innerHTML = '';
});

/**
 * Forgot password link
 */
forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    const loginValue = loginInput.value.trim();
    
    if (!loginValue) {
        displayError('Please enter your email or phone number first.');
        return;
    }
    
    const account = findAccount(loginValue);
    if (!account) {
        displayError('No account found for that email or phone. Please sign up.');
        return;
    }
    
    resetLoginIdentifier.textContent = loginValue;
    step2Form.style.display = 'none';
    resetForm.style.display = 'block';
    errorContainer.innerHTML = '';
});

/**
 * Back button from Reset form
 */
resetBackButton.addEventListener('click', function() {
    resetForm.style.display = 'none';
    step2Form.style.display = 'block';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    errorContainer.innerHTML = '';
});

/**
 * Step 2: Verify password and login
 */
step2Form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const loginValue = loginInput.value.trim();
    const passwordValue = passwordInput.value;
    
    if (!passwordValue) {
        displayError('Please enter your password.');
        return;
    }
    
    try {
        // Call backend API
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: {
                email: loginValue,
                password: passwordValue
            }
        });
        
        if (response.success) {
            // Store token
            setAuthToken(response.token);
            
            // Store user info
            setCurrentUser({
                id: response.user.id || response.user._id,
                name: response.user.name,
                email: response.user.email,
                phone: response.user.phone,
                userType: response.user.userType
            });
            
            displaySuccess('Login successful! Redirecting...');
            
            // Redirect based on user type
            setTimeout(() => {
                if (response.user.userType === 'supplier') {
                    window.location.href = 'supplier-dashboard.html';
                } else {
                    window.location.href = 'landing.html';
                }
            }, 1000);
        } else {
            displayError(response.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        // Fallback to localStorage for offline demo
        console.warn('Backend API unavailable, using offline mode');
        
        const accountData = findAccount(loginValue);
        if (!accountData) {
            displayError('No account found. Please sign up.');
            return;
        }
        
        const passwordValid = await verifyPassword(accountData.record, passwordValue);
        if (!passwordValid) {
            displayError('Incorrect password. Please try again.');
            return;
        }
        
        setCurrentUser({
            id: accountData.record.id || accountData.record.email,
            name: accountData.record.name || accountData.record.email,
            email: accountData.record.email,
            phone: accountData.record.phone,
            userType: accountData.storageKey === 'supplierData' ? 'supplier' : 'customer'
        });
        
        setAuthToken('demo-token-' + Date.now());
        
        displaySuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
            if (accountData.storageKey === 'supplierData') {
                window.location.href = 'supplier-dashboard.html';
            } else {
                window.location.href = 'landing.html';
            }
        }, 1000);
    }
});

/**
 * Reset password form
 */
resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const loginValue = loginInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!newPassword || !confirmPassword) {
        displayError('Please enter and confirm your new password.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        displayError('Passwords do not match.');
        return;
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        displayError('Password is too weak. ' + passwordValidation.errors.join(' '));
        return;
    }
    
    const accountData = findAccount(loginValue);
    if (!accountData) {
        displayError('No account found. Please sign up.');
        return;
    }
    
    // Hash and save new password
    const hashed = await hashPassword(newPassword);
    accountData.record.passwordHash = hashed;
    delete accountData.record.password;
    
    localStorage.setItem(accountData.storageKey, JSON.stringify(accountData.record));
    
    displaySuccess('Password reset successfully! Signing in...');
    
    setTimeout(() => {
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        resetForm.style.display = 'none';
        step2Form.style.display = 'block';
        passwordInput.value = '';
    }, 1500);
});
