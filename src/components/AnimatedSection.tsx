import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { artisanAnimations, reducedMotionVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: keyof typeof artisanAnimations;
  delay?: number;
  once?: boolean;
  threshold?: number;
}

export const AnimatedSection = ({
  children,
  className,
  animation = "section",
  delay = 0,
  once = true,
  threshold = 0.1,
}: AnimatedSectionProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: once,
    rootMargin: '0px 0px -50px 0px', // Reduced from -100px to -50px for better mobile support
  });

  const [hasAnimated, setHasAnimated] = useState(false);

  // Check for reduced motion preference - safely handle SSR
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Handle case where element is already in view on mount
  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  const variants = prefersReducedMotion ? reducedMotionVariants : (artisanAnimations[animation] as Variants);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={(inView || hasAnimated) ? "visible" : "hidden"}
      variants={variants}
      className={cn("py-16", className)}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};