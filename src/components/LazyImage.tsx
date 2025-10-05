import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  priority?: boolean; // Skip lazy loading for important images
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  className,
  placeholder = "/placeholder.svg",
  priority = false,
  onLoad,
  onError
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check if device is mobile - use state to make it reactive
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // md breakpoint
  });

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set initial state to load immediately for priority images or mobile
  useEffect(() => {
    if (priority || isMobile) {
      setIsInView(true);
    }
  }, [priority, isMobile]);

  useEffect(() => {
    // Skip lazy loading for priority images or mobile
    if (priority || isMobile) {
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    // Set a shorter timeout fallback to ensure images load quickly
    const fallbackTimer = setTimeout(() => {
      setIsInView(true);
    }, 500);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          clearTimeout(fallbackTimer);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(img);

    return () => {
      clearTimeout(fallbackTimer);
      observerRef.current?.disconnect();
    };
  }, [isMobile, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder/Blur image */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.img
            src={placeholder}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Main image */}
      <motion.img
        ref={imgRef}
        src={priority || isMobile || isInView ? (hasError ? placeholder : src) : placeholder}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isLoaded ? "filter-none scale-100" : "filter blur-sm scale-105"
        )}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded || hasError ? 1 : 0.8 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      {/* Loading shimmer effect */}
      <AnimatePresence>
        {!isLoaded && !hasError && isInView && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};