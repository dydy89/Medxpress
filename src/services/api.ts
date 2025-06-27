import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:8080';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Enhanced logging for order creation requests
  if (config.url?.includes('/api/patient/orders') && config.method === 'post') {
    console.log("🚀 INTERCEPTOR - Order Request Debug:");
    console.log("- URL:", config.url);
    console.log("- Method:", config.method);
    console.log("- Headers:", config.headers);
    console.log("- Data being sent:", config.data);
    console.log("- Full config:", config);
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt');
      localStorage.removeItem('id');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Type definitions based on the API documentation
export interface Doctor {
  id: number;
  name: string | null;
  firstName: string | null;
  email: string;
  rpps: string | null;
}

export interface Medication {
  id: number;
  name: string;
}

export interface PrescriptionResponse {
  id: number;
  status: string; // "ACTIVE"
  date: string; // "2025-06-25" format
  doctor: Doctor;
  medications: Medication[];
  hasOrder: boolean;
  orderId: number | null;
  orderStatus: string | null; // "Pending", "Delivered", etc.
}

// User interface based on the actual database structure
export interface User {
  id: number;
  email: string;
  firstName: string; // first_name in DB
  name: string; // name in DB (last name)
  role: 'PATIENT' | 'ADMIN' | 'DOCTOR' | 'PHARMACIST';
}

// Pharmacist-specific interfaces
export interface PharmacistDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  dispatchedOrders: number;
}

export interface PharmacistOrderPatient {
  email: string;
  firstName: string;
}

export interface PharmacistOrderMedicament {
  nom: string;
}

export interface PharmacistOrderPrescription {
  id: number;
  doctor: {
    email: string;
  };
  medicaments: PharmacistOrderMedicament[];
}

export interface PharmacistOrderPharmacy {
  name: string;
  address: string;
}

export interface PharmacistOrder {
  id: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED';
  date: string;
  code: string;
  patient: PharmacistOrderPatient;
  prescription: PharmacistOrderPrescription;
  pharmacy: PharmacistOrderPharmacy;
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED';
}

export interface CreateOrderRequest {
  prescriptionId: number;
  patientId: number; // Actually userId where role = "PATIENT"
}

export class ApiError extends Error {
  status: number;
  
  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// API Service Functions
export const prescriptionService = {
  // Fetch enhanced prescriptions for a patient
  // Note: patientId is actually userId where user.role = "PATIENT"
  getEnhancedPrescriptions: async (userId: number): Promise<PrescriptionResponse[]> => {
    try {
      const response: AxiosResponse<PrescriptionResponse[]> = await api.get(
        `/api/patient/prescriptions/enhanced?patientId=${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch prescriptions',
        status: error.response?.status || 500,
      });
    }
  },

  // Create an order for a prescription
  // Note: patientId is actually userId where user.role = "PATIENT"
  // KNOWN ISSUE: POST /api/patient/orders returns 403 Forbidden (backend security config issue)
  createOrder: async (prescriptionId: number, userId: number): Promise<any> => {
    try {
      const requestData = {
        prescriptionId,
        patientId: userId, // Backend expects patientId but we pass userId
        // Adding optional fields that backend might expect
        deliveryDriverId: 1, // Default delivery driver
        pharmacyId: 1 // Default pharmacy
      };
      
      // Get current token for debugging
      const token = localStorage.getItem('jwt');
      
      console.log("🔍 API createOrder ENHANCED DEBUG:");
      console.log("- Endpoint: POST /api/patient/orders");
      console.log("- Request data:", requestData);
      console.log("- Full URL:", `${BASE_URL}/api/patient/orders`);
      console.log("- Token exists:", !!token);
      console.log("- Token length:", token?.length || 0);
      console.log("- Token preview:", token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log("- Request headers will include:");
      console.log("  - Authorization: Bearer [token]");
      console.log("  - Content-Type: application/json");
      
      // Make the request
      console.log("📤 Making API request...");
      const response = await api.post('/api/patient/orders', requestData);
      
      console.log("✅ Order creation successful:");
      console.log("- Response status:", response.status);
      console.log("- Response data:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ API createOrder ENHANCED ERROR DEBUG:");
      console.error("- Error type:", error.constructor.name);
      console.error("- Status:", error.response?.status);
      console.error("- Status text:", error.response?.statusText);
      console.error("- Response headers:", error.response?.headers);
      console.error("- Response data:", error.response?.data);
      console.error("- Request config:", {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      });
      console.error("- Full error object:", error);
      
      // Check if it's the known 403 backend configuration issue
      if (error.response?.status === 403) {
        console.error("🚨 KNOWN BACKEND ISSUE: POST /api/patient/orders is blocked by security config");
        console.error("- This is documented in apis.md as a non-working endpoint");
        console.error("- Frontend authentication is working correctly");
        console.error("- The backend Spring Security needs to be updated to allow this endpoint");
        
        // Provide a more user-friendly error message for the known issue
        throw new ApiError({
          message: 'Order creation is temporarily unavailable due to a backend configuration issue. Your authentication is working correctly. Please contact the development team to enable the /api/patient/orders endpoint.',
          status: 403,
        });
      }
      
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to create order',
        status: error.response?.status || 500,
      });
    }
  },
};

// User service to get current user info from user table
// Pharmacist service for all pharmacist-related API calls
export const pharmacistService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<PharmacistDashboardStats> => {
    try {
      const response = await api.get('/api/pharmacist/dashboard/stats');
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch dashboard stats',
        status: error.response?.status || 500,
      });
    }
  },

  // Get all orders (optionally filtered by status)
  getOrders: async (status?: string): Promise<PharmacistOrder[]> => {
    try {
      const url = status ? `/api/pharmacist/orders?status=${status}` : '/api/pharmacist/orders';
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch orders',
        status: error.response?.status || 500,
      });
    }
  },

  // Get specific order details
  getOrderDetails: async (orderId: number): Promise<PharmacistOrder> => {
    try {
      const response = await api.get(`/api/pharmacist/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch order details',
        status: error.response?.status || 500,
      });
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED'): Promise<any> => {
    try {
      const response = await api.put(`/api/pharmacist/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to update order status',
        status: error.response?.status || 500,
      });
    }
  },

  // Get prescription details
  getPrescriptionDetails: async (prescriptionId: number): Promise<any> => {
    try {
      const response = await api.get(`/api/pharmacist/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch prescription details',
        status: error.response?.status || 500,
      });
    }
  },

  // Get pharmacist profile
  getPharmacistProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/api/pharmacist/profile');
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch pharmacist profile',
        status: error.response?.status || 500,
      });
    }
  },
};

export const userService = {
  getCurrentUser: async (userId: number): Promise<User> => {
    try {
      const response = await api.get(`/api/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new ApiError({
        message: error.response?.data?.message || 'Failed to fetch user info',
        status: error.response?.status || 500,
      });
    }
  },

  // Validate user has PATIENT role
  validatePatientRole: async (userId: number): Promise<boolean> => {
    try {
      const user = await userService.getCurrentUser(userId);
      return user.role === 'PATIENT';
    } catch (error: any) {
      return false;
    }
  },
};

export default api; 