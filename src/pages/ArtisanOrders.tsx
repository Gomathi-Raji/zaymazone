import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { Order } from '@/lib/api';

interface ArtisanOrder {
  _id: string;
  orderNumber: string;
  items: Array<{
    productId: {
      _id: string;
      name: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const ArtisanOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const response = await api.getArtisanOrders();
      setOrders(response);
    } catch (error) {
      console.error('Failed to load orders:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
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
      loadOrders();
      // Set up real-time polling every 30 seconds
      const interval = setInterval(() => {
        loadOrders(true); // Silent refresh
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadOrders]);

  const handleRefresh = () => {
    loadOrders();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      packed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      shipped: 'bg-orange-100 text-orange-800 border-orange-200',
      out_for_delivery: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      returned: 'bg-gray-100 text-gray-800 border-gray-200',
      refunded: 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      packed: Package,
      shipped: Truck,
      out_for_delivery: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      returned: AlertCircle,
      refunded: DollarSign,
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'placed').length,
      processing: orders.filter(o => ['confirmed', 'processing', 'packed'].includes(o.status)).length,
      shipped: orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => ['cancelled', 'returned', 'refunded'].includes(o.status)).length,
      totalRevenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your orders...</p>
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
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders and track their fulfillment
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Processing</p>
                  <p className="text-xl font-bold">{stats.processing}</p>
                </div>
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Shipped</p>
                  <p className="text-xl font-bold">{stats.shipped}</p>
                </div>
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Delivered</p>
                  <p className="text-xl font-bold">{stats.delivered}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here once customers purchase your products'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{order.orderNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress.fullName} • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                        <Badge className={`mt-1 ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order._id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirm</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="packed">Packed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                {selectedOrder?.orderNumber} - {selectedOrder && formatDate(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress.email}</p>
                      </div>
                      <div>
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.shippingAddress.street}<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(item.quantity * item.price)}</p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Amount</span>
                          <span className="text-xl font-bold">{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(value) => handleUpdateOrderStatus(selectedOrder._id, value)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirm Order</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="packed">Packed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanOrders;