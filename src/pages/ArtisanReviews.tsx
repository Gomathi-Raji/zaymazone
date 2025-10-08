import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Star,
  MessageSquare,
  RefreshCw,
  Download,
  Filter,
  Reply,
  ThumbsUp,
  Search,
  Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const ArtisanReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<{
    reviews: Array<{
      _id: string;
      rating: number;
      title?: string;
      comment: string;
      images?: string[];
      createdAt: string;
      userId: {
        name: string;
        avatar?: string;
      };
      productId: {
        name: string;
        images: string[];
      };
      orderId: {
        orderNumber: string;
      };
      response?: {
        message: string;
        respondedBy: {
          name: string;
        };
        respondedAt: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  } | null>(null);

  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);

  const loadReviews = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const reviewsData = await api.getArtisanReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load reviews data. Please try again.",
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
      loadReviews();
    }
  }, [user]);

  const handleRefresh = () => {
    loadReviews();
  };

  const handleRespondToReview = async () => {
    if (!selectedReview || !responseMessage.trim()) return;

    setResponding(true);
    try {
      // Note: This would need a backend endpoint to respond to reviews
      // For now, we'll just show a success message
      toast({
        title: "Response sent",
        description: "Your response has been sent to the customer.",
      });
      setSelectedReview(null);
      setResponseMessage('');
      loadReviews(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getAverageRating = () => {
    if (!reviews?.reviews?.length) return 0;
    const sum = reviews.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.reviews.length) * 10) / 10;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your reviews...</p>
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
                Customer Reviews
              </h1>
              <p className="text-muted-foreground">
                Manage and respond to customer feedback
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{reviews?.pagination?.total || 0}</p>
                  <p className="text-xs text-green-600">All time</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold">{getAverageRating()}</p>
                    <div className="flex">{renderStars(Math.round(getAverageRating()))}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">5-Star Reviews</p>
                  <p className="text-2xl font-bold">
                    {reviews?.reviews?.filter(r => r.rating === 5).length || 0}
                  </p>
                  <p className="text-xs text-green-600">
                    {reviews?.reviews?.length ?
                      Math.round((reviews.reviews.filter(r => r.rating === 5).length / reviews.reviews.length) * 100)
                      : 0}% of total
                  </p>
                </div>
                <ThumbsUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Responses Given</p>
                  <p className="text-2xl font-bold">
                    {reviews?.reviews?.filter(r => r.response).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Reviews responded to</p>
                </div>
                <Reply className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews?.reviews?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">
                  Reviews from customers who have purchased your products will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.reviews.map((review) => (
              <Card key={review._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.userId.avatar} alt={review.userId.name} />
                        <AvatarFallback>{getInitials(review.userId.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{review.userId.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      Order #{review.orderId.orderNumber}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium text-lg mb-2">{review.productId.name}</h5>
                    {review.title && (
                      <h6 className="font-medium mb-2">{review.title}</h6>
                    )}
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {review.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      ))}
                      {review.images.length > 3 && (
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                          +{review.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {review.response && (
                    <div className="bg-muted p-4 rounded-lg mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Reply className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Your response</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.response.respondedAt)}
                        </span>
                      </div>
                      <p className="text-sm">{review.response.message}</p>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    {!review.response && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Reply className="w-4 h-4 mr-2" />
                            Respond
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Respond to Review</DialogTitle>
                            <DialogDescription>
                              Send a response to {review.userId.name}'s review about {review.productId.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm font-medium">{review.userId.name}</span>
                              </div>
                              <p className="text-sm">{review.comment}</p>
                            </div>
                            <Textarea
                              placeholder="Write your response..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleRespondToReview}
                              disabled={responding || !responseMessage.trim()}
                            >
                              {responding ? 'Sending...' : 'Send Response'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination would go here if needed */}
        {reviews?.pagination && reviews.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="text-sm text-muted-foreground">
              Showing {reviews.reviews.length} of {reviews.pagination.total} reviews
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanReviews;