import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { ValuesSection } from "@/components/ValuesSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Footer } from "@/components/Footer";
import { ComparisonFloatingButton } from "@/components/ComparisonFloatingButton";
import { ProductComparison } from "@/components/ProductComparison";
import { ArtisanSpotlight } from "@/components/ArtisanSpotlight";
import { InteractiveStats } from "@/components/InteractiveStats";
import { SkillShowcase } from "@/components/SkillShowcase";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useProductComparison } from "@/hooks/useProductComparison";
import SEO from "@/components/SEO";

const Index = () => {
  const {
    comparisonProducts,
    isComparisonOpen,
    clearComparison,
    openComparison,
    closeComparison,
    removeFromComparison,
    comparisonCount
  } = useProductComparison();

  return (
    <div className="min-h-screen bg-background artisan-pattern">
      <SEO
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Zaymazone",
          "description": "Discover authentic handcrafted products from talented artisans. Zaymazone connects you with local creators, supporting traditional crafts and cultural heritage.",
          "url": window.location.origin,
          "logo": `${window.location.origin}/assets/logo.png`,
          "sameAs": [
            // Add social media URLs when available
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-XXXXXXXXXX", // Add actual contact when available
            "contactType": "customer service"
          }
        }}
      />
      <Navigation />
      <HeroSection />
      <AnimatedSection>
        <InteractiveStats />
      </AnimatedSection>
      <AnimatedSection delay={0.2}>
        <CategoriesSection />
      </AnimatedSection>
      <AnimatedSection delay={0.4}>
        <FeaturedProducts />
      </AnimatedSection>
      <AnimatedSection delay={0.6}>
        <SkillShowcase />
      </AnimatedSection>
      <AnimatedSection delay={0.8}>
        <ArtisanSpotlight />
      </AnimatedSection>
      <AnimatedSection delay={1.0}>
        <ValuesSection />
      </AnimatedSection>
      <AnimatedSection delay={1.2}>
        <TestimonialSection />
      </AnimatedSection>
      <AnimatedSection delay={1.4}>
        <NewsletterSection />
      </AnimatedSection>
      <Footer />
      <ScrollToTop />

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
    </div>
  );
};

export default Index;
