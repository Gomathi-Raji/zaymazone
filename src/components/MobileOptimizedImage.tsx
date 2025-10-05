import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const MobileOptimizedImage = ({
  src,
  alt,
  className,
  placeholder = "/placeholder.svg"
}: MobileOptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    console.log('MobileOptimizedImage loading:', src);
    // Load the image immediately
    const img = new Image();
    img.onload = () => {
      console.log('MobileOptimizedImage loaded successfully:', src);
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      console.warn('Failed to load image:', src);
      setHasError(true);
      setImageSrc(placeholder);
      setIsLoaded(true); // Still show the placeholder
    };
    img.src = src;
  }, [src, placeholder]);

  return (
    <motion.img
      src={imageSrc}
      alt={alt}
      className={cn(
        "w-full h-full object-cover transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-70",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded || hasError ? 1 : 0.7 }}
      transition={{ duration: 0.3 }}
    />
  );
};