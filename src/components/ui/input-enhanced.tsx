import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  // Base styles
  [
    "flex w-full rounded-lg border bg-background text-foreground",
    "transition-all duration-300 ease-out",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "placeholder:text-muted-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus:outline-none focus:ring-2 focus:ring-primary/20",
    "focus:border-primary hover:border-primary/50",
    "will-change-transform",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-input shadow-sm",
          "focus:shadow-md focus:shadow-primary/10",
        ],
        filled: [
          "border-0 bg-muted hover:bg-muted/80",
          "focus:bg-background focus:shadow-sm",
        ],
        ghost: [
          "border-0 bg-transparent shadow-none",
          "hover:bg-accent/50 focus:bg-background focus:shadow-sm",
        ],
        glass: [
          "border-white/20 bg-white/10 backdrop-blur-md",
          "focus:bg-white/20 focus:border-white/30",
          "dark:border-white/10 dark:bg-black/20",
        ],
        underline: [
          "border-0 border-b-2 border-input bg-transparent shadow-none rounded-none",
          "focus:border-primary rounded-none",
        ],
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
      state: {
        default: "",
        error: "border-error focus:ring-error/20 focus:border-error hover:border-error/50",
        success: "border-success focus:ring-success/20 focus:border-success hover:border-success/50",
        warning: "border-warning focus:ring-warning/20 focus:border-warning hover:border-warning/50",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  errorText?: string
  successText?: string
  warningText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  loading?: boolean
  fullWidth?: boolean
  noRadius?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state,
    label,
    helperText,
    errorText,
    successText,
    warningText,
    leftIcon,
    rightIcon,
    clearable = false,
    loading = false,
    fullWidth = false,
    noRadius = false,
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [value, setValue] = React.useState("")
    
    const hasLeftIcon = Boolean(leftIcon)
    const hasRightIcon = Boolean(rightIcon) || clearable || loading || props.type === "password"
    
    const isPassword = props.type === "password"
    const inputType = isPassword && showPassword ? "text" : props.type
    
    const handleClear = () => {
      setValue("")
      // Trigger change event
      const event = new Event("input", { bubbles: true })
      const target = ref as React.RefObject<HTMLInputElement> | null
      if (target?.current) {
        target.current.value = ""
        target.current.dispatchEvent(event)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              inputVariants({ variant, size, state }),
              hasLeftIcon && "pl-10",
              hasRightIcon && "pr-10",
              noRadius && "rounded-none",
              fullWidth && "w-full",
              state === "error" && "animate-shake",
              "file:text-sm file:font-medium placeholder:text-muted-foreground",
              className
            )}
            disabled={disabled || loading}
            onChange={handleChange}
            {...props}
          />
          
          {/* Right Icons */}
          {hasRightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <div className="flex items-center gap-1">
                {/* Loading spinner */}
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                )}
                
                {/* Clear button */}
                {clearable && value && !loading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="hover:text-foreground transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {/* Password toggle */}
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                )}
                
                {/* Custom right icon */}
                {rightIcon && !loading && !clearable && !isPassword && (
                  <span className="pointer-events-none">{rightIcon}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Helper Text */}
        {(helperText || errorText || successText || warningText) && (
          <div className="text-xs">
            {errorText && (
              <div className="flex items-center gap-1 text-error">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorText}
              </div>
            )}
            {successText && state === "success" && (
              <div className="flex items-center gap-1 text-success">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successText}
              </div>
            )}
            {warningText && state === "warning" && (
              <div className="flex items-center gap-1 text-warning">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {warningText}
              </div>
            )}
            {helperText && !errorText && !successText && !warningText && (
              <div className="text-muted-foreground">{helperText}</div>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// ===== Textarea Component =====
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof inputVariants>, "size"> {
  resize?: "none" | "both" | "horizontal" | "vertical"
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, state, resize = "vertical", autoResize = false, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    const combinedRef = (node: HTMLTextAreaElement) => {
      textareaRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }
    
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        const autoResize = () => {
          textarea.style.height = "auto"
          textarea.style.height = textarea.scrollHeight + "px"
        }
        
        autoResize()
        textarea.addEventListener("input", autoResize)
        
        return () => {
          textarea.removeEventListener("input", autoResize)
        }
      }
    }, [autoResize])
    
    const resizeClasses = {
      none: "resize-none",
      both: "resize",
      horizontal: "resize-x",
      vertical: "resize-y",
    }
    
    return (
      <textarea
        ref={combinedRef}
        className={cn(
          inputVariants({ variant, state }),
          resizeClasses[resize],
          "min-h-[80px] py-2",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// ===== Search Input =====
export interface SearchInputProps extends Omit<InputProps, "leftIcon" | "rightIcon"> {
  suggestions?: string[]
  onSelectSuggestion?: (suggestion: string) => void
  showSuggestions?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ suggestions = [], onSelectSuggestion, showSuggestions = false, className, ...props }, ref) => {
    const [showSuggestionsList, setShowSuggestionsList] = React.useState(false)
    
    const handleSuggestionClick = (suggestion: string) => {
      onSelectSuggestion?.(suggestion)
      setShowSuggestionsList(false)
    }
    
    return (
      <div className="relative">
        <Input
          ref={ref}
          leftIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          className={className}
          {...props}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

// ===== Input Group =====
interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hasError?: boolean
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, hasError, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          hasError && "animate-shake",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              className: cn(
                child.props.className,
                index > 0 && "rounded-l-none border-l-0",
                index === 0 && "rounded-r-none border-r-0",
                index < React.Children.count(children) - 1 && "rounded-none"
              ),
            })
          }
          return child
        })}
      </div>
    )
  }
)
InputGroup.displayName = "InputGroup"

export { 
  Input, 
  Textarea, 
  SearchInput, 
  InputGroup,
  inputVariants 
}