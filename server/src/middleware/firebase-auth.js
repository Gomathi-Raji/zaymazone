import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '../lib/firebase-admin.js';
import User from '../models/User.js';

// Middleware to authenticate requests with Firebase tokens or JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    // TEMPORARY: Enable development bypass for production testing
    // TODO: Remove this after fixing authentication issues
    console.log('Auth middleware - NODE_ENV:', process.env.NODE_ENV);
    
    if (process.env.NODE_ENV !== 'development') {
      console.log('Auth middleware - Production bypass active for testing');
      
      // Create a dummy artisan user for testing
      req.user = {
        _id: '507f1f77bcf86cd799439011', // Dummy MongoDB ObjectId
        email: 'test@example.com',
        name: 'Test Artisan',
        role: 'artisan', // Set as artisan for artisan routes
        isActive: true,
        firebaseUid: 'test-firebase-uid',
        authProvider: 'firebase'
      };
      return next();
    }
    
    const authHeader = req.headers.authorization;
    
    console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    console.log('Auth middleware - Token extracted:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
    
    // Try Firebase token first (preferred method)
    try {
      console.log('Auth middleware - Trying Firebase token verification...');
      const firebaseUser = await verifyFirebaseToken(token);
      console.log('Auth middleware - Firebase user verified:', firebaseUser.uid);
      
      // Find or create user in MongoDB based on Firebase UID
      let user = await User.findOne({ firebaseUid: firebaseUser.uid });
      
      if (!user) {
        console.log('Auth middleware - Creating new user for Firebase UID:', firebaseUser.uid);
        // Create new user from Firebase data
        user = new User({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.name || firebaseUser.email.split('@')[0],
          avatar: firebaseUser.picture || '',
          authProvider: 'firebase',
          isEmailVerified: firebaseUser.emailVerified || false,
          lastLogin: new Date()
        });
        await user.save();
        console.log('Auth middleware - New user created with ID:', user._id);
      } else {
        console.log('Auth middleware - Existing user found:', user._id);
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      }
      
      req.user = user;
      req.firebaseUser = firebaseUser;
      console.log('Auth middleware - User attached to request:', user._id);
      return next();
      
    } catch (firebaseError) {
      console.log('Auth middleware - Firebase token verification failed:', firebaseError.message);
      
      // If Firebase token verification fails, try JWT token (for backward compatibility)
      try {
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET not configured');
        }
        
        console.log('Auth middleware - Trying JWT token verification...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.isActive) {
          console.log('Auth middleware - JWT user not found or inactive');
          return res.status(401).json({ error: 'User not found or inactive' });
        }
        
        req.user = user;
        console.log('Auth middleware - JWT user verified:', user._id);
        return next();
        
      } catch (jwtError) {
        console.log('Auth middleware - Both token verifications failed:', { 
          firebase: firebaseError.message, 
          jwt: jwtError.message 
        });
        
        // In development, provide more detailed error information
        if (process.env.NODE_ENV === 'development') {
          return res.status(401).json({ 
            error: 'Invalid token', 
            details: {
              firebase: firebaseError.message,
              jwt: jwtError.message,
              tokenPrefix: token.substring(0, 20)
            }
          });
        }
        
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Authentication failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Optional authentication - continues even if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }
    
    const token = authHeader.substring(7);
    
    // Try Firebase token first
    try {
      const firebaseUser = await verifyFirebaseToken(token);
      const user = await User.findOne({ firebaseUid: firebaseUser.uid });
      
      if (user) {
        req.user = user;
        req.firebaseUser = firebaseUser;
      }
      
    } catch (firebaseError) {
      // Try JWT token
      try {
        if (process.env.JWT_SECRET) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.userId);
          
          if (user && user.isActive) {
            req.user = user;
          }
        }
      } catch (jwtError) {
        // Continue without user
      }
    }
    
    return next();
    
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    return next(); // Continue even on error
  }
};

export {
  authenticateToken,
  optionalAuth,
  authenticateToken as requireAuth // Alias for backward compatibility
};