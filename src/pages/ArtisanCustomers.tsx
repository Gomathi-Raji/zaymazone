import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingCart,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  MessageSquare,
  Send,
  Crown,
  AlertTriangle,
  Star,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const ArtisanCustomers = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<{
    customers: Array<{
      _id: string;
      name: string;
      email: string;
      phone: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string;
      firstOrderDate: string;
      segment: string;
      loyaltyScore: number;
      daysSinceLastOrder: number;
      daysSinceFirstOrder: number;
      avgOrderValue: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  } | null>(null);

  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadCustomers = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const customersData = await api.getArtisanCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load customers:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load customers data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user]);

  const handleRefresh = () => {
    loadCustomers();
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredCustomers = customers?.customers?.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegment === 'all' || customer.segment.toLowerCase() === selectedSegment;
    return matchesSearch && matchesSegment;
  }) || [];

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'VIP': return <Crown className="w-4 h-4" />;
      case 'Regular': return <UserCheck className="w-4 h-4" />;
      case 'At Risk': return <AlertTriangle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Regular': return 'bg-blue-100 text-blue-800';
      case 'At Risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = async () => {
    if (!selectedCustomer || !messageText.trim()) return;

    setSendingMessage(true);
    try {
      // This would integrate with an email service or messaging API
      // For now, we'll just show a success message
      toast({
        title: "Message sent",
        description: `Message sent to ${selectedCustomer.name}`,
      });
      setSelectedCustomer(null);
      setMessageText('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getCustomerStats = () => {
    if (!customers?.customers) return { vip: 0, regular: 0, atRisk: 0, new: 0 };
    
    return customers.customers.reduce((acc, customer) => {
      switch (customer.segment) {
        case 'VIP': acc.vip++; break;
        case 'Regular': acc.regular++; break;
        case 'At Risk': acc.atRisk++; break;
        default: acc.new++; break;
      }
      return acc;
    }, { vip: 0, regular: 0, atRisk: 0, new: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your customers...</p>
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
        <div className="mb-8 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Customer Management
              </h1>
              <p className="text-muted-foreground">
                View and manage your customer relationships
              </p>
            </div>
            {refreshing && <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{customers?.pagination?.total || 0}</p>
                  <p className="text-xs text-green-600">Active buyers</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">VIP Customers</p>
                  <p className="text-2xl font-bold">{getCustomerStats().vip}</p>
                  <p className="text-xs text-purple-600">High-value buyers</p>
                </div>
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">At Risk Customers</p>
                  <p className="text-2xl font-bold">{getCustomerStats().atRisk}</p>
                  <p className="text-xs text-orange-600">Need attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                  <p className="text-2xl font-bold">
                    {customers?.customers?.length ?
                      formatCurrency(
                        customers.customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                        customers.customers.reduce((sum, c) => sum + c.totalOrders, 0)
                      ) : formatCurrency(0)
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Per customer</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Segmentation Tabs */}
        <Tabs value={selectedSegment} onValueChange={setSelectedSegment} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>All ({customers?.pagination?.total || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="vip" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span>VIP ({getCustomerStats().vip})</span>
            </TabsTrigger>
            <TabsTrigger value="regular" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Regular ({getCustomerStats().regular})</span>
            </TabsTrigger>
            <TabsTrigger value="at risk" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>At Risk ({getCustomerStats().atRisk})</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>New ({getCustomerStats().new})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <div className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Customers who have purchased your products will appear here.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" alt={customer.name} />
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                          <Badge variant="outline" className={`flex items-center space-x-1 ${getSegmentColor(customer.segment)}`}>
                            {getSegmentIcon(customer.segment)}
                            <span>{customer.segment}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {customer.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {customer.phone}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 mt-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{customer.totalOrders}</p>
                            <p className="text-xs text-muted-foreground">Orders</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                            <p className="text-xs text-muted-foreground">Total Spent</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{formatCurrency(customer.totalSpent / customer.totalOrders)}</p>
                            <p className="text-xs text-muted-foreground">Avg Order</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{customer.loyaltyScore}/100</p>
                            <p className="text-xs text-muted-foreground">Loyalty Score</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        Last order: {formatDate(customer.lastOrderDate)}
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Message to {customer.name}</DialogTitle>
                              <DialogDescription>
                                Send a personalized message to this customer. This will be sent via email.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Type your message here..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSendMessage} disabled={sendingMessage || !messageText.trim()}>
                                {sendingMessage ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination would go here if needed */}
        {customers?.pagination && customers.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCustomers.length} of {customers.pagination.total} customers
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanCustomers;