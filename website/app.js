const API_URL = location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api';

async function apiCall(method, endpoint, data = null) {
    const token = localStorage.getItem('token');
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (token) options.headers.Authorization = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'API Error');
    return result;
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function getCurrentUser() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) return null;
    return JSON.parse(user);
}

function checkAuthRedirect() {
    const user = getCurrentUser();
    if (!user) {
        location.href = 'login.html';
        return false;
    }
    return user;
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    const container = document.querySelector('main .container') || document.querySelector('main') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => alertDiv.remove(), 3500);
}

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = 'index.html';
}

function updateNavbar() {
    const user = getCurrentUser();
    const authMenu = document.getElementById('authMenu');
    if (!authMenu) return;

    if (user) {
        const dashboard = user.role === 'farmer' ? 'farmer-dashboard.html' : user.role === 'admin' ? '../frontend/dist/index.html' : 'buyer-dashboard.html';
        authMenu.innerHTML = `
            <span class="user-chip">${escapeHtml(user.name)}</span>
            <a href="${dashboard}" class="btn btn-secondary">Dashboard</a>
            <a href="#" onclick="logout(event)" class="btn btn-secondary">Logout</a>
        `;
    } else {
        authMenu.innerHTML = `
            <a href="login.html" class="btn btn-secondary">Login</a>
            <a href="register.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

function availability(crop) {
    if (crop.availability) return crop.availability;
    if (Number(crop.quantity) <= 0) return { label: 'Sold Out', level: 'sold-out' };
    if (Number(crop.quantity) <= 100) return { label: `Low Stock: ${crop.quantity}${crop.unit || 'kg'}`, level: 'low-stock' };
    return { label: `In Stock: ${crop.quantity}${crop.unit || 'kg'}`, level: 'in-stock' };
}

function availabilityBadge(crop) {
    const item = availability(crop);
    return `<span class="availability-badge ${item.level}">${escapeHtml(item.label)}</span>`;
}

function statusBadge(status) {
    const cls = status === 'pending' ? 'badge-warning' : status === 'rejected' ? 'badge-danger' : 'badge-success';
    return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function renderCropCard(crop, options = {}) {
    const distance = options.showDistance && crop.distance ? `<span>${Number(crop.distance).toFixed(1)} km away</span>` : '';
    const organic = crop.organic ? '<span class="badge badge-success">Organic</span>' : '';
    const premium = crop.qualityGrade === 'Premium' ? '<span class="badge badge-warning">Premium</span>' : '';
    return `
        <article class="crop-card ecommerce-card">
            <a href="crop-detail.html?id=${encodeURIComponent(crop.id)}" class="crop-image-wrap">
                <img src="${escapeHtml(crop.image || '')}" alt="${escapeHtml(crop.name)}" class="crop-image" onerror="this.style.display='none'">
                <div class="image-fallback">${escapeHtml((crop.name || 'C').slice(0, 1))}</div>
                <div class="card-badges">${organic}${premium}<span class="badge badge-muted">New Harvest</span></div>
            </a>
            <div class="crop-info">
                <div class="crop-title-row">
                    <div>
                        <p class="eyebrow">${escapeHtml(crop.category || 'Produce')}</p>
                        <h3 class="crop-name">${escapeHtml(crop.name)}</h3>
                        <p class="crop-variety">${escapeHtml(crop.variety || 'Standard variety')}</p>
                    </div>
                    <span class="quality-chip">${escapeHtml(crop.qualityGrade || 'A')}</span>
                </div>
                <div class="crop-details">${availabilityBadge(crop)}<span>${escapeHtml(crop.location || '')}</span>${distance}</div>
                <div class="crop-price">Rs.${escapeHtml(crop.expectedPrice)}<span>/${escapeHtml(crop.priceUnit || 'quintal')}</span></div>
                <a href="farmer-profile.html?id=${encodeURIComponent(crop.farmerId)}" class="farmer-link">${escapeHtml(crop.farmName || crop.farmerName || 'Farmer')}</a>
                <div class="crop-actions">
                    <a href="crop-detail.html?id=${encodeURIComponent(crop.id)}" class="btn btn-primary">View Deal</a>
                    <a href="farmer-profile.html?id=${encodeURIComponent(crop.farmerId)}" class="btn btn-secondary">Farmer</a>
                </div>
            </div>
        </article>
    `;
}

function renderStatusTimeline(status) {
    const steps = ['Confirmed', 'Preparing', 'Picked Up', 'In Transit', 'Delivered'];
    const activeIndex = steps.indexOf(status);
    if (activeIndex < 0) return '';
    return `
        <div class="status-stepper">
            ${steps.map((step, index) => `
                <div class="status-step ${index <= activeIndex ? 'active' : ''}">
                    <span>${index + 1}</span><strong>${step}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', updateNavbar);
