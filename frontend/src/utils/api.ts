// VEHA Jewelry API Client Utility

const API_BASE_URL = 'http://localhost:8080/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  options.headers = options.headers || {};
  options.headers['Content-Type'] = 'application/json';
  
  const token = localStorage.getItem('veha_token');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      // Token might have expired, attempt to refresh
      const refreshToken = localStorage.getItem('veha_refresh_token');
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              localStorage.setItem('veha_token', refreshData.accessToken);
              localStorage.setItem('veha_refresh_token', refreshData.refreshToken);
              isRefreshing = false;
              onRefreshed(refreshData.accessToken);
            } else {
              // Refresh failed, clear session
              localStorage.removeItem('veha_token');
              localStorage.removeItem('veha_refresh_token');
              localStorage.removeItem('veha_user');
              isRefreshing = false;
              window.location.href = '/login';
              throw new Error('Session expired');
            }
          } catch (refreshErr) {
            isRefreshing = false;
            throw refreshErr;
          }
        }

        // Wait for refresh to complete, then retry
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            options.headers = options.headers || {};
            options.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(apiFetch(endpoint, options));
          });
        });
      } else {
        localStorage.removeItem('veha_token');
        localStorage.removeItem('veha_user');
      }
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const VehaApi = {
  // Auth
  register: (name: string, email: string, phone: string, password: string) => 
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, phone, password }) }),
      
  login: (email: string, password: string) => 
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () => 
    apiFetch('/auth/logout', { method: 'POST' }),
      
  forgotPassword: (email: string) => 
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
      
  resetPassword: (token: string, newPassword: string) => 
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

  verifyEmail: (token: string) =>
    apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    
    const queryString = query.toString();
    return apiFetch(`/products${queryString ? '?' + queryString : ''}`);
  },
  
  getProductById: (id: number) => apiFetch(`/products/${id}`),
  getProductBySlug: (slug: string) => apiFetch(`/products/slug/${slug}`),

  // Categories
  getCategories: () => apiFetch('/categories'),

  // Cart
  getCart: () => apiFetch('/cart'),
  addToCart: (productId: number, variantInfo: string, quantity: number) => 
    apiFetch('/cart/add', { method: 'POST', body: JSON.stringify({ productId, variantInfo, quantity }) }),
  updateCartItem: (itemId: number, quantity: number) => 
    apiFetch(`/cart/update?itemId=${itemId}&quantity=${quantity}`, { method: 'PUT' }),
  removeCartItem: (itemId: number) => 
    apiFetch(`/cart/remove?itemId=${itemId}`, { method: 'DELETE' }),
  mergeCart: (guestItems: any[]) => 
    apiFetch('/cart/merge', { method: 'POST', body: JSON.stringify(guestItems) }),

  // Wishlist
  getWishlist: () => apiFetch('/wishlist'),
  addToWishlist: (productId: number) => 
    apiFetch(`/wishlist/add?productId=${productId}`, { method: 'POST' }),
  removeFromWishlist: (productId: number) => 
    apiFetch(`/wishlist/remove?productId=${productId}`, { method: 'DELETE' }),

  // Orders
  placeOrder: (checkoutData: any) => 
    apiFetch('/orders', { method: 'POST', body: JSON.stringify(checkoutData) }),
  getOrders: () => apiFetch('/orders'),
  getOrderDetails: (id: number) => apiFetch(`/orders/${id}`),

  // Profile
  getProfile: () => apiFetch('/customer/profile'),
  updateProfile: (profileData: any) => 
    apiFetch('/customer/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Contact
  submitContact: (name: string, email: string, subject: string, message: string) => 
    apiFetch('/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) }),

  // Payments
  registerPaymentIntentStripe: () => 
    apiFetch('/payments/stripe/create-payment-intent', { method: 'POST' }),
  registerPaymentIntentRazorpay: () => 
    apiFetch('/payments/razorpay/create-order', { method: 'POST' }),
  verifyPaymentRazorpay: (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => 
    apiFetch('/payments/razorpay/verify', { 
      method: 'POST', 
      body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) 
    }),

  // Reviews
  getProductReviews: (productId: number) => 
    apiFetch(`/reviews/product/${productId}`),
  submitProductReview: (productId: number, rating: number, comment: string) => 
    apiFetch(`/reviews/product/${productId}`, { 
      method: 'POST', 
      body: JSON.stringify({ rating, comment }) 
    })
};
