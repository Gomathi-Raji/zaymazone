  import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Star,
  Plus,
  DollarSign,
  Eye,
  MessageSquare,
  RefreshCw,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { Order, Product } from '@/lib/api';

const ArtisanDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<{
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Array<{ _id: string; count: number }>;
    monthlyRevenue: Array<{ _id: { year: number; month: number }; revenue: number; orders: number }>;
    topProducts: Array<{ _id: string; name: string; totalSold: number; revenue: number }>;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const loadArtisanData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const [analyticsData, ordersData, productsData] = await Promise.all([
        api.getArtisanAnalytics(),
        api.getArtisanOrders(),
        api.getArtisanProducts()
      ]);

      setAnalytics(analyticsData);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load artisan data:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      loadArtisanData();
      // Set up real-time polling every 30 seconds
      const interval = setInterval(() => {
        loadArtisanData(true); // Silent refresh
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadArtisanData]);

  const handleRefresh = () => {
    loadArtisanData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      packed: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
      refunded: 'bg-pink-100 text-pink-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome, {user?.name || 'Artisan'}!
              </h1>
              <p className="text-muted-foreground">
                Manage your craft business and connect with customers
              </p>
            </div>
            {refreshing && <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/artisan/products/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-xs text-green-600">
                    {products.filter(p => p.inStock).length} in stock
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
                  <p className="text-xs text-green-600">
                    {orders.filter(o => o.status === 'delivered').length} delivered
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics?.totalRevenue || 0)}</p>
                  <p className="text-xs text-green-600">
                    {analytics?.monthlyRevenue?.length ? '+12% this month' : 'No data yet'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">
                    {products.reduce((sum, p) => sum + (p.reviewCount || 0), 0)}
                  </p>
                  <p className="text-xs text-green-600">
                    {products.length > 0 ? 'Across all products' : 'No products yet'}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'My Products',
                  description: 'Manage your product listings',
                  icon: Package,
                  href: '/artisan/products',
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50 dark:bg-blue-900/10',
                  count: products.length
                },
                {
                  title: 'Orders',
                  description: 'View and manage customer orders',
                  icon: ShoppingCart,
                  href: '/artisan/orders',
                  color: 'text-green-600',
                  bgColor: 'bg-green-50 dark:bg-green-900/10',
                  count: analytics?.totalOrders || 0
                },
                {
                  title: 'Analytics',
                  description: 'Track your sales performance',
                  icon: BarChart3,
                  href: '/artisan/analytics',
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50 dark:bg-purple-900/10',
                  count: null
                },
                {
                  title: 'Customers',
                  description: 'View your customer base',
                  icon: Users,
                  href: '/artisan/customers',
                  color: 'text-indigo-600',
                  bgColor: 'bg-indigo-50 dark:bg-indigo-900/10',
                  count: new Set(orders.map(o => o.shippingAddress.email)).size
                },
                {
                  title: 'Reviews',
                  description: 'Manage product reviews',
                  icon: Star,
                  href: '/artisan/reviews',
                  color: 'text-yellow-600',
                  bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
                  count: null
                },
                {
                  title: 'Messages',
                  description: 'Customer inquiries and support',
                  icon: MessageSquare,
                  href: '/artisan/messages',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-50 dark:bg-orange-900/10',
                  count: null
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} to={item.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full ${item.bgColor}`}>
                              <Icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {item.description}
                              </CardDescription>
                            </div>
                          </div>
                          {item.count !== null && (
                            <Badge variant="secondary">{item.count}</Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.map(item => `${item.name} × ${item.quantity}`).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.shippingAddress.fullName} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.total)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Link to="/artisan/orders">
                    <Button variant="outline" className="w-full">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Products</CardTitle>
                <CardDescription>Manage your product listings</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No products yet</p>
                    <Link to="/artisan/products/new">
                      <Button>Add Your First Product</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((product) => (
                      <Card key={product._id} className="overflow-hidden">
                        <div className="aspect-square bg-muted">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant={product.inStock ? "default" : "secondary"}>
                              {product.inStock ? `${product.stockCount} in stock` : 'Out of stock'}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {product.reviewCount || 0} reviews
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Link to="/artisan/products">
                    <Button variant="outline" className="w-full">
                      Manage All Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.monthlyRevenue?.length ? (
                    <div className="space-y-4">
                      {analytics.monthlyRevenue.slice(-6).map((month) => (
                        <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between">
                          <span className="text-sm">
                            {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                          <div className="text-right">
                            <span className="font-medium">{formatCurrency(month.revenue)}</span>
                            <span className="text-xs text-muted-foreground ml-2">({month.orders} orders)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No revenue data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Your best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.topProducts?.length ? (
                    <div className="space-y-4">
                      {analytics.topProducts.slice(0, 5).map((product, index) => (
                        <div key={product._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                            <span className="text-sm truncate max-w-[200px]">{product.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{formatCurrency(product.revenue)}</span>
                            <span className="text-xs text-muted-foreground ml-2">({product.totalSold} sold)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No sales data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-2">Grow Your Business</h3>
                  <p className="opacity-90 mb-4">
                    Add more products, engage with customers, and boost your sales
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link to="/artisan/products/new">
                    <Button variant="secondary">
                      Add Product
                    </Button>
                  </Link>
                  <Link to="/artisan/analytics">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanDashboard;