# Firebase Testing Setup

## Manual User Creation Required

Since the Firebase service account key is not configured, you need to manually create the test user:

### 1. Create Firebase User
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Authentication > Users
4. Click "Add User"
5. Use these credentials:
   - **Email**: `kavya@artisan.com`
   - **Password**: `TestPass123!`
   - **UID**: Leave empty (Firebase will generate)

### 2. Test the Authentication Flow

#### Backend Status ✅
- Server running on http://localhost:4000  
- MongoDB connected with real artisan data
- Firebase authentication configured (no development bypass)
- Routes fixed (specific routes before generic /:id)

#### Test User in MongoDB ✅
- Real artisan profile created with ID: (check MongoDB)
- Sample products and orders generated
- Ready for Firebase user connection

### 3. Testing Steps

1. **Create Firebase User** (manual step above)
2. **Start Frontend**: Run the frontend server
3. **Login Test**: Use kavya@artisan.com / TestPass123!
4. **API Test**: Navigate to artisan dashboard to test API calls
5. **Route Test**: Check analytics, profile, and other artisan routes

### 4. Expected API Endpoints Working
- `GET /api/artisans/analytics` - Analytics dashboard
- `GET /api/artisans/profile` - Artisan profile  
- `GET /api/products/artisan/my-products` - Artisan's products
- `GET /api/orders/artisan/my-orders` - Artisan's orders

### 5. Troubleshooting
If authentication fails:
- Check browser network tab for 401 errors
- Verify Firebase token is being sent in Authorization header
- Check server logs for authentication errors

## Current Status
✅ Backend server running with real data
✅ Authentication bypass removed  
✅ Route conflicts fixed
⏳ Firebase user creation (manual step required)
⏳ Frontend integration testing