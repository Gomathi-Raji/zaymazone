import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Share2, Star, MapPin, Truck, Shield, RotateCcw, ArrowLeft, ShoppingCart, ShoppingBag } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";
import { useEffect } from "react";
import SocialShare from "@/components/SocialShare";
import SEO from "@/components/SEO";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useProduct(id || '');
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  // Track product view - moved to top before any conditional returns
  useEffect(() => {
    if (product) {
      analytics.viewProduct({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price
      });
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    if (!product?.inStock || product?.stockCount === 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      // Track add to cart event
      analytics.addToCart({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price
      }, quantity);
    } catch (error) {
      // Error is already handled in the cart context
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase');
      navigate('/sign-in');
      return;
    }
    
    if (!product?.inStock || product?.stockCount === 0) {
      toast.error('This item is out of stock');
      return;
    }

    // Add to cart first, then redirect to checkout
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (error) {
      // Error is already handled in the cart context
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error ? 'Error loading product' : 'Product not found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'The product you\'re looking for doesn\'t exist.'}
          </p>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {product && (
        <SEO
          title={`${product.name} - Zaymazone`}
          description={product.description || `Buy authentic ${product.name} handcrafted by skilled artisans. ${product.category} from Zaymazone.`}
          keywords={`${product.name}, ${product.category}, handcrafted, artisan, ${product.tags?.join(', ') || ''}`}
          image={getImageUrl(product.images[0])}
          type="product"
          structuredData={{
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images.map(img => getImageUrl(img)),
            "brand": {
              "@type": "Brand",
              "name": "Zaymazone"
            },
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "INR",
              "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "Zaymazone"
              }
            },
            "aggregateRating": product.rating ? {
              "@type": "AggregateRating",
              "ratingValue": product.rating,
              "reviewCount": product.reviewCount || 0
            } : undefined
          }}
        />
      )}
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 mobile-product-detail">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 sm:mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="w-full">
            {/* Main Image */}
            <div className="aspect-square bg-card rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 max-w-full">
              <img
                src={getImageUrl(product.images[selectedImageIndex])}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 max-w-full overflow-hidden">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View ${product.name} image ${index + 1} of ${product.images.length}`}
                    className={`aspect-square rounded-md sm:rounded-lg overflow-hidden border-2 transition-colors max-w-full ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              {product.featured && (
                <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm">Featured</Badge>
              )}
              {product.isHandmade && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs sm:text-sm">
                  Handmade
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs sm:text-sm">{discountPercentage}% OFF</Badge>
              )}
            </div>

            {/* Title and Rating */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 leading-tight break-words">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-sm sm:text-base">{product.rating}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-4xl font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-lg sm:text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4 sm:mb-6">
              {product.inStock ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">In Stock</span>
                  {product.stockCount <= 5 && (
                    <span className="text-destructive">
                      Only {product.stockCount} left!
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity and Purchase Actions */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {/* Quantity Selector */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-input rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="px-2 sm:px-3 py-2 hover:bg-accent text-sm sm:text-base"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 sm:px-4 py-2 border-x border-input text-sm sm:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="px-2 sm:px-3 py-2 hover:bg-accent text-sm sm:text-base"
                    disabled={quantity >= product.stockCount}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-sm sm:text-base"
                  disabled={!product.inStock || cartLoading}
                  onClick={handleBuyNow}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {!product.inStock ? 'Out of Stock' : 'Buy Now'}
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-sm sm:text-base"
                    disabled={!product.inStock || cartLoading}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <SocialShare
                    title={`${product.name} - Zaymazone`}
                    description={product.description}
                    hashtags={["handcrafted", product.category.toLowerCase()]}
                    size="sm"
                    className="ml-2"
                  />
                </div>
              </div>
            </div>

            {/* Artisan Info */}
            {product.artisan && (
              <div className="bg-card rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Meet the Artisan</h3>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                    <AvatarImage src={product.artisan.avatar} />
                    <AvatarFallback>{product.artisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base break-words">{product.artisan.name}</h4>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="break-words">{product.artisan.location}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">{product.artisan.bio}</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span>{product.artisan.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {product.artisan.totalProducts} products
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span className="break-words">Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <RotateCcw className="w-4 h-4 text-primary shrink-0" />
                <span className="break-words">7-day return policy</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <span className="break-words">100% authentic handcrafted products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8 sm:mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="description" className="text-xs sm:text-sm px-2 py-2">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="text-xs sm:text-sm px-2 py-2">Specs</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs sm:text-sm px-2 py-2">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-4 sm:mt-6">
              <div className="prose max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                  {product.description}
                </p>
                
                <h4 className="font-semibold mt-4 sm:mt-6 mb-3 text-sm sm:text-base">Materials & Craftsmanship</h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
                  {product.materials.map((material, index) => (
                    <li key={index} className="break-words">{material}</li>
                  ))}
                </ul>

                <h4 className="font-semibold mt-4 sm:mt-6 mb-3 text-sm sm:text-base">Care Instructions</h4>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  Handle with care. Clean with a soft, dry cloth. Avoid exposure to direct sunlight for extended periods.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-4 sm:mt-6">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="min-w-0">
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Product Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between flex-wrap">
                      <dt className="text-xs sm:text-sm text-muted-foreground">Dimensions:</dt>
                      <dd className="text-xs sm:text-sm break-words">{product.dimensions}</dd>
                    </div>
                    <div className="flex justify-between flex-wrap">
                      <dt className="text-xs sm:text-sm text-muted-foreground">Weight:</dt>
                      <dd className="text-xs sm:text-sm break-words">{product.weight}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Materials:</dt>
                      <dd>{product.materials.join(", ")}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Colors:</dt>
                      <dd>{product.colors.join(", ")}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Shipping & Returns</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping Time:</dt>
                      <dd>{product.shippingTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Return Policy:</dt>
                      <dd>7 days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Warranty:</dt>
                      <dd>1 year</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-8 p-6 bg-card rounded-xl">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-1">{product.rating}</div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{product.reviewCount} reviews</div>
                  </div>
                  
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center gap-2 mb-1">
                        <span className="text-sm w-2">{rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 80 + 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {Math.floor(Math.random() * 50 + 5)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  {[
                    {
                      name: "Priya M.",
                      rating: 5,
                      date: "2 weeks ago",
                      comment: "Absolutely beautiful craftsmanship! The attention to detail is incredible and it arrived perfectly packaged.",
                      verified: true
                    },
                    {
                      name: "Rajesh K.",
                      rating: 4,
                      date: "1 month ago", 
                      comment: "Great quality product. Shipping was fast and the artisan's work is truly impressive.",
                      verified: true
                    },
                    {
                      name: "Sarah L.",
                      rating: 5,
                      date: "3 weeks ago",
                      comment: "This piece adds such character to my home. Love supporting traditional artisans!",
                      verified: false
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-border pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.name}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  Write a Review
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;