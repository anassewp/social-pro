/**
 * Advanced Animation System
 * نظام الرسوم المتحركة المتقدم مع Framer Motion
 */

import * as React from "react"

// ===== ANIMATION VARIANTS - متغيرات الحركة =====

export const animationVariants = {
  // Fade animations
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  fadeOut: {
    initial: { opacity: 1 },
    animate: { opacity: 0 },
    exit: { opacity: 1 },
  },

  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },

  // Scale animations
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  
  scaleOut: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.9 },
    exit: { opacity: 1, scale: 1 },
  },

  // Complex animations
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      }
    },
    exit: { opacity: 0, scale: 0.3 },
  },
  
  flipIn: {
    initial: { opacity: 0, rotateX: -90 },
    animate: { 
      opacity: 1, 
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      }
    },
    exit: { opacity: 0, rotateX: 90 },
  },

  // Page transitions
  pageSlideIn: {
    initial: { opacity: 0, x: "100%" },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: "-100%" },
  },
  
  pageSlideOut: {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 0, x: "-100%" },
    exit: { opacity: 1, x: 0 },
  },

  // Modal animations
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  modalContent: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  },

  // Drawer animations
  drawerSlideIn: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  
  drawerSlideOut: {
    initial: { x: 0 },
    animate: { x: "100%" },
    exit: { x: 0 },
  },

  // Notification animations
  notificationSlideIn: {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 300 },
  },
  
  notificationSlideOut: {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 0, x: 300 },
    exit: { opacity: 1, x: 0 },
  },
}

// ===== TRANSITION CONFIGS - إعدادات الانتقال =====

export const transitionConfigs = {
  fast: {
    duration: 0.15,
    ease: "easeOut",
  },
  
  default: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  
  slow: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  },
  
  bounce: {
    type: "spring",
    stiffness: 400,
    damping: 10,
  },
  
  elastic: {
    type: "spring",
    stiffness: 300,
    damping: 20,
  },
  
  smooth: {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
}

// ===== HOVER ANIMATIONS - حركات التمرير =====

export const hoverAnimations = {
  lift: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  
  scale: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  
  glow: {
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  
  rotate: {
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
}

// ===== ANIMATED COMPONENTS - المكونات المتحركة =====

export interface AnimatedDivProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof animationVariants
  transition?: keyof typeof transitionConfigs
  delay?: number
  stagger?: boolean
  whileHover?: keyof typeof hoverAnimations
  whileTap?: any
  asChild?: boolean
  children: React.ReactNode
}

// Animated Div Component
export const AnimatedDiv: React.FC<AnimatedDivProps> = ({
  variant = "fade",
  transition = "default",
  delay = 0,
  stagger = false,
  whileHover,
  whileTap,
  asChild = false,
  children,
  className,
  ...props
}) => {
  const Comp = asChild ? "div" : "div"
  
  const animationConfig = {
    initial: animationVariants[variant].initial,
    animate: animationVariants[variant].animate,
    exit: animationVariants[variant].exit,
    transition: {
      ...transitionConfigs[transition],
      delay,
    },
    whileHover,
    whileTap,
    className,
  }
  
  return <Comp {...animationConfig} {...props}>{children}</Comp>
}

// ===== ANIMATED STAGGER CONTAINER =====

export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  staggerDelay?: number
  variants?: any
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  variants,
  className,
  ...props
}) => {
  const containerVariants = variants || {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }
  
  return (
    <div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} variants={itemVariants}>
          {child}
        </div>
      ))}
    </div>
  )
}

// ===== PAGE TRANSITIONS =====

export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    x: "100%",
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
}

// ===== LIST ANIMATIONS =====

export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
  exit: { 
    opacity: 0, 
    x: 20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
}

// ===== LOADING ANIMATIONS =====

export const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

export const loadingDotsVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      delay: 0,
      ease: "easeInOut",
    },
  },
}

// ===== INTERACTIVE HOOKS =====

export const useHoverAnimation = (animationType: keyof typeof hoverAnimations) => {
  return hoverAnimations[animationType]
}

export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = React.useState(0)
  
  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  return scrollY
}

export const useIntersectionAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return { ref, isVisible }
}

// ===== ANIMATION PROVIDER =====

export interface AnimationProviderProps {
  children: React.ReactNode
  reducedMotion?: boolean
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  reducedMotion = false,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])
  
  const shouldReduceMotion = reducedMotion || prefersReducedMotion
  
  const contextValue = React.useMemo(() => ({
    reducedMotion: shouldReduceMotion,
    animations: shouldReduceMotion ? {
      fade: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } },
      slideUp: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 1, y: 0 } },
    } : animationVariants,
    transitions: shouldReduceMotion ? {
      fast: { duration: 0.01 },
      default: { duration: 0.01 },
      slow: { duration: 0.01 },
    } : transitionConfigs,
  }), [shouldReduceMotion])
  
  return (
    <div data-reduced-motion={shouldReduceMotion}>
      {children}
    </div>
  )
}

// ===== CSS CLASSES =====

export const animationClasses = {
  // Fade classes
  "animate-fade-in": "opacity-0 animate-fade-in",
  "animate-fade-out": "opacity-0 animate-fade-out",
  
  // Slide classes
  "animate-slide-up": "opacity-0 translate-y-8 animate-slide-up",
  "animate-slide-down": "opacity-0 -translate-y-8 animate-slide-down",
  "animate-slide-left": "opacity-0 translate-x-8 animate-slide-left",
  "animate-slide-right": "opacity-0 -translate-x-8 animate-slide-right",
  
  // Scale classes
  "animate-scale-in": "opacity-0 scale-95 animate-scale-in",
  "animate-scale-out": "opacity-0 scale-105 animate-scale-out",
  
  // Interactive classes
  "hover-lift": "transition-transform duration-200 hover:-translate-y-1",
  "hover-scale": "transition-transform duration-200 hover:scale-105",
  "hover-glow": "transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/25",
  
  // Loading classes
  "animate-spin": "animate-spin",
  "animate-pulse": "animate-pulse",
  "animate-bounce": "animate-bounce",
  "animate-ping": "animate-ping",
}

// ===== UTILITY FUNCTIONS =====

export const getAnimationDelay = (index: number, baseDelay = 0.1) => {
  return index * baseDelay
}

export const createStaggeredAnimation = (items: number, baseDelay = 0.1) => {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: baseDelay,
        delayChildren: 0.1,
      },
    },
  }
}

export const getReducedMotionConfig = () => ({
  duration: 0.01,
  ease: "linear",
  type: "tween",
})