import { apiRequest } from '@/lib/api';

// Base API configuration
let API_BASE_URL: string;

try {
  API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zaymazone-backend.onrender.com';
  console.log('API configured with base URL:', API_BASE_URL);
} catch (error) {
  console.warn('Environment variable not found, using default API URL');
  API_BASE_URL = 'https://zaymazone-backend.onrender.com';
}

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
}

// Helper function to handle file uploads
async function uploadFile(file: File, type: 'document' | 'image' | 'video') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

export interface SellerFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: {
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  yearsOfExperience: string;
  profilePhoto: File | null;
  productPhotos: File[];
  sellerType: string;
  gstNumber: string;
  gstCertificate: File | null;
  aadhaarNumber: string;
  aadhaarProof: File | null;
  panNumber: string;
  categories: string[];
  productDescription: string;
  materials: string;
  priceRange: {
    min: string;
    max: string;
  };
  stockQuantity: string;
  pickupAddress: {
    sameAsMain: boolean;
    address: string;
  };
  dispatchTime: string;
  packagingType: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  paymentFrequency: string;
  story: string;
  craftVideo: File | null;
}

export const sellerApi = {
  // Complete seller onboarding with file uploads
  async completeOnboarding(formData: SellerFormData) {
    const data = new FormData();
    
    // Add basic fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'address' || key === 'priceRange' || key === 'pickupAddress') {
        data.append(key, JSON.stringify(value));
      } else if (key === 'profilePhoto' || key === 'gstCertificate' || key === 'aadhaarProof' || key === 'craftVideo') {
        if (value) data.append(key, value);
      } else if (key === 'productPhotos') {
        if (Array.isArray(value)) {
          value.forEach((file, index) => {
            data.append(`productPhotos`, file);
          });
        }
      } else if (key === 'categories') {
        if (Array.isArray(value)) {
          value.forEach(cat => data.append('categories', cat));
        }
      } else {
        data.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/seller-onboarding`, {
      method: 'POST',
      body: data,
    });

    return handleResponse(response);
  },

  // Register seller (legacy - kept for compatibility)
  async registerSeller(formData: SellerFormData) {
    const data = new FormData();
    
    // Add basic fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'address' || key === 'priceRange' || key === 'pickupAddress') {
        data.append(key, JSON.stringify(value));
      } else if (key === 'profilePhoto' || key === 'gstCertificate' || key === 'aadhaarProof' || key === 'craftVideo') {
        if (value) data.append(key, value);
      } else if (key === 'productPhotos') {
        if (Array.isArray(value)) {
          value.forEach((file, index) => {
            data.append(`productPhotos`, file);
          });
        }
      } else if (key === 'categories') {
        if (Array.isArray(value)) {
          value.forEach(cat => data.append('categories', cat));
        }
      } else {
        data.append(key, String(value));
      }
    });

    const finalData = {
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      yearsOfExperience: formData.yearsOfExperience,
      sellerType: formData.sellerType,
      gstNumber: formData.gstNumber,
      aadhaarNumber: formData.aadhaarNumber,
      panNumber: formData.panNumber,
      categories: formData.categories,
      productDescription: formData.productDescription,
      materials: formData.materials,
      priceRange: formData.priceRange,
      stockQuantity: formData.stockQuantity,
      pickupAddress: formData.pickupAddress,
      dispatchTime: formData.dispatchTime,
      packagingType: formData.packagingType,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      upiId: formData.upiId,
      paymentFrequency: formData.paymentFrequency,
      story: formData.story
    };

    const response = await fetch(`${API_BASE_URL}/sellers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalData),
    });

    return handleResponse(response);
  },

  // Verify GST number
  async verifyGST(gstNumber: string) {
    const response = await fetch(`${API_BASE_URL}/verify/gst/${gstNumber}`);
    return handleResponse(response);
  },

  // Verify bank account and save form
  async verifyBankAccount(formData: SellerFormData) {
    return apiRequest('/api/verify/bank-account', {
      method: 'POST',
      body: {
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
        name: formData.ownerName || formData.businessName,
        bio: formData.story || '',
        location: {
          city: formData.address.district || formData.address.village,
          state: formData.address.state,
          country: 'India'
        },
        specialties: formData.categories || [],
        experience: parseInt(formData.yearsOfExperience) || 0,
        socials: {},
        documentType: formData.aadhaarNumber ? 'aadhar' : 'pan',
        documentNumber: formData.aadhaarNumber || formData.panNumber,
        email: formData.email
      }
    });
  }
};