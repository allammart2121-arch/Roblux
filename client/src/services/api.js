const API_BASE_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('roblox_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al comunicarse con el servidor.');
  }
  return data;
}

export const apiService = {
  // Site Public Settings
  async getSettings() {
    const res = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(res);
  },

  // Auth
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Products Catalog
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/products?${query}`);
    return handleResponse(res);
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(res);
  },

  // Wallet
  async getWalletBalance() {
    const res = await fetch(`${API_BASE_URL}/wallet/balance`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getWalletTransactions() {
    const res = await fetch(`${API_BASE_URL}/wallet/transactions`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Payment Gateway
  async initiatePayment(paymentData) {
    const res = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    return handleResponse(res);
  },

  async processPayment(payload) {
    const res = await fetch(`${API_BASE_URL}/payments/process`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Orders
  async checkout(orderData) {
    const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },

  async getUserOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // --- ADMIN METHODS ---
  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAdminSettings() {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateAdminSettings(settings) {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async adjustUserBalance(payload) {
    const res = await fetch(`${API_BASE_URL}/admin/users/balance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAdminOrders() {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getAdminTransactions() {
    const res = await fetch(`${API_BASE_URL}/admin/transactions`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async reviewDeposit(payload) {
    const res = await fetch(`${API_BASE_URL}/admin/transactions/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  }
};
