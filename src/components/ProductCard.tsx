import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, MapPin, BarChart3, ShoppingCart, ShoppingBag, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/api";
import { getImageUrl } from "@/lib/api";
import { QuickViewDialog } from "./QuickViewDialog";
import { LazyImage } from "./LazyImage";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToComparison?: (product: Product) => void;
}

export const ProductCard = ({ product, onQuickView, onAddToComparison }: ProductCardProps) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, isLoading: wishlistLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Safely check if product is in wishlist with error handling
  const inWishlist = useMemo(() => {
    try {
      return isInWishlist(product.id);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  }, [isInWishlist, product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    if (product.stockCount === 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      await addToCart(product.id, 1);

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      toast.success('Added to cart successfully!');
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
    
    if (product.stockCount === 0) {
      toast.error('This item is out of stock');
      return;
    }

    // Navigate directly to checkout with product info (bypass cart)
    navigate('/checkout', { 
      state: { 
        directPurchase: true, 
        product: product, 
        quantity: 1 
      } 
    });
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to manage wishlist');
      return;
    }
    
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      // Error is already handled in the wishlist context
    }
  };
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 w-full min-w-0 mobile-product-card"
      whileHover={{ y: -2, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Desktop - Link to product page */}
        <Link to={`/product/${product.id}`} className="hidden md:block">
          <LazyImage
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover object-center cursor-pointer"
          />
        </Link>

        {/* Mobile - Touchable image */}
        <div
          className="md:hidden relative cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setShowMobileActions(!showMobileActions);
          }}
        >
          <LazyImage
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {/* Touch hint */}
          {!showMobileActions && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              Tap for actions
            </div>
          )}
        </div>
        
        {/* Desktop overlay - Hidden on mobile */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="hidden md:flex absolute inset-0 bg-black/20 items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button 
                size="sm"
                onClick={() => setIsQuickViewOpen(true)}
                className="bg-white text-foreground hover:bg-white/90 border border-white/20 shadow-soft"
              >
                Quick View
              </Button>
              {onAddToComparison && (
                <Button 
                  size="sm"
                  onClick={() => onAddToComparison(product)}
                  className="bg-white/90 text-foreground hover:bg-white border border-white/20 shadow-soft"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Compare
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Action Panel - Appears on touch */}
        <AnimatePresence>
          {showMobileActions && (
            <motion.div
              className="md:hidden absolute inset-0 bg-transparent flex items-center justify-end pr-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowMobileActions(false)}
            >
              <motion.div
                className="flex flex-col gap-2 p-1 rounded-lg"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Wishlist */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-12 w-12 rounded-full hover:scale-105 transition-transform ${
                    inWishlist ? 'text-red-500' : 'text-gray-100/90'
                  }`}
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full hover:scale-105 transition-transform text-gray-100/90"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || cartLoading || product.stockCount === 0}
                  title="Add to Cart"
                >
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <ShoppingCart className={`w-5 h-5 ${cartLoading ? 'animate-pulse' : ''}`} />
                    )}
                  </AnimatePresence>
                </Button>

                {/* Quick View */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full hover:scale-105 transition-transform text-gray-100/90"
                  onClick={() => {
                    setIsQuickViewOpen(true);
                    setShowMobileActions(false);
                  }}
                  title="Quick View"
                >
                  <Eye className="w-5 h-5" />
                </Button>

                {/* Compare */}
                {onAddToComparison && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full hover:scale-105 transition-transform text-gray-100/90"
                    onClick={() => {
                      onAddToComparison(product);
                      setShowMobileActions(false);
                    }}
                    title="Compare"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive">{discountPercentage}% OFF</Badge>
          )}
          {product.isHandmade && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Handmade
            </Badge>
          )}
        </div>

        {/* Desktop action buttons - Hidden on mobile */}
        <div className="hidden md:flex absolute top-3 right-3 flex-col gap-2">
          {/* Wishlist button */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={isHovered ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`bg-white/80 hover:bg-white rounded-full hover:scale-110 transition-all duration-300 ${
                inWishlist ? 'text-red-500' : ''
              }`}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              disabled={wishlistLoading}
              onClick={handleWishlistToggle}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
          </motion.div>

          {/* Add to cart icon button */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={isHovered ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 hover:bg-white rounded-full hover:scale-110 transition-all duration-300"
              disabled={!product.inStock || cartLoading || product.stockCount === 0}
              onClick={handleAddToCart}
              title="Add to Cart"
            >
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="cart"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ShoppingCart className={`w-4 h-4 ${cartLoading ? 'animate-pulse' : ''}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>



      {/* Product Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between mb-1">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors cursor-pointer text-xs sm:text-sm leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Artisan Info */}
        {product.artisan && (
          <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate text-xs">{product.artisan.name}</span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <span className="text-sm font-bold text-foreground">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Primary Action Button - Always Buy Now */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="sm"
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-xs py-2"
            disabled={!product.inStock || cartLoading || product.stockCount === 0}
            onClick={handleBuyNow}
          >
            <ShoppingBag className="w-3 h-3 mr-1" />
            {!product.inStock || product.stockCount === 0 ? 'Out of Stock' : 'Buy Now'}
          </Button>
        </motion.div>

        {/* Stock info */}
        {product.inStock && product.stockCount <= 5 && product.stockCount > 0 && (
          <p className="text-xs text-destructive mt-2 text-center">
            Only {product.stockCount} left in stock!
          </p>
        )}
      </div>
      
      <QuickViewDialog 
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </motion.div>
  );
};