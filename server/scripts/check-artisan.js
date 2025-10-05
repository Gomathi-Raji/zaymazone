import 'dotenv/config'
import mongoose from 'mongoose'
import Artisan from '../src/models/Artisan.js'
import User from '../src/models/User.js'

async function checkArtisan() {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zaymazone'
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')
  
  try {
    const artisan = await Artisan.findOne({}).populate('userId')
    if (artisan) {
      console.log('✅ Artisan found:')
      console.log('ID:', artisan._id.toString())
      console.log('Email:', artisan.userId?.email || 'No user linked')
      console.log('Business Name:', artisan.businessName)
      console.log('Location:', artisan.location)
      console.log('Firebase UID needed:', artisan.userId?.firebaseUid || 'Not set')
    } else {
      console.log('❌ No artisan found')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
  process.exit(0)
}

checkArtisan()