import axios from 'axios';

// Base API configuration
let API_BASE_URL: string;

try {
  API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  console.log('API configured with base URL:', API_BASE_URL);
} catch (error) {
  console.warn('Environment variable not found, using default API URL');
  API_BASE_URL = 'http://localhost:3001/api';
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  productPhotos: File[];
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
  // Seller registration
  async registerSeller(data: SellerFormData) {
    // First, handle all file uploads
    const uploadPromises = [];
    
    if (data.profilePhoto) {
      uploadPromises.push(
        uploadFile(data.profilePhoto, 'image')
          .then(res => ({ profilePhotoUrl: res.url }))
      );
    }
    
    if (data.gstCertificate) {
      uploadPromises.push(
        uploadFile(data.gstCertificate, 'document')
          .then(res => ({ gstCertificateUrl: res.url }))
      );
    }
    
    if (data.aadhaarProof) {
      uploadPromises.push(
        uploadFile(data.aadhaarProof, 'document')
          .then(res => ({ aadhaarProofUrl: res.url }))
      );
    }
    
    if (data.productPhotos.length > 0) {
      const productPhotoPromises = data.productPhotos.map(photo =>
        uploadFile(photo, 'image')
      );
      uploadPromises.push(
        Promise.all(productPhotoPromises)
          .then(results => ({ productPhotoUrls: results.map(r => r.url) }))
      );
    }
    
    if (data.craftVideo) {
      uploadPromises.push(
        uploadFile(data.craftVideo, 'video')
          .then(res => ({ craftVideoUrl: res.url }))
      );
    }

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    const fileUrls = Object.assign({}, ...uploadResults);

    // Prepare the final data object
    const finalData = {
      ...data,
      ...fileUrls,
      profilePhoto: undefined,
      gstCertificate: undefined,
      aadhaarProof: undefined,
      productPhotos: undefined,
      craftVideo: undefined,
    };

    // Send the registration request
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

  // Verify bank account
  async verifyBankAccount(ifsc: string, accountNumber: string) {
    const response = await fetch(`${API_BASE_URL}/verify/bank-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ifsc, accountNumber }),
    });
    return handleResponse(response);
  }
};