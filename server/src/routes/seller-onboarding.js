import express from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Artisan from '../models/Artisan.js';
import { authenticateToken } from '../middleware/firebase-auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'seller-onboarding');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Seller onboarding validation schema
const sellerOnboardingSchema = z.object({
  // Basic Info
  businessName: z.string().min(1).max(200),
  ownerName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  address: z.object({
    village: z.string().optional(),
    district: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits')
  }),

  // Experience & Type
  yearsOfExperience: z.string().regex(/^\d+$/, 'Years of experience must be a number'),
  sellerType: z.enum(['gst', 'non-gst']),
  gstNumber: z.string().optional(),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),

  // Product Details
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  productDescription: z.string().min(10).max(1000),
  materials: z.string().min(1).max(500),
  priceRange: z.object({
    min: z.string().regex(/^\d+$/, 'Min price must be a number'),
    max: z.string().regex(/^\d+$/, 'Max price must be a number')
  }),
  stockQuantity: z.string().regex(/^\d+$/, 'Stock quantity must be a number'),

  // Logistics
  pickupAddress: z.object({
    sameAsMain: z.boolean(),
    address: z.string().optional()
  }),
  dispatchTime: z.string().min(1),
  packagingType: z.string().min(1),

  // Bank Details
  bankName: z.string().min(1).max(100),
  accountNumber: z.string().regex(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  upiId: z.string().optional(),
  paymentFrequency: z.string().min(1),

  // Story
  story: z.string().max(2000).optional()
});

/**
 * POST /api/seller-onboarding
 * Complete seller onboarding with file uploads
 */
router.post('/', authenticateToken, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'productPhotos', maxCount: 10 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'aadhaarProof', maxCount: 1 },
  { name: 'craftVideo', maxCount: 1 }
]), async (req, res) => {
  try {
    // Parse form data
    const formData = {
      ...req.body,
      address: JSON.parse(req.body.address || '{}'),
      priceRange: JSON.parse(req.body.priceRange || '{}'),
      pickupAddress: JSON.parse(req.body.pickupAddress || '{}'),
      categories: req.body.categories ? (Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories]) : []
    };

    // Validate form data
    const validationResult = sellerOnboardingSchema.safeParse(formData);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const data = validationResult.data;
    const userId = req.user._id;

    // Handle file uploads
    const uploadedFiles = req.files;
    const fileUrls = {
      profilePhoto: null,
      productPhotos: [],
      gstCertificate: null,
      aadhaarProof: null,
      craftVideo: null
    };

    // Process uploaded files
    if (uploadedFiles.profilePhoto?.[0]) {
      fileUrls.profilePhoto = `/uploads/seller-onboarding/${uploadedFiles.profilePhoto[0].filename}`;
    }

    if (uploadedFiles.productPhotos) {
      fileUrls.productPhotos = uploadedFiles.productPhotos.map(file =>
        `/uploads/seller-onboarding/${file.filename}`
      );
    }

    if (uploadedFiles.gstCertificate?.[0]) {
      fileUrls.gstCertificate = `/uploads/seller-onboarding/${uploadedFiles.gstCertificate[0].filename}`;
    }

    if (uploadedFiles.aadhaarProof?.[0]) {
      fileUrls.aadhaarProof = `/uploads/seller-onboarding/${uploadedFiles.aadhaarProof[0].filename}`;
    }

    if (uploadedFiles.craftVideo?.[0]) {
      fileUrls.craftVideo = `/uploads/seller-onboarding/${uploadedFiles.craftVideo[0].filename}`;
    }

    // Check if artisan already exists
    let artisan = await Artisan.findOne({ userId });

    const artisanData = {
      userId,
      name: data.ownerName,
      bio: data.story || '',
      location: {
        city: data.address.district,
        state: data.address.state,
        country: 'India'
      },
      avatar: fileUrls.profilePhoto,
      specialties: data.categories,
      experience: parseInt(data.yearsOfExperience),
      socials: {},
      verification: {
        isVerified: true, // Mark as verified since all validations passed
        documentType: 'aadhar', // Default to aadhaar
        documentNumber: data.aadhaarNumber,
        bankDetails: {
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          bankName: data.bankName
        },
        verifiedAt: new Date()
      },
      // Additional seller-specific data
      businessInfo: {
        businessName: data.businessName,
        sellerType: data.sellerType,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        contact: {
          email: data.email,
          phone: data.phone,
          address: data.address
        }
      },
      productInfo: {
        description: data.productDescription,
        materials: data.materials,
        priceRange: {
          min: parseInt(data.priceRange.min),
          max: parseInt(data.priceRange.max)
        },
        stockQuantity: parseInt(data.stockQuantity),
        photos: fileUrls.productPhotos
      },
      logistics: {
        pickupAddress: data.pickupAddress,
        dispatchTime: data.dispatchTime,
        packagingType: data.packagingType
      },
      documents: {
        gstCertificate: fileUrls.gstCertificate,
        aadhaarProof: fileUrls.aadhaarProof,
        craftVideo: fileUrls.craftVideo
      },
      payment: {
        upiId: data.upiId,
        paymentFrequency: data.paymentFrequency
      }
    };

    if (!artisan) {
      // Create new artisan
      artisan = new Artisan(artisanData);
    } else {
      // Update existing artisan
      Object.assign(artisan, artisanData);
    }

    await artisan.save();

    res.json({
      success: true,
      message: 'Seller onboarding completed successfully',
      artisan: {
        id: artisan._id,
        name: artisan.name,
        isVerified: artisan.verification.isVerified,
        businessName: artisan.businessInfo.businessName,
        files: fileUrls
      }
    });

  } catch (error) {
    console.error('Seller onboarding error:', error);

    // Clean up uploaded files on error
    if (req.files) {
      const uploadedFiles = req.files;
      Object.values(uploadedFiles).forEach(files => {
        files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        });
      });
    }

    res.status(500).json({
      error: 'Failed to complete seller onboarding'
    });
  }
});

export default router;