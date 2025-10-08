import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:4000/api/seller-onboarding';

// Create test form data
const form = new FormData();
form.append('businessName', 'Test Artisan Business');
form.append('ownerName', 'Test Owner');
form.append('email', 'test@example.com');
form.append('phone', '9876543210');
form.append('address', JSON.stringify({
  village: 'Test Village',
  district: 'Test District',
  state: 'Test State',
  pincode: '123456'
}));
form.append('yearsOfExperience', '5');
form.append('sellerType', 'non-gst');
form.append('aadhaarNumber', '123456789012');
form.append('panNumber', 'ABCDE1234F');
form.append('categories', JSON.stringify(['pottery', 'textiles']));
form.append('productDescription', 'Beautiful handmade pottery and textiles');
form.append('materials', 'Clay, cotton, silk');
form.append('priceRange', JSON.stringify({ min: '100', max: '5000' }));
form.append('stockQuantity', '50');
form.append('pickupAddress', JSON.stringify({ sameAsMain: true, address: '' }));
form.append('dispatchTime', '2-3 days');
form.append('packagingType', 'Eco-friendly packaging');
form.append('bankName', 'Test Bank');
form.append('accountNumber', '1234567890123456');
form.append('ifscCode', 'TEST0001234');
form.append('upiId', 'test@upi');
form.append('paymentFrequency', 'weekly');
form.append('story', 'A passionate artisan creating beautiful crafts for generations');

// Test the endpoint
async function testSellerOnboarding() {
  try {
    console.log('Testing seller onboarding endpoint...');

    const response = await fetch(API_URL, {
      method: 'POST',
      body: form,
      // Note: In a real test, you'd need to provide a valid Firebase token
      // headers: {
      //   'Authorization': 'Bearer <firebase-token>'
      // }
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSellerOnboarding();