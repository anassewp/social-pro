import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  // Base styles
  [
    "rounded-lg border bg-card text-card-foreground",
    "transition-all duration-300 ease-out",
    "will-change-transform hover:shadow-lg",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-border shadow-sm",
          "hover:shadow-md hover:-translate-y-1",
          "hover:border-primary/20",
        ],
        elevated: [
          "shadow-lg border-0",
          "hover:shadow-xl hover:-translate-y-2",
          "hover:shadow-primary/10",
        ],
        outlined: [
          "border-2 border-border shadow-none",
          "hover:border-primary/50 hover:shadow-md",
        ],
        ghost: [
          "border-0 shadow-none",
          "hover:bg-accent hover:text-accent-foreground",
        ],
        glass: [
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-lg hover:bg-white/20 hover:border-white/30",
          "dark:bg-black/20 dark:border-white/10 dark:hover:bg-black/30",
        ],
        gradient: [
          "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
          "border border-primary/20 shadow-md",
          "hover:from-primary/20 hover:via-primary/10 hover:shadow-lg",
        ],
        soft: [
          "bg-muted/50 border-muted",
          "hover:bg-muted hover:shadow-sm",
        ],
        success: [
          "border-success/20 bg-success/5 shadow-success/10",
          "hover:border-success/30 hover:bg-success/10 hover:shadow-success/20",
        ],
        warning: [
          "border-warning/20 bg-warning/5 shadow-warning/10",
          "hover:border-warning/30 hover:bg-warning/10 hover:shadow-warning/20",
        ],
        error: [
          "border-error/20 bg-error/5 shadow-error/10",
          "hover:border-error/30 hover:bg-error/10 hover:shadow-error/20",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1",
        scale: "hover:scale-[1.02]",
        glow: "hover:shadow-primary/25 hover:shadow-2xl",
        tilt: "hover:rotate-1",
      },
      interactive: {
        true: [
          "cursor-pointer select-none",
          "active:scale-[0.98]",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
        ],
      },
      animated: {
        true: "animate-fade-in",
        entrance: "animate-slide-in-up",
        exit: "animate-fade-out",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
      interactive: false,
    },
    compoundVariants: [
      // Interactive cards have specific styles
      {
        interactive: true,
        className: "hover:shadow-lg hover:border-primary/30",
      },
    ],
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  noRadius?: boolean
  fullWidth?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, interactive, animated, noRadius, fullWidth, asChild, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, hover, interactive, animated }),
          noRadius && "rounded-none",
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// ===== Card Header =====
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centered?: boolean
  }
>(({ className, centered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      centered && "items-center text-center",
      "p-6 pb-4",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// ===== Card Title =====
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ className, level = 3, children, ...props }, ref) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Component
      ref={ref}
      className={cn(
        "text-foreground font-semibold leading-none tracking-tight",
        level === 1 && "text-3xl",
        level === 2 && "text-2xl", 
        level === 3 && "text-xl",
        level === 4 && "text-lg",
        level === 5 && "text-base",
        level === 6 && "text-sm",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
})
CardTitle.displayName = "CardTitle"

// ===== Card Description =====
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground leading-relaxed",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// ===== Card Content =====
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

// ===== Card Footer =====
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centered?: boolean
  }
>(({ className, centered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      centered && "justify-center",
      "p-6 pt-4",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// ===== Card Actions =====
interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "start" | "end" | "center" | "between" | "around"
  spacing?: "none" | "sm" | "md" | "lg"
}

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, position = "end", spacing = "sm", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        position === "start" && "justify-start",
        position === "end" && "justify-end",
        position === "center" && "justify-center",
        position === "between" && "justify-between",
        position === "around" && "justify-around",
        spacing === "none" && "gap-0",
        spacing === "sm" && "gap-1",
        spacing === "md" && "gap-2",
        spacing === "lg" && "gap-3",
        "p-6 pt-4",
        className
      )}
      {...props}
    />
  )
)
CardActions.displayName = "CardActions"

// ===== Card Image =====
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt?: string
  loading?: "lazy" | "eager"
  overlay?: boolean
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, alt = "", loading = "lazy", overlay = false, ...props }, ref) => (
    <div className={cn("relative overflow-hidden rounded-t-lg", !overlay && "aspect-video")}>
      <img
        ref={ref}
        className={cn(
          "w-full h-full object-cover transition-transform duration-300 hover:scale-105",
          className
        )}
        alt={alt}
        loading={loading}
        {...props}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      )}
    </div>
  )
)
CardImage.displayName = "CardImage"

// ===== Card Badge =====
interface CardBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info"
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

const CardBadge = React.forwardRef<HTMLDivElement, CardBadgeProps>(
  ({ className, variant = "default", position = "top-left", ...props }, ref) => {
    const variantStyles = {
      default: "bg-primary text-primary-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground", 
      error: "bg-error text-error-foreground",
      info: "bg-info text-info-foreground",
    }
    
    const positionStyles = {
      "top-left": "top-4 left-4",
      "top-right": "top-4 right-4",
      "bottom-left": "bottom-4 left-4", 
      "bottom-right": "bottom-4 right-4",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-10 px-2.5 py-1 rounded-full text-xs font-medium",
          "backdrop-blur-sm border border-white/20",
          variantStyles[variant],
          positionStyles[position],
          className
        )}
        {...props}
      />
    )
  }
)
CardBadge.displayName = "CardBadge"

// ===== Card Stats =====
interface CardStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: Array<{
    label: string
    value: string | number
    change?: {
      value: number
      type: "increase" | "decrease" | "neutral"
    }
    icon?: React.ReactNode
  }>
}

const CardStats = React.forwardRef<HTMLDivElement, CardStatsProps>(
  ({ className, stats, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
      {...props}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {stat.icon && <span className="text-primary">{stat.icon}</span>}
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
          {stat.change && (
            <div className={cn(
              "text-xs font-medium",
              stat.change.type === "increase" && "text-success",
              stat.change.type === "decrease" && "text-error", 
              stat.change.type === "neutral" && "text-muted-foreground"
            )}>
              {stat.change.type === "increase" && "+"}
              {stat.change.value}%
            </div>
          )}
        </div>
      ))}
    </div>
  )
)
CardStats.displayName = "CardStats"

// ===== Interactive Card =====
interface InteractiveCardProps extends CardProps {
  onClick?: () => void
  href?: string
  external?: boolean
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, onClick, href, external, ...props }, ref) => {
    const Component = href ? (external ? "a" : "a") : "div"
    
    return (
      <Component
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cn(
          cardVariants({ interactive: true }),
          className
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      />
    )
  }
)
InteractiveCard.displayName = "InteractiveCard"

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardActions,
  CardImage,
  CardBadge,
  CardStats,
  InteractiveCard,
  cardVariants,
}