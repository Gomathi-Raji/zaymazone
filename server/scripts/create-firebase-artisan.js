import admin from 'firebase-admin';
import 'dotenv/config';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function createFirebaseArtisanUser() {
  try {
    console.log('Creating Firebase user for artisan...');

    // Check if user already exists
    let user;
    try {
      user = await admin.auth().getUserByEmail('artisan@zaymazone.com');
      console.log('Firebase user already exists:', user.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await admin.auth().createUser({
          email: 'artisan@zaymazone.com',
          password: 'ArtisanPass123!',
          displayName: 'Master Craftsman',
          emailVerified: true,
          disabled: false
        });
        console.log('Firebase user created:', user.uid);
      } else {
        throw error;
      }
    }

    // Set custom claims for artisan role
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'artisan',
      artisanVerified: true
    });

    console.log('Custom claims set for artisan role');

    console.log('\n✅ Firebase artisan user setup complete!');
    console.log('\nLogin Credentials:');
    console.log('Email: artisan@zaymazone.com');
    console.log('Password: ArtisanPass123!');
    console.log('Role: artisan');
    console.log('\nYou can now sign in to the frontend with these credentials.');

  } catch (error) {
    console.error('Error creating Firebase artisan user:', error);
    
    if (error.code === 'auth/project-not-found') {
      console.log('\n⚠️  Firebase project not configured properly.');
      console.log('Please check your Firebase environment variables:');
      console.log('- FIREBASE_PROJECT_ID');
      console.log('- FIREBASE_PRIVATE_KEY');
      console.log('- FIREBASE_CLIENT_EMAIL');
    }
  }
}

createFirebaseArtisanUser();