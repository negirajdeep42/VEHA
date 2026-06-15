// TypeScript type definitions for VEHA Jewelry

export interface User {
  email: string;
  name: string;
  phone?: string;
  roles: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface ProductVariant {
  id: number;
  variantType: string;
  variantValue: string;
  additionalPrice: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  wasPrice?: number;
  discountPercent?: number;
  featured: boolean;
  bestseller: boolean;
  stock: number;
  svgRender: string;
  categoryName?: string;
  categorySlug?: string;
  variants?: ProductVariant[];
}

export interface CartItem {
  id: string; // generated client-side: `${productId}-${variantSlug}` or backend DB id (number converted to string)
  productId: number;
  name: string;
  variant: string;
  price: number;
  qty: number;
  svg?: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  count: number;
}

export interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  wasPrice?: number;
  discountPercent?: number;
  svgRender: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  variantInfo: string;
  quantity: number;
  priceEach: number;
  priceTotal: number;
  svgRender?: string;
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddressLine: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  paymentGateway: string;
  paymentStatus: string;
  items: OrderItem[];
  trackingNumber?: string;
  invoicePdfUrl?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
}
