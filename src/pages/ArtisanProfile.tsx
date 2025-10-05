import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Star,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Edit,
  Save,
  X,
  Upload,
  Camera,
  Briefcase,
  GraduationCap,
  Heart,
  Globe
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface ArtisanProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  specialization: string[];
  experience: number;
  languages: string[];
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  businessInfo?: {
    businessName?: string;
    gstNumber?: string;
    panNumber?: string;
    bankDetails?: {
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
    };
  };
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
  skills: string[];
  workExperience: Array<{
    role: string;
    organization: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ArtisanProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    country: '',
    specialization: [] as string[],
    experience: '',
    languages: [] as string[],
    website: '',
    instagram: '',
    facebook: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    skills: [] as string[]
  });

  const loadProfile = useCallback(async () => {
    try {
      const response = await api.getArtisanProfile();
      setProfile(response);
      // Initialize form data
      if (response) {
        setFormData({
          name: response.name || '',
          phone: response.phone || '',
          bio: response.bio || '',
          city: response.location?.city || '',
          state: response.location?.state || '',
          country: response.location?.country || '',
          specialization: response.specialization || [],
          experience: response.experience?.toString() || '',
          languages: response.languages || [],
          website: response.socialLinks?.website || '',
          instagram: response.socialLinks?.instagram || '',
          facebook: response.socialLinks?.facebook || '',
          businessName: response.businessInfo?.businessName || '',
          gstNumber: response.businessInfo?.gstNumber || '',
          panNumber: response.businessInfo?.panNumber || '',
          skills: response.skills || []
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleSaveProfile = async () => {
    try {
      const updatedData = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        socialLinks: {
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook
        },
        businessInfo: {
          businessName: formData.businessName,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber
        }
      };

      await api.updateArtisanProfile(updatedData);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p>Loading your profile...</p>
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
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar} alt={profile?.name} />
              <AvatarFallback className="text-2xl">
                {profile?.name ? getInitials(profile.name) : 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{profile?.name || 'Artisan'}</h1>
              <p className="text-muted-foreground mb-2">{profile?.email}</p>
              {profile?.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location.city}, {profile.location.state}, {profile.location.country}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{profile?.stats?.totalProducts || 0}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{profile?.stats?.totalOrders || 0}</p>
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
                  <p className="text-2xl font-bold">{formatCurrency(profile?.stats?.totalRevenue || 0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{profile?.stats?.averageRating?.toFixed(1) || '0.0'}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                  <p className="text-2xl font-bold">{profile?.stats?.totalReviews || 0}</p>
                </div>
                <Eye className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          rows={3}
                          placeholder="Tell customers about yourself and your craft..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span>{profile?.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile?.bio && (
                        <div>
                          <p className="text-sm font-medium mb-2">Bio</p>
                          <p className="text-sm text-muted-foreground">{profile.bio}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Location & Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location & Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="languages">Languages (comma separated)</Label>
                        <Input
                          id="languages"
                          value={formData.languages.join(', ')}
                          onChange={(e) => setFormData({...formData, languages: e.target.value.split(',').map(l => l.trim()).filter(l => l)})}
                          placeholder="English, Hindi, Gujarati"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {profile?.location && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <span>{profile.location.city}, {profile.location.state}, {profile.location.country}</span>
                        </div>
                      )}
                      {profile?.experience && (
                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-muted-foreground" />
                          <span>{profile.experience} years of experience</span>
                        </div>
                      )}
                      {profile?.languages && profile.languages.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Languages</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.languages.map((lang, index) => (
                              <Badge key={index} variant="secondary">{lang}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Specializations & Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations & Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Specializations</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['textiles', 'pottery', 'jewelry', 'metalwork', 'woodwork', 'painting', 'weaving', 'embroidery'].map(spec => (
                          <Badge
                            key={spec}
                            variant={formData.specialization.includes(spec) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const newSpecs = formData.specialization.includes(spec)
                                ? formData.specialization.filter(s => s !== spec)
                                : [...formData.specialization, spec];
                              setFormData({...formData, specialization: newSpecs});
                            }}
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="skills">Skills (comma separated)</Label>
                      <Input
                        id="skills"
                        value={formData.skills.join(', ')}
                        onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        placeholder="block printing, natural dyes, hand weaving"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.specialization && profile.specialization.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.specialization.map((spec, index) => (
                            <Badge key={index} variant="default">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile?.skills && profile.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        placeholder="Your business or brand name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          value={formData.gstNumber}
                          onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input
                          id="panNumber"
                          value={formData.panNumber}
                          onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                          placeholder="AAAAA0000A"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {profile?.businessInfo?.businessName && (
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                        <span>{profile.businessInfo.businessName}</span>
                      </div>
                    )}
                    {profile?.businessInfo?.gstNumber && (
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-muted-foreground" />
                        <span>GST: {profile.businessInfo.gstNumber}</span>
                      </div>
                    )}
                    {profile?.businessInfo?.panNumber && (
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-muted-foreground" />
                        <span>PAN: {profile.businessInfo.panNumber}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.workExperience && profile.workExperience.length > 0 ? (
                    <div className="space-y-4">
                      {profile.workExperience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-orange-200 pl-4">
                          <h4 className="font-medium">{exp.role}</h4>
                          <p className="text-sm text-muted-foreground">{exp.organization}</p>
                          <p className="text-xs text-muted-foreground">{exp.duration}</p>
                          <p className="text-sm mt-2">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No work experience added yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.education && profile.education.length > 0 ? (
                    <div className="space-y-4">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground">{edu.year}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No education details added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.certifications && profile.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <p className="text-xs text-muted-foreground">{cert.year}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No certifications added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Social Links & Online Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        placeholder="@yourhandle or https://instagram.com/yourhandle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profile?.socialLinks?.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.socialLinks.website}
                        </a>
                      </div>
                    )}
                    {profile?.socialLinks?.instagram && (
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-muted-foreground" />
                        <a href={profile.socialLinks.instagram.startsWith('http') ? profile.socialLinks.instagram : `https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.socialLinks.instagram}
                        </a>
                      </div>
                    )}
                    {profile?.socialLinks?.facebook && (
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.socialLinks.facebook}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanProfile;