import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { scrollToTop } from "@/lib/scrollUtils";
import { getImageUrl } from "@/lib/api";

const footerSections = [
  {
    title: "Company",
    links: [
      { name: "About", path: "/about" },
      { name: "Artisans", path: "/artisans" },
      { name: "Contact", path: "/contact" }
    ]
  },
  {
    title: "Support", 
    links: [
      { name: "Terms & Conditions", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Contact Us", path: "/contact" }
    ]
  },
  {
    title: "Shop",
    links: [
      { name: "All Products", path: "/shop" },
      { name: "Pottery", path: "/shop?category=pottery" },
      { name: "Textiles", path: "/shop?category=textiles" }
    ]
  },
  {
    title: "For Sellers",
    links: [
      { name: "Start Selling", path: "/seller-onboarding" },
      { name: "Seller Dashboard", path: "/seller-dashboard" },
      { name: "Seller Resources", path: "/seller-resources" }
    ]
  }
];

export const Footer = () => {
  return (
    <footer className="bg-muted py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Join Seller Section */}
        <div className="text-center mb-16 pb-16 border-b border-border">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join as a Seller
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empower your craft, reach new customers.
          </p>
          <Button className="btn-hero" asChild>
            <Link to="/seller-onboarding">Start Selling</Link>
          </Button>
        </div>
        
        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo - Temporarily hidden for logo reveal */}
          <div className="col-span-2 md:col-span-1 opacity-0">
            <div className="flex items-center mb-6">
              <Link to="/" onClick={scrollToTop}>
                <img 
                  src={getImageUrl("/public/logo.png")} 
                  alt="ZAYMAZONE Logo" 
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
          </div>
          
          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground">
            © 2024 Zaymazone. Crafting Culture. Empowering Artisans.
          </p>
        </div>
      </div>
    </footer>
  );
};