import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Artisan from '../src/models/Artisan.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaymazone';

async function createArtisanProfile() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create or update artisan user
    const artisanUser = await User.findOneAndUpdate(
      { email: 'artisan@zaymazone.com' },
      {
        email: 'artisan@zaymazone.com',
        name: 'Master Craftsman',
        role: 'artisan',
        isActive: true,
        authProvider: 'firebase',
        isEmailVerified: true,
        phone: '+91 9876543210',
        avatar: '/assets/artisan-avatar-1.jpg',
        lastLogin: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('Artisan user created/updated:', artisanUser._id);

    // Create or update artisan profile
    const artisanProfile = await Artisan.findOneAndUpdate(
      { userId: artisanUser._id },
      {
        userId: artisanUser._id,
        name: 'Master Craftsman',
        bio: 'Experienced artisan specializing in traditional Indian handicrafts with over 15 years of experience.',
        location: {
          city: 'Jaipur',
          state: 'Rajasthan',
          country: 'India'
        },
        avatar: '/assets/artisan-avatar-1.jpg',
        coverImage: '/assets/artisan-1.jpg',
        specialties: ['Pottery', 'Metalwork', 'Textiles', 'Wood Carving'],
        experience: 15,
        rating: 4.8,
        totalRatings: 127,
        totalProducts: 0, // Will be updated when products are added
        totalSales: 50000,
        verification: {
          isVerified: true,
          verifiedAt: new Date()
        },
        isActive: true,
        joinedDate: new Date('2020-01-15'),
        socials: {
          instagram: 'https://instagram.com/mastercraftsman',
          facebook: 'https://facebook.com/mastercraftsman',
          website: 'https://mastercraftsman.com'
        }
      },
      { upsert: true, new: true }
    );

    console.log('Artisan profile created/updated:', artisanProfile._id);

    // Create sample products for the artisan
    const sampleProducts = [
      {
        name: 'Handcrafted Ceramic Bowl',
        description: 'Beautiful handmade ceramic bowl with traditional blue pottery design from Jaipur.',
        price: 1500,
        originalPrice: 2000,
        images: ['/assets/blue-pottery-set.jpg'],
        category: 'Pottery',
        subcategory: 'Bowls',
        materials: ['Ceramic', 'Natural Dyes'],
        dimensions: '15cm x 15cm x 8cm',
        weight: '400g',
        colors: ['Blue', 'White'],
        inStock: true,
        stockCount: 25,
        artisanId: artisanProfile._id,
        rating: 4.7,
        reviewCount: 23,
        tags: ['handmade', 'ceramic', 'blue pottery', 'traditional'],
        isHandmade: true,
        shippingTime: '3-5 days',
        featured: true,
        isActive: true
      },
      {
        name: 'Brass Traditional Lamp',
        description: 'Elegant brass lamp with intricate carved designs, perfect for traditional home decor.',
        price: 3500,
        originalPrice: 4500,
        images: ['/assets/metal-lamp.jpg'],
        category: 'Metalwork',
        subcategory: 'Lamps',
        materials: ['Brass', 'Cotton Wick'],
        dimensions: '20cm x 20cm x 30cm',
        weight: '1.2kg',
        colors: ['Golden', 'Bronze'],
        inStock: true,
        stockCount: 15,
        artisanId: artisanProfile._id,
        rating: 4.9,
        reviewCount: 18,
        tags: ['brass', 'lamp', 'traditional', 'home decor'],
        isHandmade: true,
        shippingTime: '5-7 days',
        featured: true,
        isActive: true
      },
      {
        name: 'Wooden Jewelry Box',
        description: 'Intricately carved wooden jewelry box with traditional Rajasthani motifs.',
        price: 2800,
        images: ['/assets/jewelry-box.jpg'],
        category: 'Wood Carving',
        subcategory: 'Boxes',
        materials: ['Sheesham Wood', 'Brass Fittings'],
        dimensions: '25cm x 18cm x 12cm',
        weight: '800g',
        colors: ['Brown', 'Natural Wood'],
        inStock: true,
        stockCount: 12,
        artisanId: artisanProfile._id,
        rating: 4.6,
        reviewCount: 15,
        tags: ['wooden', 'jewelry box', 'carving', 'storage'],
        isHandmade: true,
        shippingTime: '4-6 days',
        featured: false,
        isActive: true
      }
    ];

    // Create products
    for (const productData of sampleProducts) {
      await Product.findOneAndUpdate(
        { name: productData.name, artisanId: productData.artisanId },
        productData,
        { upsert: true, new: true }
      );
    }

    console.log('Sample products created for artisan');

    // Update artisan's total products count
    const productCount = await Product.countDocuments({ artisanId: artisanProfile._id, isActive: true });
    await Artisan.findByIdAndUpdate(artisanProfile._id, { totalProducts: productCount });

    // Create sample orders for the artisan
    const sampleOrders = [
      {
        orderNumber: 'ORD-2024-001',
        userId: new mongoose.Types.ObjectId(),
        items: [{
          productId: await Product.findOne({ name: 'Handcrafted Ceramic Bowl' })._id,
          name: 'Handcrafted Ceramic Bowl',
          price: 1500,
          quantity: 2,
          artisanId: artisanProfile._id,
          image: '/assets/blue-pottery-set.jpg'
        }],
        subtotal: 3000,
        shippingCost: 100,
        tax: 150,
        total: 3250,
        shippingAddress: {
          fullName: 'Priya Sharma',
          phone: '+91 9876543210',
          email: 'priya@example.com',
          addressLine1: '123 MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        status: 'delivered',
        statusHistory: [
          { status: 'placed', timestamp: new Date('2024-09-15'), note: 'Order placed' },
          { status: 'confirmed', timestamp: new Date('2024-09-16'), note: 'Order confirmed' },
          { status: 'shipped', timestamp: new Date('2024-09-18'), note: 'Order shipped' },
          { status: 'delivered', timestamp: new Date('2024-09-20'), note: 'Order delivered' }
        ],
        createdAt: new Date('2024-09-15')
      },
      {
        orderNumber: 'ORD-2024-002',
        userId: new mongoose.Types.ObjectId(),
        items: [{
          productId: await Product.findOne({ name: 'Brass Traditional Lamp' })._id,
          name: 'Brass Traditional Lamp',
          price: 3500,
          quantity: 1,
          artisanId: artisanProfile._id,
          image: '/assets/metal-lamp.jpg'
        }],
        subtotal: 3500,
        shippingCost: 150,
        tax: 175,
        total: 3825,
        shippingAddress: {
          fullName: 'Raj Kumar',
          phone: '+91 9123456789',
          email: 'raj@example.com',
          addressLine1: '456 Park Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'shipped',
        statusHistory: [
          { status: 'placed', timestamp: new Date('2024-10-01'), note: 'Order placed' },
          { status: 'confirmed', timestamp: new Date('2024-10-02'), note: 'Order confirmed' },
          { status: 'shipped', timestamp: new Date('2024-10-04'), note: 'Order shipped' }
        ],
        createdAt: new Date('2024-10-01')
      }
    ];

    // Create orders
    for (const orderData of sampleOrders) {
      await Order.findOneAndUpdate(
        { orderNumber: orderData.orderNumber },
        orderData,
        { upsert: true, new: true }
      );
    }

    console.log('Sample orders created for artisan');

    console.log('\n✅ Artisan profile setup complete!');
    console.log('\nArtisan Login Details:');
    console.log('Email: artisan@zaymazone.com');
    console.log('Password: Use Firebase Auth with this email');
    console.log('\nFirebase Setup Instructions:');
    console.log('1. Go to Firebase Console');
    console.log('2. Create a user with email: artisan@zaymazone.com');
    console.log('3. Set a password for the user');
    console.log('4. Sign in with these credentials on your frontend');

  } catch (error) {
    console.error('Error creating artisan profile:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createArtisanProfile();