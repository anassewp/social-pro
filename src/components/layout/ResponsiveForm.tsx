'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'
import { 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Calendar,
  Upload,
  X
} from 'lucide-react'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'checkbox' | 'file'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    custom?: (value: any) => string | null
  }
  helpText?: string
  className?: string
  autoComplete?: string
  step?: number
  multiple?: boolean
  accept?: string
  defaultValue?: any
}

interface ResponsiveFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  submitText?: string
  cancelText?: string
  className?: string
  layout?: 'vertical' | 'horizontal' | 'mixed'
  showPasswordToggle?: boolean
  showValidationIcons?: boolean
  compact?: boolean
}

export function ResponsiveForm({
  fields,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'حفظ',
  cancelText = 'إلغاء',
  className,
  layout = 'vertical',
  showPasswordToggle = true,
  showValidationIcons = true,
  compact = false
}: ResponsiveFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data
  useEffect(() => {
    const initialData: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue
      } else if (field.type === 'checkbox') {
        initialData[field.name] = false
      }
    })
    setFormData(initialData)
  }, [fields])

  const validateField = (field: FormField, value: any): string | null => {
    // Required validation
    if (field.required && (value === undefined || value === null || value === '' || (field.type === 'checkbox' && !value))) {
      return `${field.label} مطلوب`
    }

    // Skip other validations if empty and not required
    if (!field.required && (value === undefined || value === null || value === '')) {
      return null
    }

    // Type-specific validations
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return 'البريد الإلكتروني غير صحيح'
        }
        break

      case 'number':
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
          return 'يجب أن يكون رقماً'
        }
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          return `الحد الأدنى ${field.validation.min}`
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          return `الحد الأعلى ${field.validation.max}`
        }
        break

      case 'text':
      case 'password':
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return `الحد الأدنى ${field.validation.minLength} أحرف`
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return `الحد الأعلى ${field.validation.maxLength} حرف`
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(value)) {
            return 'القيمة غير صحيحة'
          }
        }
        break
    }

    // Custom validation
    if (field.validation?.custom) {
      return field.validation.custom(value)
    }

    return null
  }

  const handleFieldChange = (field: FormField, value: any) => {
    setFormData(prev => ({ ...prev, [field.name]: value }))
    
    // Validate on change if field was touched
    if (touched[field.name]) {
      const error = validateField(field, value)
      setErrors(prev => ({
        ...prev,
        [field.name]: error || ''
      }))
    }
  }

  const handleFieldBlur = (field: FormField) => {
    setTouched(prev => ({ ...prev, [field.name]: true }))
    const error = validateField(field, formData[field.name])
    setErrors(prev => ({
      ...prev,
      [field.name]: error || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      const error = validateField(field, formData[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(newErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }))
  }

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name]
    const isTouched = touched[field.name]
    const showError = hasError && isTouched

    const baseInputClasses = cn(
      'w-full transition-colors',
      showValidationIcons && 'pr-10',
      compact ? 'py-2 text-sm' : 'py-3',
      showError && 'border-destructive focus:ring-destructive',
      field.className
    )

    return (
      <div 
        key={field.name} 
        className={cn(
          'space-y-2',
          layout === 'horizontal' && 'sm:flex sm:items-center sm:gap-4',
          layout === 'mixed' && 'sm:grid sm:grid-cols-2 sm:gap-4'
        )}
      >
        {/* Label */}
        <Label 
          htmlFor={field.name}
          className={cn(
            'font-medium',
            layout === 'horizontal' && 'sm:w-32 sm:text-right sm:flex-shrink-0',
            compact ? 'text-sm' : 'text-sm'
          )}
        >
          {field.label}
          {field.required && <span className="text-destructive mr-1">*</span>}
        </Label>

        {/* Field Container */}
        <div className={cn(
          'relative',
          layout === 'horizontal' && 'sm:flex-1',
          layout === 'mixed' && 'sm:col-start-2'
        )}>
          {/* Input/Field */}
          {field.type === 'select' ? (
            <Select
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              disabled={field.disabled}
              className={baseInputClasses}
            >
              <option value="">اختر...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : field.type === 'checkbox' ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={field.name}
                checked={formData[field.name] || false}
                onCheckedChange={(checked) => handleFieldChange(field, checked)}
                disabled={field.disabled}
              />
              <Label htmlFor={field.name} className="text-sm font-normal cursor-pointer">
                {field.helpText || 'تفعيل'}
              </Label>
            </div>
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              disabled={field.disabled}
              readOnly={field.readonly}
              required={field.required}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              className={cn(
                baseInputClasses,
                'min-h-[100px] resize-vertical'
              )}
              rows={compact ? 3 : 4}
            />
          ) : field.type === 'file' ? (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="file"
                  id={field.name}
                  name={field.name}
                  accept={field.accept}
                  multiple={field.multiple}
                  onChange={(e) => handleFieldChange(field, e.target.files)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(field.name)?.click()}
                  className="w-full justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {field.placeholder || 'اختيار ملف'}
                </Button>
              </div>
              {formData[field.name] && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                  <span className="flex-1 truncate">
                    {Array.isArray(formData[field.name]) 
                      ? `${formData[field.name].length} ملف مختار`
                      : formData[field.name].name
                    }
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFieldChange(field, null)}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type={
                  field.type === 'password' && showPasswords[field.name] 
                    ? 'text' 
                    : field.type
                }
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                onBlur={() => handleFieldBlur(field)}
                disabled={field.disabled}
                readOnly={field.readonly}
                required={field.required}
                autoComplete={field.autoComplete}
                step={field.step}
                className={cn(
                  baseInputClasses,
                  field.type === 'password' && showPasswordToggle && 'pr-10'
                )}
              />
              
              {/* Password Toggle */}
              {field.type === 'password' && showPasswordToggle && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePasswordVisibility(field.name)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  {showPasswords[field.name] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {/* Validation Icon */}
              {showValidationIcons && (showError || (isTouched && !showError)) && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  {showError ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Check className="h-4 w-4 text-success" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          {field.helpText && !showError && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {field.helpText}
            </p>
          )}

          {/* Error Message */}
          {showError && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors[field.name]}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Mobile: Single column layout */}
      <div className="block sm:hidden space-y-4">
        {fields.map(renderField)}
      </div>

      {/* Desktop: Responsive layout */}
      <div className={cn(
        'hidden sm:block space-y-4',
        layout === 'mixed' && 'grid grid-cols-1 lg:grid-cols-2 gap-6'
      )}>
        {fields.map(renderField)}
      </div>

      {/* Form Actions */}
      <div className={cn(
        'flex gap-3 pt-4 border-t',
        layout === 'horizontal' && 'sm:justify-end sm:pl-36',
        layout === 'mixed' && 'sm:col-span-2 sm:justify-end'
      )}>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || loading}
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || loading}
          className="min-w-[120px]"
        >
          {isSubmitting || loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
              جاري الحفظ...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    </form>
  )
}

// Helper component for form sections
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}