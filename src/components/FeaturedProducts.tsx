import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useProductComparison } from "@/hooks/useProductComparison";

export const FeaturedProducts = () => {
  const { addToComparison } = useProductComparison();
  
  // Get products from API - show first 6 as featured since backend doesn't support featured filtering
  const { data: productsData, isLoading, error } = useProducts({ limit: 6 });
  let featuredProducts = productsData?.products || [];

  // Debug - log the state
  console.log('Featured Products State:', { isLoading, error, count: featuredProducts.length, productsData });

  // Temporary fallback for debugging - if no products loaded, use mock data
  if (!isLoading && featuredProducts.length === 0) {
    console.warn('No products loaded, using mock data for testing');
    featuredProducts = [
      {
        id: "1",
        name: "Handwoven Silk Scarf",
        description: "Beautiful handwoven silk scarf",
        price: 2500,
        originalPrice: 3000,
        images: ["/assets/silk-scarf.jpg"],
        rating: 4.5,
        reviewCount: 24,
        inStock: true,
        stockCount: 10,
        category: "Textiles",
        subcategory: "Scarves",
        materials: ["Silk"],
        dimensions: "180cm x 45cm x 0.1cm",
        weight: "0.2kg",
        colors: ["Red", "Blue", "Green"],
        artisan: { 
          id: "1",
          name: "Priya Kumar", 
          location: "Varanasi, India",
          bio: "Master weaver with 20 years experience",
          avatar: "/assets/artisan-avatar-1.jpg",
          rating: 4.8,
          totalProducts: 25
        },
        tags: ["handwoven", "silk", "traditional"],
        isHandmade: true,
        shippingTime: "5-7 days",
        featured: true
      },
      {
        id: "2", 
        name: "Blue Pottery Vase",
        description: "Traditional blue pottery vase",
        price: 1800,
        originalPrice: 2200,
        images: ["/assets/blue-pottery-set.jpg"],
        rating: 4.3,
        reviewCount: 18,
        inStock: true,
        stockCount: 5,
        category: "Pottery",
        subcategory: "Vases",
        materials: ["Clay", "Glaze"],
        dimensions: "15cm x 15cm x 25cm",
        weight: "1.2kg",
        colors: ["Blue", "White"],
        artisan: { 
          id: "2",
          name: "Rajesh Mehra", 
          location: "Jaipur, India",
          bio: "Traditional pottery artisan",
          avatar: "/assets/artisan-avatar-2.jpg",
          rating: 4.6,
          totalProducts: 18
        },
        tags: ["pottery", "traditional", "blue"],
        isHandmade: true,
        shippingTime: "3-5 days",
        featured: true
      },
      {
        id: "3",
        name: "Brass Decorative Bowl",
        description: "Handcrafted brass decorative bowl",
        price: 1200,
        originalPrice: 1500,
        images: ["/assets/brass-bowl.jpg"],
        rating: 4.7,
        reviewCount: 32,
        inStock: true,
        stockCount: 8,
        category: "Metal Craft",
        subcategory: "Decorative",
        materials: ["Brass"],
        dimensions: "20cm x 20cm x 8cm",
        weight: "0.8kg",
        colors: ["Gold", "Brass"],
        artisan: { 
          id: "3",
          name: "Anita Sharma", 
          location: "Moradabad, India",
          bio: "Expert in metal craft",
          avatar: "/assets/artisan-avatar-3.jpg",
          rating: 4.9,
          totalProducts: 40
        },
        tags: ["brass", "decorative", "metal"],
        isHandmade: true,
        shippingTime: "4-6 days",
        featured: true
      }
    ];
  }

  return (
    <section className="py-8 md:py-16 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Handcrafts
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Discover our carefully curated collection of exceptional artisan pieces
          </p>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12 mobile-featured-grid">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading featured products...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-500">Error loading products: {error?.message || 'Unknown error'}</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No featured products available.</p>
              <p className="text-xs text-muted-foreground mt-2">Debug: Check console for more info</p>
            </div>
          ) : (
            featuredProducts.map((product, index) => (
              <div key={product.id} className="w-full">
                <ProductCard
                  product={product}
                  onAddToComparison={addToComparison}
                />
              </div>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            className="btn-hero"
            asChild
          >
            <Link to="/shop">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};