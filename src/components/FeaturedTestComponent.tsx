import React from 'react';

// Simple test component to verify that featured products section is rendering
export const FeaturedTestComponent = () => {
  return (
    <section className="py-8 md:py-16 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Handcrafts Test
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            This is a test to see if the section renders
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Test cards */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="aspect-square bg-gray-200 rounded mb-4 flex items-center justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Test product" 
                className="w-full h-full object-cover rounded"
              />
            </div>
            <h3 className="font-semibold mb-2">Test Product 1</h3>
            <p className="text-gray-600 mb-2">₹1,000</p>
            <button className="w-full bg-blue-500 text-white py-2 rounded">
              Test Button
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="aspect-square bg-gray-200 rounded mb-4 flex items-center justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Test product" 
                className="w-full h-full object-cover rounded"
              />
            </div>
            <h3 className="font-semibold mb-2">Test Product 2</h3>
            <p className="text-gray-600 mb-2">₹2,000</p>
            <button className="w-full bg-blue-500 text-white py-2 rounded">
              Test Button
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="aspect-square bg-gray-200 rounded mb-4 flex items-center justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Test product" 
                className="w-full h-full object-cover rounded"
              />
            </div>
            <h3 className="font-semibold mb-2">Test Product 3</h3>
            <p className="text-gray-600 mb-2">₹3,000</p>
            <button className="w-full bg-blue-500 text-white py-2 rounded">
              Test Button
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};