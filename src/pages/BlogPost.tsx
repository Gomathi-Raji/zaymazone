import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useParams, Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  BookmarkPlus,
  Twitter,
  Facebook,
  Linkedin
} from "lucide-react";

// Blog images and author avatars are now served from API
import { getImageUrl } from "@/lib/api";
import SEO from "@/components/SEO";

const BlogPost = () => {
  const { id } = useParams();

  // Create blog data mapping
  const blogData = {
    1: {
      id: 1,
      title: "The Art of Blue Pottery: A Journey Through Rajasthan's Most Prized Craft",
      content: `
        <p>Blue pottery, with its distinctive cobalt blue and white aesthetic, has been a cornerstone of Rajasthani craftsmanship for over 400 years. This unique art form, which finds its origins in Persian traditions, has evolved into one of India's most recognizable and cherished crafts.</p>

        <h2>Origins and History</h2>
        <p>The technique was introduced to India during the Mughal period, around the 14th century, by Persian artisans who settled in various parts of the Indian subcontinent. Jaipur, in particular, became a thriving center for this craft due to the patronage of the royal family and the availability of skilled artisans.</p>

        <p>What makes blue pottery truly unique is its composition. Unlike traditional pottery, blue pottery is made from a mixture of quartz powder, fuller's earth, borax, gum, and water. This combination creates a non-porous material that doesn't require a bisque firing, making it distinct from conventional ceramic techniques.</p>

        <h2>The Making Process</h2>
        <p>The creation of blue pottery is a meticulous process that requires years of training and exceptional skill. The process begins with preparing the clay mixture, which is kneaded thoroughly to achieve the right consistency. The artisan then shapes the piece on a potter's wheel or by hand, depending on the intended design.</p>

        <p>Once shaped, the piece is left to dry completely before the intricate painting begins. Using natural pigments, artisans paint delicate patterns that often include floral motifs, geometric designs, and sometimes animal figures. The most traditional colors are cobalt blue and copper green on a white base.</p>

        <h2>Modern Revival</h2>
        <p>In recent decades, blue pottery has experienced a remarkable revival. Contemporary artisans are experimenting with new forms while maintaining traditional techniques. From traditional vases and plates to modern lamp bases and bathroom fittings, blue pottery has found its way into contemporary homes worldwide.</p>

        <p>This revival has also brought much-needed economic support to artisan communities in Rajasthan. Government initiatives and private organizations have established training centers and provided market access, helping preserve this ancient craft for future generations.</p>

        <h2>Supporting the Craft</h2>
        <p>When you purchase authentic blue pottery, you're not just acquiring a beautiful piece of art – you're supporting a community of skilled artisans who have dedicated their lives to preserving this traditional craft. Each piece represents hours of careful work and generations of inherited knowledge.</p>

        <p>As consumers become more conscious of the origin and impact of their purchases, traditional crafts like blue pottery offer a meaningful alternative to mass-produced goods. They represent sustainability, cultural preservation, and direct support for artisan communities.</p>
      `,
      author: {
        name: "Priya Sharma",
        avatar: getImageUrl('author-priya.jpg'),
        role: "Craft Historian",
        bio: "Priya is a cultural researcher and craft historian with over 15 years of experience documenting traditional Indian arts. She has authored several books on Indian craftsmanship and regularly contributes to cultural publications."
      },
      category: "Traditional Crafts",
      date: "Jan 15, 2024",
      readTime: "8 min read",
      image: getImageUrl('blog-blue-pottery.jpg'),
      likes: 247,
      comments: 18,
      tags: ["blue pottery", "rajasthan", "traditional crafts", "ceramics", "artisans"]
    },
    2: {
      id: 2,
      title: "Preserving Handloom Traditions: The Weavers of Bengal",
      content: `
        <p>In the villages of West Bengal, the rhythmic sound of handlooms continues to echo through narrow lanes, carrying forward a tradition that spans centuries. The master weavers of Bengal represent one of India's most treasured textile traditions.</p>

        <h2>The Heritage of Bengali Handloom</h2>
        <p>Bengali handloom weaving has deep historical roots, with references dating back to ancient texts. The region has been renowned for producing some of the finest cotton and silk textiles, including the legendary muslin that was once prized across the world.</p>

        <h2>Traditional Techniques</h2>
        <p>The weaving process remains unchanged from generations past. Using traditional pit looms and throw shuttles, weavers create intricate patterns through careful manipulation of warp and weft threads. Each piece tells a story through its motifs and color combinations.</p>

        <h2>Challenges and Revival</h2>
        <p>While facing competition from power looms, Bengali handloom weavers are finding new markets through direct connections with conscious consumers and designers who value authentic craftsmanship.</p>
      `,
      author: {
        name: "Rajesh Kumar",
        avatar: getImageUrl('author-rajesh.jpg'),
        role: "Cultural Researcher",
        bio: "Rajesh is a cultural anthropologist specializing in Indian textile traditions. He has spent over a decade documenting weaving communities across Bengal and eastern India."
      },
      category: "Textiles",
      date: "Jan 12, 2024",
      readTime: "6 min read",
      image: getImageUrl('blog-handloom.jpg'),
      likes: 189,
      comments: 12,
      tags: ["handloom", "bengal", "textiles", "weaving", "heritage"]
    },
    3: {
      id: 3,
      title: "The Revival of Dhokra Art: Metal Casting in Modern Times",
      content: `
        <p>Dhokra, the ancient art of metal casting using the lost-wax technique, has been practiced in India for over 4000 years. This non-ferrous metal casting technique produces beautiful brass sculptures that are finding new appreciation in contemporary times.</p>

        <h2>Ancient Techniques, Timeless Appeal</h2>
        <p>The Dhokra technique involves creating a clay model, covering it with wax, and then applying another layer of clay. When heated, the wax melts away, leaving a hollow space for molten brass to be poured.</p>

        <h2>Modern Renaissance</h2>
        <p>Contemporary artists and collectors are rediscovering Dhokra art, leading to a renaissance of this ancient craft. Modern pieces combine traditional techniques with contemporary aesthetics.</p>
      `,
      author: {
        name: "Meera Devi",
        avatar: getImageUrl('author-meera.jpg'),
        role: "Art Curator",
        bio: "Meera is a contemporary art curator with expertise in traditional Indian metal crafts. She has curated several exhibitions on tribal and folk art forms."
      },
      category: "Metal Crafts",
      date: "Jan 10, 2024",
      readTime: "5 min read",
      image: getImageUrl('blog-dhokra.jpg'),
      likes: 156,
      comments: 9,
      tags: ["dhokra", "metal casting", "brass", "sculpture", "tribal art"]
    }
  };

  const post = blogData[parseInt(id || '1')] || blogData[1];

  const relatedPosts = [
    {
      id: 2,
      title: "Preserving Handloom Traditions: The Weavers of Bengal",
      image: getImageUrl('blog-handloom.jpg'),
      category: "Textiles"
    },
    {
      id: 3,
      title: "The Revival of Dhokra Art: Metal Casting in Modern Times",
      image: getImageUrl('blog-dhokra.jpg'), 
      category: "Metal Crafts"
    },
    {
      id: 4,
      title: "Sustainable Crafting: How Traditional Arts Support Environmental Conservation",
      image: getImageUrl('blog-sustainability.jpg'),
      category: "Sustainability"
    }
  ].filter(relatedPost => relatedPost.id !== post.id);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${post.title} - Zaymazone Blog`}
        description={post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...'}
        keywords={`${post.category}, ${post.tags?.join(', ') || ''}, blog, crafts, artisans, traditional arts`}
        image={post.image}
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
          "image": post.image,
          "author": {
            "@type": "Person",
            "name": post.author.name,
            "image": post.author.avatar
          },
          "publisher": {
            "@type": "Organization",
            "name": "Zaymazone",
            "logo": {
              "@type": "ImageObject",
              "url": "/assets/logo.png"
            }
          },
          "datePublished": post.date,
          "dateModified": post.date,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
          }
        }}
      />
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Article Header */}
        <article className="space-y-8">
          <header className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground leading-tight">
              {post.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{post.author.role}</p>
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  {post.likes}
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {post.comments}
                </Button>
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="space-y-6 text-foreground [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-foreground [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:text-muted-foreground [&>p]:leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Share Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Share this article</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">Enjoying this article?</p>
              <Button size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Like this post
              </Button>
            </div>
          </div>

          <Separator />

          {/* Author Bio */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{post.author.role}</p>
                  <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            </CardHeader>
          </Card>
        </article>

        {/* Related Posts */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.id} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted">
                  <img 
                    src={relatedPost.image} 
                    alt={relatedPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="text-xs mb-2">{relatedPost.category}</Badge>
                  <h3 className="font-medium text-foreground hover:text-primary transition-colors">
                    <Link to={`/blog/${relatedPost.id}`}>{relatedPost.title}</Link>
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;