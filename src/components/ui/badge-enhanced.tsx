import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full",
    "text-xs font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-sm",
        outline: "border-2 border-input text-foreground",
        success: "bg-success text-success-foreground shadow-sm",
        warning: "bg-warning text-warning-foreground shadow-sm",
        error: "bg-error text-error-foreground shadow-sm",
        info: "bg-info text-info-foreground shadow-sm",
        
        // Advanced variants
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg",
        soft: "bg-primary/10 text-primary border border-primary/20",
        subtle: "bg-muted text-muted-foreground",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground",
        glow: "bg-primary text-primary-foreground shadow-lg shadow-primary/50",
      },
      size: {
        xs: "h-5 px-1.5 text-[10px]",
        sm: "h-6 px-2 text-xs",
        default: "h-6.5 px-2.5 text-xs",
        lg: "h-7 px-3 text-sm",
        xl: "h-8 px-4 text-base",
      },
      shape: {
        rounded: "rounded-full",
        square: "rounded-md",
        pill: "rounded-full px-3",
      },
      pulse: {
        true: "animate-pulse",
        false: "",
      },
      glow: {
        true: "shadow-lg shadow-primary/25 animate-glow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
      pulse: false,
      glow: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  removable?: boolean
  onRemove?: () => void
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  noPadding?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape, 
    pulse, 
    glow,
    asChild, 
    removable = false,
    onRemove,
    leftIcon,
    rightIcon,
    noPadding = false,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? "span" : "div"
    
    return (
      <Comp
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, shape, pulse, glow }),
          noPadding && "px-0",
          removable && "pr-1",
          className
        )}
        {...props}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 h-3 w-3 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
            aria-label="إزالة"
          >
            <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </Comp>
    )
  }
)
Badge.displayName = "Badge"

// ===== Status Badge =====
export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "online" | "offline" | "away" | "busy" | "pending" | "completed" | "cancelled" | "failed"
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, children, className, ...props }, ref) => {
    const statusConfig = {
      online: {
        variant: "success" as const,
        icon: (
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        ),
        text: children || "متصل",
      },
      offline: {
        variant: "secondary" as const,
        icon: (
          <div className="w-2 h-2 bg-current rounded-full" />
        ),
        text: children || "غير متصل",
      },
      away: {
        variant: "warning" as const,
        icon: (
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        ),
        text: children || "بعيد",
      },
      busy: {
        variant: "error" as const,
        icon: (
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        ),
        text: children || "مشغول",
      },
      pending: {
        variant: "info" as const,
        icon: (
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        ),
        text: children || "في الانتظار",
      },
      completed: {
        variant: "success" as const,
        icon: (
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        text: children || "مكتمل",
      },
      cancelled: {
        variant: "error" as const,
        icon: (
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        text: children || "ملغي",
      },
      failed: {
        variant: "error" as const,
        icon: (
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: children || "فاشل",
      },
    }
    
    const config = statusConfig[status]
    
    return (
      <Badge
        ref={ref}
        variant={config.variant}
        leftIcon={config.icon}
        className={cn("gap-1.5", className)}
        {...props}
      >
        {config.text}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

// ===== Notification Badge =====
export interface NotificationBadgeProps extends Omit<BadgeProps, "variant"> {
  count: number
  max?: number
  showZero?: boolean
}

const NotificationBadge = React.forwardRef<HTMLDivElement, NotificationBadgeProps>(
  ({ count, max = 99, showZero = false, className, ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count.toString()
    
    if (count === 0 && !showZero) {
      return null
    }
    
    return (
      <Badge
        ref={ref}
        variant="error"
        size="xs"
        pulse={count > 0}
        className={cn(
          "min-w-5 h-5 px-1",
          className
        )}
        {...props}
      >
        {displayCount}
      </Badge>
    )
  }
)
NotificationBadge.displayName = "NotificationBadge"

// ===== Rating Badge =====
export interface RatingBadgeProps extends Omit<BadgeProps, "variant"> {
  rating: number
  max?: number
  showStars?: boolean
}

const RatingBadge = React.forwardRef<HTMLDivElement, RatingBadgeProps>(
  ({ rating, max = 5, showStars = true, children, className, ...props }, ref) => {
    const stars = Array.from({ length: max }, (_, i) => i < rating)
    
    return (
      <Badge
        ref={ref}
        variant="warning"
        leftIcon={
          showStars ? (
            <div className="flex gap-0.5">
              {stars.map((filled, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-2 h-2",
                    filled ? "fill-current" : "fill-none stroke-current"
                  )}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
          ) : undefined
        }
        className={cn("gap-2", className)}
        {...props}
      >
        {children || rating.toFixed(1)}
      </Badge>
    )
  }
)
RatingBadge.displayName = "RatingBadge"

// ===== Progress Badge =====
export interface ProgressBadgeProps extends Omit<BadgeProps, "variant"> {
  progress: number
  showPercentage?: boolean
}

const ProgressBadge = React.forwardRef<HTMLDivElement, ProgressBadgeProps>(
  ({ progress, showPercentage = true, children, className, ...props }, ref) => {
    const progressColor = progress >= 80 ? "success" : progress >= 50 ? "warning" : "error"
    
    return (
      <Badge
        ref={ref}
        variant={progressColor}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <div className="absolute inset-0 bg-current opacity-20" style={{ width: `${progress}%` }} />
        <span className="relative z-10">
          {children || (showPercentage ? `${progress}%` : "")}
        </span>
      </Badge>
    )
  }
)
ProgressBadge.displayName = "ProgressBadge"

// ===== Badge Group =====
interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spacing?: "none" | "sm" | "md" | "lg"
  wrap?: boolean
  max?: number
  showMoreLabel?: string
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, children, spacing = "sm", wrap = true, max, showMoreLabel = "المزيد", ...props }, ref) => {
    const badges = React.Children.toArray(children)
    const shouldTruncate = max && badges.length > max
    const visibleBadges = shouldTruncate ? badges.slice(0, max) : badges
    const hiddenCount = badges.length - visibleBadges.length
    
    const spacingClasses = {
      none: "gap-0",
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-3",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex flex-wrap items-center",
          spacingClasses[spacing],
          wrap && "flex-wrap",
          !wrap && "flex-nowrap overflow-hidden",
          className
        )}
        {...props}
      >
        {visibleBadges}
        {shouldTruncate && (
          <Badge variant="secondary" size="sm">
            {showMoreLabel} ({hiddenCount})
          </Badge>
        )}
      </div>
    )
  }
)
BadgeGroup.displayName = "BadgeGroup"

export {
  Badge,
  StatusBadge,
  NotificationBadge,
  RatingBadge,
  ProgressBadge,
  BadgeGroup,
  badgeVariants,
}