import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Filter } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductComparison } from "@/components/ProductComparison";
import { ComparisonFloatingButton } from "@/components/ComparisonFloatingButton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductComparison } from "@/hooks/useProductComparison";
import { useProducts } from "@/hooks/useProducts";
import { sortOptions } from "@/data/products";
import { Product } from "@/lib/api";

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [handmadeFilter, setHandmadeFilter] = useState(false);

  const {
    comparisonProducts,
    isComparisonOpen,
    addToComparison,
    removeFromComparison,
    clearComparison,
    openComparison,
    closeComparison,
    comparisonCount
  } = useProductComparison();

  // Fetch products from API
  const { data: productsData, isLoading, error } = useProducts({
    limit: 100, // Get a reasonable amount for client-side filtering
  });

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData?.products) return [];
    
    const filtered = productsData.products.filter(product => {
      // Search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(product.artisan?.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }
      
      // Price filter
      if (priceFilter !== "all") {
        if (priceFilter === "under-1000" && product.price >= 1000) return false;
        if (priceFilter === "1000-5000" && (product.price < 1000 || product.price > 5000)) return false;
        if (priceFilter === "5000-10000" && (product.price < 5000 || product.price > 10000)) return false;
        if (priceFilter === "above-10000" && product.price <= 10000) return false;
      }
      
      // Handmade filter
      if (handmadeFilter && !product.isHandmade) {
        return false;
      }
      
      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "newest":
        default:
          return 0; // Keep original order for newest
      }
    });

    return filtered;
  }, [productsData?.products, searchQuery, sortBy, categoryFilter, priceFilter, handmadeFilter]);

  const handleQuickView = (product: Product) => {
    // TODO: Implement quick view modal
    console.log("Quick view:", product);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Shop Artisan Crafts
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover authentic handcrafted treasures from skilled artisans across India
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products, artisans, or materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pottery">Pottery</SelectItem>
              <SelectItem value="textiles">Textiles</SelectItem>
              <SelectItem value="crafts">Crafts</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-1000">Under ₹1,000</SelectItem>
              <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
              <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
              <SelectItem value="above-10000">Above ₹10,000</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAndSortedProducts.length} of {productsData?.pagination?.total || 0} products
            {searchQuery && (
              <span> for "<span className="font-medium">{searchQuery}</span>"</span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-foreground mb-2">Error loading products</h3>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error ? error.message : 'Failed to load products'}
              </p>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {filteredAndSortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                  onAddToComparison={addToComparison}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Comparison Components */}
      <ComparisonFloatingButton
        count={comparisonCount}
        onOpen={openComparison}
        onClear={clearComparison}
      />

      <ProductComparison
        products={comparisonProducts}
        isOpen={isComparisonOpen}
        onClose={closeComparison}
        onRemoveProduct={removeFromComparison}
      />

      <Footer />
    </div>
  );
};

export default Shop;