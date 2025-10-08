import express from 'express';
import { z } from 'zod';
import Artisan from '../models/Artisan.js';
import User from '../models/User.js';

const router = express.Router();

// Bank account verification schema (simplified - just regex validation)
const bankVerificationSchema = z.object({
  accountNumber: z.string().regex(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bankName: z.string().min(1).max(100),
  // Additional form fields for seller onboarding
  name: z.string().min(1).max(200),
  bio: z.string().max(1000).optional(),
  location: z.object({
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().default('India')
  }),
  specialties: z.array(z.string()).optional(),
  experience: z.number().min(0).optional(),
  socials: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    website: z.string().url().optional()
  }).optional(),
  documentType: z.enum(['aadhar', 'pan', 'license']),
  documentNumber: z.string().min(1),
  email: z.string().email().optional() // Add email for user lookup/creation
});

/**
 * POST /api/verify/bank-account
 * Validate bank account format and store seller onboarding form
 */
router.post('/bank-account', async (req, res) => {
  try {
    const validationResult = bankVerificationSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const {
      accountNumber,
      ifscCode,
      bankName,
      name,
      bio,
      location,
      specialties,
      experience,
      socials,
      documentType,
      documentNumber,
      email
    } = validationResult.data;

    // Find or create user based on email
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        // Create a new user account
        user = new User({
          email,
          name: name || email.split('@')[0],
          authProvider: 'form',
          isEmailVerified: false, // Mark as unverified since no password/email verification
          lastLogin: new Date()
        });
        await user.save();
      }
    } else if (req.user) {
      // Use authenticated user if available
      user = req.user;
    } else {
      return res.status(400).json({
        error: 'Email is required for form submission'
      });
    }

    const userId = user._id;

    // Check if artisan already exists
    let artisan = await Artisan.findOne({ userId });

    if (!artisan) {
      // Create new artisan
      artisan = new Artisan({
        userId,
        name,
        bio: bio || '',
        location,
        specialties: specialties || [],
        experience: experience || 0,
        socials: socials || {},
        verification: {
          isVerified: true, // Mark as verified since regex validation passed
          documentType,
          documentNumber,
          bankDetails: {
            accountNumber,
            ifscCode,
            bankName
          },
          verifiedAt: new Date()
        }
      });
    } else {
      // Update existing artisan
      artisan.name = name;
      if (bio !== undefined) artisan.bio = bio;
      if (location) artisan.location = location;
      if (specialties) artisan.specialties = specialties;
      if (experience !== undefined) artisan.experience = experience;
      if (socials) artisan.socials = socials;

      artisan.verification = {
        ...artisan.verification,
        isVerified: true, // Mark as verified since regex validation passed
        documentType,
        documentNumber,
        bankDetails: {
          accountNumber,
          ifscCode,
          bankName
        },
        verifiedAt: new Date()
      };
    }

    await artisan.save();

    res.json({
      success: true,
      message: 'Form validated and stored successfully',
      artisan: {
        id: artisan._id,
        name: artisan.name,
        isVerified: artisan.verification.isVerified
      }
    });

  } catch (error) {
    console.error('Form storage error:', error);
    res.status(500).json({
      error: 'Failed to validate and store form'
    });
  }
});

export default router;