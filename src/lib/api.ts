import { logEvent } from "./security";

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check for explicit API URL from environment
  if (import.meta.env.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace('/api', '');
  }

  // In development, use localhost
  if (import.meta.env.DEV) {
    return "http://localhost:4000";
  }

  // For production/mobile, use the current origin or a configured backend URL
  // This allows the app to work when served from different domains
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');

  if (isLocalhost) {
    return "http://localhost:4000";
  }

  // For production deployments, assume backend is on the same domain or use environment variable
  return import.meta.env.VITE_BACKEND_URL || `${currentOrigin}/api`.replace('/api/api', '/api');
};

const API_BASE_URL = getApiBaseUrl();
const TOKEN_KEY = "auth_token";
const FIREBASE_TOKEN_KEY = "firebase_id_token";

export function getAuthToken(): string | null {
	try {
		return localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setAuthToken(token: string | null): void {
	try {
		if (token) localStorage.setItem(TOKEN_KEY, token);
		else localStorage.removeItem(TOKEN_KEY);
	} catch {
		// ignore
	}
}

export function getFirebaseToken(): string | null {
	try {
		return localStorage.getItem(FIREBASE_TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setFirebaseToken(token: string | null): void {
	try {
		if (token) localStorage.setItem(FIREBASE_TOKEN_KEY, token);
		else localStorage.removeItem(FIREBASE_TOKEN_KEY);
	} catch {
		// ignore
	}
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(path: string, options: {
	method?: HttpMethod;
	body?: unknown;
	auth?: boolean;
} = {}): Promise<T> {
	const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (options.auth) {
		// Prefer Firebase token over JWT token
		const firebaseToken = getFirebaseToken();
		const jwtToken = getAuthToken();
		const token = firebaseToken || jwtToken;
		if (token) headers["Authorization"] = `Bearer ${token}`;
	}
	const res = await fetch(url, {
		method: options.method || "GET",
		headers,
		body: options.body ? JSON.stringify(options.body) : undefined,
	});
	if (!res.ok) {
		let errorMessage = `Request failed: ${res.status}`;
		try {
			const errorData = await res.json();
			errorMessage = errorData.error || errorData.message || errorMessage;
		} catch {
			const text = await res.text().catch(() => "");
			errorMessage = text || errorMessage;
		}
		logEvent({ level: "warn", message: "API error", context: { url, status: res.status, body: errorMessage } });
		throw new Error(errorMessage);
	}
	const contentType = res.headers.get("content-type") || "";
	if (contentType.includes("application/json")) return (await res.json()) as T;
	return undefined as unknown as T;
}

// Type definitions
export interface User {
	id: string;
	name: string;
	email: string;
	role: 'user' | 'artisan' | 'admin';
	avatar?: string;
	phone?: string;
	address?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	preferences?: {
		newsletter: boolean;
		notifications: boolean;
		language: string;
	};
	isEmailVerified?: boolean;
	authProvider?: 'firebase' | 'local';
	firebaseUid?: string;
	lastLogin?: string;
	createdAt?: string;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	images: string[];
	category: string;
	subcategory: string;
	materials: string[];
	dimensions: string;
	weight: string;
	colors: string[];
	inStock: boolean;
	stockCount: number;
	artisan: {
		id: string;
		name: string;
		location: string;
		bio: string;
		avatar: string;
		rating: number;
		totalProducts: number;
	} | null;
	rating: number;
	reviewCount: number;
	tags: string[];
	isHandmade: boolean;
	shippingTime: string;
	featured: boolean;
}

export interface CartItem {
	productId: Product;
	quantity: number;
	addedAt: string;
}

export interface Cart {
	items: CartItem[];
	total: number;
	itemCount: number;
	updatedAt: string;
}

export interface Order {
	_id: string;
	id: string;
	orderNumber: string;
	items: Array<{
		productId: string;
		name: string;
		price: number;
		quantity: number;
		artisanId: string;
		image: string;
	}>;
	subtotal: number;
	shippingCost: number;
	tax: number;
	total: number;
	shippingAddress: {
		fullName: string;
		street?: string;
		addressLine1?: string;
		addressLine2?: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
		phone: string;
		email?: string;
	};
	billingAddress?: {
		fullName: string;
		street?: string;
		addressLine1?: string;
		addressLine2?: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
		phone: string;
		email?: string;
	};
	paymentMethod: 'cod' | 'zoho_card' | 'zoho_upi' | 'zoho_netbanking' | 'zoho_wallet' | 'razorpay' | 'upi';
	paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
	status: 'placed' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
	statusHistory: Array<{
		status: string;
		timestamp: string;
		note?: string;
	}>;
	trackingNumber?: string;
	courierService?: string;
	zohoOrderId?: string;
	zohoPaymentId?: string;
	createdAt: string;
}

export interface Review {
	id: string;
	userId: string;
	productId: string;
	orderId: string;
	rating: number;
	title?: string;
	comment: string;
	images?: string[];
	isVerified: boolean;
	response?: {
		message: string;
		respondedBy: string;
		respondedAt: string;
	};
	createdAt: string;
}

// API Functions
export const authApi = {
	signUp: (data: { name: string; email: string; password: string }) =>
		apiRequest<{ token: string; user: User }>(
			"/api/auth/signup",
			{ method: "POST", body: data }
		),
	signIn: (data: { email: string; password: string }) =>
		apiRequest<{ token: string; user: User }>(
			"/api/auth/signin",
			{ method: "POST", body: data }
		),
};

// Firebase Auth API Functions
export const firebaseAuthApi = {
	syncUser: (data: { idToken: string; role?: 'user' | 'artisan' }) =>
		apiRequest<{ message: string; user: User }>(
			"/api/firebase-auth/sync",
			{ method: "POST", body: data }
		),
	getCurrentUser: (idToken: string) =>
		apiRequest<{ user: User }>(
			"/api/firebase-auth/me",
			{ method: "GET", auth: true }
		),
	updateProfile: (data: { 
		name?: string; 
		phone?: string; 
		address?: Partial<User['address']>; 
		preferences?: Partial<User['preferences']>; 
	}, idToken: string) =>
		apiRequest<{ message: string; user: User }>(
			"/api/firebase-auth/profile",
			{ method: "PATCH", body: data, auth: true }
		),
	deleteAccount: (idToken: string) =>
		apiRequest<{ message: string }>(
			"/api/firebase-auth/account",
			{ method: "DELETE", auth: true }
		),
};

export const productsApi = {
	getAll: (params?: { 
		page?: number; 
		limit?: number; 
		category?: string; 
		q?: string;
		minPrice?: number;
		maxPrice?: number;
		artisanId?: string;
	}) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ products: Product[]; pagination: any }>(`/api/products${queryString ? `?${queryString}` : ''}`);
	},
	
	getById: (id: string) =>
		apiRequest<Product>(`/api/products/${id}`),
	
	create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
		apiRequest<Product>("/api/products", { 
			method: "POST", 
			body: data, 
			auth: true 
		}),
	
	update: (id: string, data: Partial<Product>) =>
		apiRequest<Product>(`/api/products/${id}`, { 
			method: "PUT", 
			body: data, 
			auth: true 
		}),
	
	delete: (id: string) =>
		apiRequest<void>(`/api/products/${id}`, { 
			method: "DELETE", 
			auth: true 
		}),
};

export const cartApi = {
	get: () =>
		apiRequest<Cart>("/api/cart", { auth: true }),
	
	add: (productId: string, quantity: number = 1) =>
		apiRequest<{ message: string; cart: Cart }>("/api/cart/add", {
			method: "POST",
			body: { productId, quantity },
			auth: true
		}),
	
	updateItem: (productId: string, quantity: number) =>
		apiRequest<{ message: string; cart: Cart }>(`/api/cart/item/${productId}`, {
			method: "PATCH",
			body: { quantity },
			auth: true
		}),
	
	removeItem: (productId: string) =>
		apiRequest<{ message: string }>(`/api/cart/item/${productId}`, {
			method: "DELETE",
			auth: true
		}),
	
	clear: () =>
		apiRequest<{ message: string }>("/api/cart/clear", {
			method: "DELETE",
			auth: true
		}),
};

export const ordersApi = {
	getMyOrders: (params?: { page?: number; limit?: number }) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ orders: Order[]; pagination: any }>(`/api/orders/my-orders${queryString ? `?${queryString}` : ''}`, { auth: true });
	},
	
	getById: (id: string) =>
		apiRequest<Order>(`/api/orders/${id}`, { auth: true }),
	
	create: (data: {
		items: Array<{ productId: string; quantity: number }>;
		shippingAddress: Order['shippingAddress'];
		billingAddress?: Order['billingAddress'];
		useShippingAsBilling?: boolean;
		paymentMethod: Order['paymentMethod'];
		paymentId?: string;
		zohoPaymentId?: string;
		zohoOrderId?: string;
		notes?: string;
		isGift?: boolean;
		giftMessage?: string;
	}) =>
		apiRequest<Order>("/api/orders", {
			method: "POST",
			body: data,
			auth: true
		}),
	
	cancel: (id: string) =>
		apiRequest<{ message: string; order: Order }>(`/api/orders/${id}/cancel`, {
			method: "PATCH",
			auth: true
		}),
};

export const paymentsApi = {
	createPaymentOrder: (data: { orderId: string }) =>
		apiRequest<{
			success: boolean;
			paymentOrder: {
				zohoOrderId: string;
				amount: number;
				currency: string;
				paymentUrl: string;
				orderNumber: string;
			};
		}>("/api/payments/create-order", {
			method: "POST",
			body: data,
			auth: true
		}),
	
	verifyPayment: (data: { 
		zohoPaymentId: string;
		zohoOrderId: string;
		paymentStatus: string;
	}) =>
		apiRequest<{
			success: boolean;
			paymentStatus: string;
			orderStatus: string;
			message: string;
		}>("/api/payments/verify", {
			method: "POST",
			body: data,
			auth: true
		}),
	
	getPaymentMethods: () =>
		apiRequest<{
			success: boolean;
			paymentMethods: Array<{
				id: string;
				name: string;
				description: string;
				fees?: string;
			}>;
		}>("/api/payments/methods"),
	
	getPaymentStatus: (orderId: string) =>
		apiRequest<{
			success: boolean;
			payment: {
				paymentStatus: string;
				paymentMethod: string;
				zohoPaymentId?: string;
				zohoOrderId?: string;
				paidAt?: string;
				refundedAt?: string;
				refundAmount?: number;
			};
		}>(`/api/payments/order/${orderId}/status`, { auth: true }),
	
	processRefund: (data: {
		orderId: string;
		refundAmount?: number;
		reason?: string;
	}) =>
		apiRequest<{
			success: boolean;
			refund: {
				refundId: string;
				amount: number;
				status: string;
			};
			message: string;
		}>("/api/payments/refund", {
			method: "POST",
			body: data,
			auth: true
		}),
};

export const reviewsApi = {
	getForProduct: (productId: string, params?: { page?: number; limit?: number }) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ 
			reviews: Review[]; 
			pagination: any; 
			statistics: { 
				averageRating: number; 
				totalReviews: number; 
				ratingDistribution: Array<{ _id: number; count: number }>;
			};
		}>(`/api/reviews/product/${productId}${queryString ? `?${queryString}` : ''}`);
	},
	
	getMyReviews: (params?: { page?: number; limit?: number }) => {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
		}
		const queryString = searchParams.toString();
		return apiRequest<{ reviews: Review[]; pagination: any }>(`/api/reviews/my-reviews${queryString ? `?${queryString}` : ''}`, { auth: true });
	},
	
	create: (data: {
		productId: string;
		orderId: string;
		rating: number;
		title?: string;
		comment: string;
		images?: string[];
	}) =>
		apiRequest<{ message: string; review: Review }>("/api/reviews", {
			method: "POST",
			body: data,
			auth: true
		}),
	
	update: (id: string, data: Partial<Review>) =>
		apiRequest<{ message: string; review: Review }>(`/api/reviews/${id}`, {
			method: "PATCH",
			body: data,
			auth: true
		}),
	
	delete: (id: string) =>
		apiRequest<{ message: string }>(`/api/reviews/${id}`, {
			method: "DELETE",
			auth: true
		}),
	
	respond: (id: string, message: string) =>
		apiRequest<{ message: string; review: Review }>(`/api/reviews/${id}/respond`, {
			method: "POST",
			body: { message },
			auth: true
		}),
};

// Unified API export
export const api = {
	// Auth
	signIn: authApi.signIn,
	signUp: authApi.signUp,
	
	// Products
	getProducts: productsApi.getAll,
	getProduct: productsApi.getById,
	createProduct: productsApi.create,
	updateProduct: productsApi.update,
	deleteProduct: productsApi.delete,
	
	// Cart
	getCart: cartApi.get,
	addToCart: cartApi.add,
	updateCartItem: cartApi.updateItem,
	removeFromCart: cartApi.removeItem,
	clearCart: cartApi.clear,
	
	// Orders
	getUserOrders: ordersApi.getMyOrders,
	getOrder: ordersApi.getById,
	createOrder: ordersApi.create,
	cancelOrder: ordersApi.cancel,
	
	// Payments
	createPaymentOrder: paymentsApi.createPaymentOrder,
	verifyPayment: paymentsApi.verifyPayment,
	getPaymentMethods: paymentsApi.getPaymentMethods,
	getPaymentStatus: paymentsApi.getPaymentStatus,
	processRefund: paymentsApi.processRefund,
	
	// Reviews
	getProductReviews: reviewsApi.getForProduct,
	createReview: reviewsApi.create,
	updateReview: reviewsApi.update,
	deleteReview: reviewsApi.delete,
	
	// Wishlist
	getWishlist: () => apiRequest<any[]>('/api/wishlist', { auth: true }),
	addToWishlist: (productId: string) => 
		apiRequest<{ message: string }>('/api/wishlist/add', {
			method: 'POST',
			body: { productId },
			auth: true
		}),
	removeFromWishlist: (productId: string) => 
		apiRequest<{ message: string }>(`/api/wishlist/item/${productId}`, {
			method: 'DELETE',
			auth: true
		}),
	clearWishlist: () => 
		apiRequest<{ message: string }>('/api/wishlist/clear', {
			method: 'DELETE',
			auth: true
		}),
};

// Utility function to handle image URLs
export function getImageUrl(path: string): string {
  if (!path) return '/placeholder.svg';

  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's already an API image path, use it directly
  if (path.startsWith('/api/images/')) {
    return `${API_BASE_URL}${path}`;
  }

  // For all other paths (assets, uploads, etc.), serve from database via API
  // Extract filename from path
  const filename = path.split('/').pop() || path;
  return `${API_BASE_URL}/api/images/${filename}`;
}