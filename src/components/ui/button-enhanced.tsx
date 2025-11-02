import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles - الأنماط الأساسية
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none",
    "disabled:opacity-50 active:scale-95 transform-gpu",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Enhanced hover effects
    "hover:shadow-lg hover:-translate-y-0.5",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground shadow-md",
          "hover:bg-primary/90 hover:shadow-primary/25",
          "active:bg-primary/95",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground shadow-md",
          "hover:bg-destructive/90 hover:shadow-destructive/25",
          "active:bg-destructive/95",
        ],
        outline: [
          "border-2 border-input bg-background shadow-sm",
          "hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
          "hover:shadow-md active:bg-accent/80",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground shadow-sm",
          "hover:bg-secondary/80 hover:shadow-md",
          "active:bg-secondary/90",
        ],
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "hover:shadow-sm active:bg-accent/80",
        ],
        link: [
          "text-primary underline-offset-4 hover:underline",
          "hover:text-primary/80 focus-visible:ring-primary/20",
        ],
        
        // New advanced variants
        gradient: [
          "bg-gradient-to-r from-primary to-primary/80 text-white",
          "shadow-lg hover:shadow-xl hover:shadow-primary/30",
          "hover:from-primary/90 hover:to-primary/70",
          "active:shadow-md",
        ],
        glass: [
          "bg-white/10 backdrop-blur-md border border-white/20",
          "text-foreground hover:bg-white/20 hover:border-white/30",
          "shadow-lg hover:shadow-xl active:bg-white/25",
          "dark:bg-black/20 dark:border-white/10 dark:hover:bg-black/30",
        ],
        glow: [
          "bg-primary text-primary-foreground shadow-lg",
          "hover:shadow-primary/50 hover:shadow-2xl",
          "hover:shadow-primary/40 hover:shadow-primary/60",
          "focus-visible:ring-primary/50 active:shadow-primary/30",
        ],
        soft: [
          "bg-primary/10 text-primary border border-primary/20",
          "hover:bg-primary/20 hover:text-primary/90",
          "hover:border-primary/30 active:bg-primary/25",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs gap-1.5",
        lg: "h-12 rounded-lg px-8 text-base gap-2.5",
        xl: "h-14 rounded-lg px-10 text-lg gap-3",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse",
        spin: "hover:animate-spin",
        ping: "hover:animate-ping",
      },
      loading: {
        true: "cursor-wait opacity-70 pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
    compoundVariants: [
      // Loading state overrides
      {
        loading: true,
        variant: "gradient",
        className: "bg-gradient-to-r from-primary/70 to-primary/60",
      },
      {
        loading: true,
        variant: "glass",
        className: "bg-white/5 border-white/10",
      },
      {
        loading: true,
        variant: "glow",
        className: "bg-primary/70 shadow-primary/20",
      },
    ],
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  noPadding?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    noPadding = false,
    asChild = false, 
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            animation, 
            loading,
            className 
          }),
          fullWidth && "w-full",
          noPadding && "p-0",
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            {loadingText || "جاري التحميل..."}
          </div>
        )}
        
        {!loading && (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className="truncate">{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// ===== Button Group Component =====
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  spacing?: "none" | "sm" | "md" | "lg"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", spacing = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" 
            ? "flex-row" 
            : "flex-col",
          spacing === "sm" && "gap-1",
          spacing === "md" && "gap-2", 
          spacing === "lg" && "gap-3",
          // Remove default rounded corners for internal buttons
          "[&_button]:rounded-none",
          // Add rounded corners to outer buttons
          orientation === "horizontal"
            ? "[&_button:first-child]:rounded-l-lg [&_button:last-child]:rounded-r-lg"
            : "[&_button:first-child]:rounded-t-lg [&_button:last-child]:rounded-b-lg",
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

// ===== Floating Action Button =====
interface FABProps extends ButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ position = "bottom-right", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        variant="gradient"
        className={cn(
          "fixed z-50 shadow-2xl",
          position === "bottom-right" && "bottom-6 right-6",
          position === "bottom-left" && "bottom-6 left-6", 
          position === "top-right" && "top-6 right-6",
          position === "top-left" && "top-6 left-6",
          "hover:scale-110 active:scale-95",
          className
        )}
        {...props}
      />
    )
  }
)
FAB.displayName = "FAB"

// ===== Icon Button =====
interface IconButtonProps extends Omit<ButtonProps, "children" | "size"> {
  icon: React.ReactNode
  size?: "sm" | "default" | "lg" | "xl" | "icon-sm" | "icon" | "icon-lg"
  tooltip?: string
  "aria-label"?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "icon", tooltip, "aria-label": ariaLabel, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        variant={props.variant || "ghost"}
        className={cn("relative", props.className)}
        aria-label={tooltip || ariaLabel}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

export { 
  Button, 
  buttonVariants, 
  ButtonGroup, 
  FAB, 
  IconButton 
}