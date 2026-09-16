/**
 * Shared UI Components
 */

/**
 * Create navigation bar
 */
function createNavigation(userType = 'customer') {
    const nav = document.createElement('nav');
    nav.className = 'top-nav';
    
    const navHTML = `
        <div class="nav-container">
            <div class="nav-logo">THE PLUG</div>
            <ul class="nav-links">
                ${userType === 'customer' ? `
                    <li><a href="/index.html">Home</a></li>
                    <li><a href="/store-setup.html">Store</a></li>
                    <li><a href="/past-orders.html">Orders</a></li>
                ` : `
                    <li><a href="/supplier-dashboard.html">Dashboard</a></li>
                    <li><a href="/supplier-store.html">My Store</a></li>
                    <li><a href="/supplier-reports.html">Reports</a></li>
                `}
            </ul>
            <div class="nav-user-menu">
                ${isAuthenticated() ? `
                    <a href="#" id="cart-icon" class="flex-center gap-10">
                        🛒 <span id="cart-count" class="cart-badge">0</span>
                    </a>
                    <button id="user-menu" class="btn btn-secondary btn-small">
                        ${getCurrentUser()?.name || 'User'}
                    </button>
                    <button id="logout-btn" class="btn btn-secondary btn-small">Logout</button>
                ` : `
                    <a href="/index.html" class="btn btn-primary btn-small">Login</a>
                    <a href="/signup.html" class="btn btn-secondary btn-small">Sign Up</a>
                `}
            </div>
        </div>
    `;
    
    nav.innerHTML = navHTML;
    
    // Add event listeners
    if (isAuthenticated()) {
        document.addEventListener('DOMContentLoaded', () => {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
            updateCartBadge();
        });
    }
    
    return nav;
}

/**
 * Update cart badge
 */
function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = getCartItemCount();
    }
}

/**
 * Create footer
 */
function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-section">
                <h4>About THE PLUG</h4>
                <p>Your trusted dispensary hub for quality products and reliable suppliers.</p>
            </div>
            <div class="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="/index.html">Home</a></li>
                    <li><a href="/store-setup.html">Store</a></li>
                    <li><a href="/past-orders.html">Orders</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Support</h4>
                <ul>
                    <li><a href="#">Contact Us</a></li>
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Connect</h4>
                <p>Follow us on social media</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 THE PLUG. All rights reserved.</p>
        </div>
    `;
    return footer;
}

/**
 * Create product card
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || '/assets/placeholder.jpg'}" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description || ''}</p>
        <div class="product-footer">
            <span class="price">${formatCurrency(product.price)}</span>
            <button class="btn btn-primary btn-small add-to-cart-btn" data-product-id="${product.id}">
                Add to Cart
            </button>
        </div>
    `;
    
    card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
        e.preventDefault();
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
        updateCartBadge();
        showSuccess('Item added to cart');
    });
    
    return card;
}

/**
 * Create cart item element
 */
function createCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item flex-between';
    div.innerHTML = `
        <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>${formatCurrency(item.price)} x <input type="number" value="${item.quantity}" min="1" class="qty-input" data-item-id="${item.id}"></p>
        </div>
        <div class="cart-item-actions">
            <span class="item-total">${formatCurrency(item.price * item.quantity)}</span>
            <button class="btn btn-ghost btn-small remove-item-btn" data-item-id="${item.id}">Remove</button>
        </div>
    `;
    
    const qtyInput = div.querySelector('.qty-input');
    qtyInput.addEventListener('change', (e) => {
        const qty = parseInt(e.target.value);
        updateCartQuantity(item.id, qty);
        updateCartBadge();
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    });
    
    div.querySelector('.remove-item-btn').addEventListener('click', () => {
        removeFromCart(item.id);
        updateCartBadge();
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    });
    
    return div;
}

/**
 * Create order card
 */
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'card order-card';
    card.innerHTML = `
        <div class="flex-between">
            <div>
                <h3>Order #${order.id}</h3>
                <p class="order-date">${formatDate(order.createdAt)}</p>
            </div>
            <div class="text-right">
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                <p class="order-total">${formatCurrency(order.total)}</p>
            </div>
        </div>
        <div class="order-items mt-20">
            <h4>Items:</h4>
            <ul>
                ${order.items.map(item => `
                    <li>${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}</li>
                `).join('')}
            </ul>
        </div>
        <button class="btn btn-secondary btn-small view-order-btn mt-20" data-order-id="${order.id}">
            View Details
        </button>
    `;
    return card;
}

/**
 * Create modal dialog
 */
function createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${typeof content === 'string' ? content : ''}
            </div>
            <div class="modal-footer">
                ${actions.map(action => `
                    <button class="btn btn-${action.type || 'secondary'} modal-action" data-action="${action.id}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    const close = () => modal.remove();
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    
    actions.forEach(action => {
        const btn = modal.querySelector(`[data-action="${action.id}"]`);
        if (btn && action.callback) {
            btn.addEventListener('click', () => {
                action.callback();
                close();
            });
        }
    });
    
    return modal;
}

/**
 * Create breadcrumb navigation
 */
function createBreadcrumb(items) {
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    
    const html = items.map((item, index) => {
        if (index === items.length - 1) {
            return `<span class="breadcrumb-item active">${item.label}</span>`;
        }
        return `<a href="${item.href}" class="breadcrumb-item">${item.label}</a>`;
    }).join('<span class="breadcrumb-separator">/</span>');
    
    breadcrumb.innerHTML = html;
    return breadcrumb;
}

/**
 * Create search bar
 */
function createSearchBar(onSearch) {
    const form = document.createElement('form');
    form.className = 'search-bar';
    form.onsubmit = (e) => {
        e.preventDefault();
        const query = form.querySelector('input').value;
        onSearch(query);
    };
    
    form.innerHTML = `
        <input type="text" placeholder="Search products..." class="search-input">
        <button type="submit" class="btn btn-primary">Search</button>
    `;
    
    return form;
}

/**
 * Create filter panel
 */
function createFilterPanel(filters, onFilterChange) {
    const panel = document.createElement('div');
    panel.className = 'filter-panel';
    
    let html = '<h3>Filters</h3>';
    Object.keys(filters).forEach(filterName => {
        const options = filters[filterName];
        html += `
            <div class="filter-group">
                <label>${filterName}</label>
                <select class="filter-select" data-filter="${filterName}">
                    <option value="">All</option>
                    ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
            </div>
        `;
    });
    
    panel.innerHTML = html;
    
    panel.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', () => {
            const filterData = {};
            panel.querySelectorAll('.filter-select').forEach(s => {
                const value = s.value;
                if (value) {
                    filterData[s.dataset.filter] = value;
                }
            });
            onFilterChange(filterData);
        });
    });
    
    return panel;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createNavigation,
        updateCartBadge,
        createFooter,
        createProductCard,
        createCartItem,
        createOrderCard,
        createModal,
        createBreadcrumb,
        createSearchBar,
        createFilterPanel
    };
}
