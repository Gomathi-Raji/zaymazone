import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { artisanAnimations } from "@/lib/animations";
import { getImageUrl } from "@/lib/api";

export const HeroSection = () => {
  const titleWords = ["Crafting Culture.", "Empowering Artisans."];

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden mobile-section">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getImageUrl('/assets/hero-bg.jpg')})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center mobile-container max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={artisanAnimations.container}
      >
        <div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            variants={artisanAnimations.heroText}
            custom={0}
          >
            {titleWords[0]}
            <br />
            <motion.span
              className="text-primary-glow drop-shadow-xl"
              variants={artisanAnimations.heroText}
              custom={1}
            >
              {titleWords[1]}
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={artisanAnimations.heroText}
            custom={2}
          >
            Discover authentic handcrafted treasures that tell stories of tradition,
            heritage, and the skilled hands that create them.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md sm:max-w-none mx-auto"
            variants={artisanAnimations.heroText}
            custom={3}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto px-8 py-3 text-base font-semibold btn-hero" asChild>
                <Link to="/shop">Shop Now</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                asChild
              >
                <Link to="/seller-onboarding">Start Selling</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
            <motion.div
              className="w-1 h-3 bg-white/70 rounded-full mx-auto"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};