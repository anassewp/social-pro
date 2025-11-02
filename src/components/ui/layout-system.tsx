import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// =============================================
// GRID SYSTEM - نظام الشبكة المتقدم
// =============================================

const gridVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
      11: "grid-cols-11",
      12: "grid-cols-12",
      auto: "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
      autoFill: "grid-cols-[repeat(auto-fill,minmax(0,1fr))]",
      none: "",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    },
    responsive: {
      true: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      false: "",
    },
  },
  defaultVariants: {
    cols: "auto",
    gap: "md",
    responsive: false,
  },
})

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  asChild?: boolean
  fluid?: boolean
  centered?: boolean
  minItemWidth?: string
  equalHeight?: boolean
  Masonry?: boolean
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols, 
    gap, 
    responsive,
    asChild,
    fluid = false,
    centered = false,
    minItemWidth = "250px",
    equalHeight = false,
    Masonry = false,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? "div" : "div"
    
    const gridStyle = React.useMemo(() => {
      if (Masonry) {
        return {
          gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
        }
      }
      return {}
    }, [Masonry, minItemWidth])
    
    return (
      <Comp
        ref={ref}
        className={cn(
          gridVariants({ cols, gap, responsive }),
          fluid && "w-full max-w-none",
          centered && "justify-items-center",
          equalHeight && "items-stretch",
          className
        )}
        style={gridStyle}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Grid.displayName = "Grid"

// =============================================
// FLEXBOX LAYOUT - تخطيط مرن
// =============================================

const flexVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
      rowReverse: "flex-row-reverse",
      colReverse: "flex-col-reverse",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      wrapReverse: "flex-wrap-reverse",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    responsive: {
      true: "flex-col sm:flex-row",
      false: "",
    },
  },
  defaultVariants: {
    direction: "row",
    wrap: "nowrap",
    justify: "start",
    align: "stretch",
    gap: "none",
    responsive: false,
  },
})

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  asChild?: boolean
  fluid?: boolean
  centered?: boolean
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, wrap, justify, align, gap, responsive, asChild, fluid = false, centered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          flexVariants({ direction, wrap, justify, align, gap, responsive }),
          fluid && "w-full",
          centered && "items-center justify-center",
          className
        )}
        {...props}
      />
    )
  }
)
Flex.displayName = "Flex"

// =============================================
// CONTAINER - الحاويات
// =============================================

const containerVariants = cva("w-full mx-auto px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-2xl",
      md: "max-w-4xl", 
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-8xl",
      fluid: "max-w-none",
    },
    centered: {
      true: "mx-auto",
      false: "",
    },
  },
  defaultVariants: {
    size: "lg",
    centered: true,
  },
})

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  asChild?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, centered, asChild, ...props }, ref) => {
    const Comp = asChild ? "div" : "div"
    
    return (
      <Comp
        ref={ref}
        className={cn(containerVariants({ size, centered }), className)}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

// =============================================
// STACK - التخطيط المتدرج
// =============================================

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal"
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  align?: "start" | "center" | "end" | "stretch" | "baseline"
  divider?: React.ReactNode
  wrap?: boolean
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction = "vertical", 
    gap = "md", 
    justify = "start", 
    align = "start", 
    divider,
    wrap = false,
    children,
    ...props 
  }, ref) => {
    const isHorizontal = direction === "horizontal"
    
    const gapClasses = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2", 
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          isHorizontal ? "flex-row" : "flex-col",
          wrap && "flex-wrap",
          justify !== "start" && `justify-${justify}`,
          align !== "start" && `items-${align}`,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (index > 0 && divider) {
            return (
              <React.Fragment key={index}>
                {divider}
                {child}
              </React.Fragment>
            )
          }
          return <React.Fragment key={index}>{child}</React.Fragment>
        })}
      </div>
    )
  }
)
Stack.displayName = "Stack"

// =============================================
// RESPONSIVE GRID - شبكة متجاوبة
// =============================================

export interface ResponsiveGridProps extends Omit<GridProps, "cols"> {
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  gap?: GridProps["gap"]
  minItemWidth?: string
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    cols = { sm: 1, md: 2, lg: 3, xl: 4 }, 
    gap = "md",
    minItemWidth = "250px",
    ...props 
  }, ref) => {
    const gridClasses = React.useMemo(() => {
      const classes = ["grid", `gap-${gap}`]
      
      if (cols.sm) classes.push(`grid-cols-${cols.sm}`)
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)
      if (cols["2xl"]) classes.push(`2xl:grid-cols-${cols["2xl"]}`)
      
      return classes.join(" ")
    }, [cols, gap])
    
    return (
      <div
        ref={ref}
        className={cn(gridClasses, className)}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
        }}
        {...props}
      />
    )
  }
)
ResponsiveGrid.displayName = "ResponsiveGrid"

// =============================================
// SIDEBAR LAYOUT - تخطيط الشريط الجانبي
// =============================================

export interface SidebarLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  sidebarWidth?: {
    collapsed?: string
    expanded?: string
  }
  collapsible?: boolean
  collapsed?: boolean
  position?: "left" | "right"
  overlay?: boolean
}

const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ 
    children, 
    sidebar, 
    sidebarWidth = { collapsed: "64px", expanded: "256px" },
    collapsible = false,
    collapsed = false,
    position = "left",
    overlay = true,
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = React.useState(collapsed)
    
    const toggleCollapse = () => {
      if (collapsible) {
        setIsCollapsed(!isCollapsed)
      }
    }
    
    return (
      <div
        ref={ref}
        className="flex h-screen bg-background"
        dir="ltr"
      >
        {/* Sidebar */}
        <div
          className={cn(
            "bg-card border-border border-r flex flex-col transition-all duration-300",
            isCollapsed ? "w-16" : "w-64",
            position === "right" && "order-2",
            position === "left" && "order-1"
          )}
          style={{
            width: isCollapsed ? sidebarWidth.collapsed : sidebarWidth.expanded,
          }}
        >
          {collapsible && (
            <button
              onClick={toggleCollapse}
              className="absolute -right-3 top-6 bg-background border border-border rounded-full p-1 z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
          )}
          {sidebar}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }
)
SidebarLayout.displayName = "SidebarLayout"

// =============================================
// PAGE HEADER - رأس الصفحة
// =============================================

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
  variant?: "default" | "minimal" | "hero"
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    className, 
    title, 
    description, 
    breadcrumb, 
    actions, 
    variant = "default",
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-8",
          variant === "hero" && "py-12 bg-gradient-to-r from-primary/10 to-transparent",
          variant === "minimal" && "mb-6",
          className
        )}
        {...props}
      >
        <Container size="lg">
          <Flex direction="col" gap="md" align="start">
            {breadcrumb && (
              <nav aria-label="مسار التنقل">
                {breadcrumb}
              </nav>
            )}
            
            <div className="flex-1">
              <Stack direction="horizontal" gap="lg" align="center" justify="between">
                <div>
                  <h1 className={cn(
                    "text-foreground font-bold tracking-tight",
                    variant === "hero" ? "text-4xl md:text-5xl" : "text-3xl"
                  )}>
                    {title}
                  </h1>
                  {description && (
                    <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                      {description}
                    </p>
                  )}
                </div>
                
                {actions && (
                  <Flex gap="md">
                    {actions}
                  </Flex>
                )}
              </Stack>
            </div>
          </Flex>
        </Container>
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

// =============================================
// CONTENT AREA - منطقة المحتوى
// =============================================

export interface ContentAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "fluid"
  padding?: "none" | "sm" | "md" | "lg"
  center?: boolean
}

const ContentArea = React.forwardRef<HTMLDivElement, ContentAreaProps>(
  ({ className, maxWidth = "lg", padding = "lg", center = false, ...props }, ref) => {
    const paddingClasses = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          maxWidth !== "fluid" && `max-w-${maxWidth}`,
          center && "mx-auto",
          paddingClasses[padding],
          className
        )}
        {...props}
      />
    )
  }
)
ContentArea.displayName = "ContentArea"

export {
  Grid,
  Flex,
  Container,
  Stack,
  ResponsiveGrid,
  SidebarLayout,
  PageHeader,
  ContentArea,
  gridVariants,
  flexVariants,
  containerVariants,
}