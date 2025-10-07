import { useState } from 'react';
import { SellerFormData } from '@/services/api';

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation(formData: SellerFormData) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.phone) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
          newErrors.phone = 'Enter a valid Indian mobile number';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Enter a valid email address';
        }
        if (!formData.address.village) newErrors.village = 'Village/Town is required';
        if (!formData.address.district) newErrors.district = 'District is required';
        if (!formData.address.state) newErrors.state = 'State is required';
        if (!formData.address.pincode) {
          newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.address.pincode)) {
          newErrors.pincode = 'Enter a valid 6-digit pincode';
        }
        break;

      case 2:
        if (!formData.sellerType) newErrors.sellerType = 'Please select a seller type';
        if (formData.sellerType === 'gst') {
          if (!formData.gstNumber) {
            newErrors.gstNumber = 'GST number is required';
          } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber)) {
            newErrors.gstNumber = 'Enter a valid GST number';
          }
          if (!formData.gstCertificate) newErrors.gstCertificate = 'GST certificate is required';
        }
        if (formData.sellerType === 'non-gst') {
          if (!formData.aadhaarNumber) {
            newErrors.aadhaarNumber = 'Aadhaar number is required';
          } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
            newErrors.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number';
          }
          if (!formData.aadhaarProof) newErrors.aadhaarProof = 'Aadhaar proof is required';
        }
        if (!formData.panNumber) {
          newErrors.panNumber = 'PAN number is required';
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
          newErrors.panNumber = 'Enter a valid PAN number';
        }
        break;

      case 3:
        if (formData.categories.length === 0) newErrors.categories = 'Select at least one category';
        if (!formData.productDescription) newErrors.productDescription = 'Product description is required';
        if (!formData.priceRange.min) newErrors.minPrice = 'Minimum price is required';
        if (!formData.priceRange.max) newErrors.maxPrice = 'Maximum price is required';
        if (Number(formData.priceRange.min) > Number(formData.priceRange.max)) {
          newErrors.priceRange = 'Minimum price cannot be greater than maximum price';
        }
        if (!formData.stockQuantity) newErrors.stockQuantity = 'Stock quantity is required';
        if (formData.productPhotos.length === 0) newErrors.productPhotos = 'Upload at least one product photo';
        break;

      case 4:
        if (!formData.pickupAddress.sameAsMain && !formData.pickupAddress.address) {
          newErrors.pickupAddress = 'Pickup address is required';
        }
        if (!formData.dispatchTime) newErrors.dispatchTime = 'Select dispatch time';
        if (!formData.packagingType) newErrors.packagingType = 'Select packaging type';
        break;

      case 5:
        if (!formData.bankName) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber) {
          newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
          newErrors.accountNumber = 'Enter a valid account number';
        }
        if (!formData.ifscCode) {
          newErrors.ifscCode = 'IFSC code is required';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
          newErrors.ifscCode = 'Enter a valid IFSC code';
        }
        if (!formData.paymentFrequency) newErrors.paymentFrequency = 'Select payment frequency';
        break;

      case 6:
        // Story is optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateStep };
}