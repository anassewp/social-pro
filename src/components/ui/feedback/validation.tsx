import React from 'react'
import { useForm, FieldValues, Path, RegisterOptions } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from './toast'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

// أنواع أخطاء التحقق
export type ValidationErrorType = 
  | 'required' 
  | 'minLength' 
  | 'maxLength' 
  | 'pattern' 
  | 'min' 
  | 'max' 
  | 'email' 
  | 'custom'

// واجهة بيانات الخطأ
export interface ValidationError {
  field: string
  type: ValidationErrorType
  message: string
  value?: any
}

// واجهة إعدادات التحقق
export interface ValidationConfig {
  required?: boolean | string
  minLength?: { value: number; message: string }
  maxLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  min?: { value: number; message: string }
  max?: { value: number; message: string }
  email?: boolean | string
  custom?: (value: any, formData: any) => boolean | string
  validate?: Record<string, (value: any) => boolean | string>
}

// واجهة مكون التحقق من الحقل
export interface ValidationFieldProps<T extends FieldValues> {
  name: Path<T>
  register: ReturnType<typeof useForm<T>>['register']
  errors: Record<string, any>
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  validation?: ValidationConfig
  className?: string
  showSuccess?: boolean
  persistent?: boolean
}

// مكون عرض حالة الحقل مع التحقق
export function ValidationField<T extends FieldValues>({
  name,
  register,
  errors,
  label,
  placeholder,
  type = 'text',
  required,
  validation,
  className = '',
  showSuccess = true,
  persistent = false
}: ValidationFieldProps<T>) {
  const hasError = !!errors[name]
  const hasSuccess = showSuccess && !hasError && Object.keys(errors).length > 0

  const getIcon = () => {
    if (hasError) return <XCircle className="h-4 w-4 text-red-500" />
    if (hasSuccess) return <CheckCircle className="h-4 w-4 text-green-500" />
    return null
  }

  const getFieldState = () => {
    if (hasError) return 'border-red-500 focus:border-red-500 focus:ring-red-500'
    if (hasSuccess) return 'border-green-500 focus:border-green-500 focus:ring-green-500'
    return ''
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${getFieldState()}`}
          {...register(name, {
            required: required ? (typeof required === 'string' ? required : 'هذا الحقل مطلوب') : false,
            ...validation
          })}
        />
        
        {getIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getIcon()}
          </div>
        )}
      </div>

      {errors[name] && (
        <div className="space-y-1">
          <Alert variant="destructive" className="py-2">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {errors[name]?.message || 'خطأ في التحقق من البيانات'}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {hasSuccess && (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs">مُدخل صحيح</span>
        </div>
      )}
    </div>
  )
}

// hook لإدارة التحقق المتقدم
export const useValidation = () => {
  const { showToast } = useToast()

  // قواعد التحقق المخصصة
  const validationRules = {
    // التحقق من كلمة المرور
    password: {
      minLength: { value: 8, message: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل' },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'كلمة المرور يجب أن تحتوي على حرف صغير، كبير، رقم، ورمز خاص'
      }
    },

    // التحقق من رقم الهاتف السعودي
    phoneSA: {
      pattern: {
        value: /^(\+966|0)?[5-9]\d{8}$/,
        message: 'رقم الهاتف غير صحيح'
      }
    },

    // التحقق من البريد الإلكتروني
    email: {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'البريد الإلكتروني غير صحيح'
      }
    },

    // التحقق من الرقم الوطني
    nationalId: {
      minLength: { value: 10, message: 'الرقم الوطني يجب أن يحتوي على 10 أرقام' },
      maxLength: { value: 10, message: 'الرقم الوطني يجب أن يحتوي على 10 أرقام' },
      pattern: {
        value: /^\d{10}$/,
        message: 'الرقم الوطني يجب أن يحتوي على أرقام فقط'
      }
    }
  }

  // التحقق من البيانات مع رسائل مخصصة
  const validateData = (data: Record<string, any>, rules: Record<string, ValidationConfig>) => {
    const errors: ValidationError[] = []
    const validations: Array<Promise<ValidationError | null>> = []

    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName]
      const value = data[fieldName]

      validations.push(
        new Promise((resolve) => {
          if (fieldRules?.required && (!value || value.toString().trim() === '')) {
            resolve({
              field: fieldName,
              type: 'required',
              message: typeof fieldRules.required === 'string' ? fieldRules.required : 'هذا الحقل مطلوب',
              value
            })
            return
          }

          if (value && fieldRules?.minLength && value.length < fieldRules.minLength.value) {
            resolve({
              field: fieldName,
              type: 'minLength',
              message: fieldRules.minLength.message,
              value
            })
            return
          }

          if (value && fieldRules?.maxLength && value.length > fieldRules.maxLength.value) {
            resolve({
              field: fieldName,
              type: 'maxLength',
              message: fieldRules.maxLength.message,
              value
            })
            return
          }

          if (value && fieldRules?.pattern && !fieldRules.pattern.value.test(value)) {
            resolve({
              field: fieldName,
              type: 'pattern',
              message: fieldRules.pattern.message,
              value
            })
            return
          }

          if (value && fieldRules?.min && value < fieldRules.min.value) {
            resolve({
              field: fieldName,
              type: 'min',
              message: fieldRules.min.message,
              value
            })
            return
          }

          if (value && fieldRules?.max && value > fieldRules.max.value) {
            resolve({
              field: fieldName,
              type: 'max',
              message: fieldRules.max.message,
              value
            })
            return
          }

          if (value && fieldRules?.email && !validationRules.email.pattern.value.test(value)) {
            resolve({
              field: fieldName,
              type: 'email',
              message: 'البريد الإلكتروني غير صحيح',
              value
            })
            return
          }

          if (value && fieldRules?.custom) {
            const customResult = fieldRules.custom(value, data)
            if (customResult !== true && customResult !== undefined) {
              resolve({
                field: fieldName,
                type: 'custom',
                message: typeof customResult === 'string' ? customResult : 'خطأ في التحقق',
                value
              })
              return
            }
          }

          if (value && fieldRules?.validate) {
            Object.entries(fieldRules.validate).forEach(([key, validateFn]) => {
              const result = validateFn(value)
              if (result !== true && result !== undefined) {
                resolve({
                  field: fieldName,
                  type: 'custom',
                  message: typeof result === 'string' ? result : 'خطأ في التحقق',
                  value
                })
              }
            })
          }

          resolve(null)
        })
      )
    })

    return Promise.all(validations).then(results => {
      return results.filter(error => error !== null) as ValidationError[]
    })
  }

  // عرض errors كـ toast
  const showValidationErrors = (errors: ValidationError[]) => {
    if (errors.length === 0) return

    const errorMessages = errors.map(error => `• ${error.message}`).join('\n')
    
    showToast({
      type: 'error',
      title: 'خطأ في البيانات',
      message: errorMessages,
      persistent: true,
      duration: 8000
    })
  }

  // عرض رسالة نجاح
  const showValidationSuccess = (message: string = 'تم التحقق من البيانات بنجاح!') => {
    showToast({
      type: 'success',
      message,
      duration: 3000
    })
  }

  return {
    validationRules,
    validateData,
    showValidationErrors,
    showValidationSuccess
  }
}

// مكون ملخص التحقق
export const ValidationSummary = ({ 
  errors, 
  className = '' 
}: { 
  errors: ValidationError[]
  className?: string 
}) => {
  if (errors.length === 0) return null

  return (
    <Alert variant="destructive" className={className}>
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-medium">يرجى تصحيح الأخطاء التالية:</p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// مثال على الاستخدام
export const ValidationExample = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { validateData, showValidationErrors } = useValidation()
  const toast = useToast()

  const onSubmit = async (data: any) => {
    const validationRules = {
      email: { email: true, required: 'البريد الإلكتروني مطلوب' },
      password: { required: 'كلمة المرور مطلوبة', ...validationRules.password },
      phone: { phoneSA: true, required: 'رقم الهاتف مطلوب' }
    }

    const validationErrors = await validateData(data, validationRules)
    
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors)
      return
    }

    toast.success({
      message: 'تم التحقق من البيانات بنجاح!',
      description: 'يمكنك الآن إرسال النموذج'
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto p-6">
      <h3 className="text-lg font-semibold text-center">نموذج مع التحقق المحسن</h3>

      <ValidationField
        name="email"
        register={register}
        errors={errors}
        label="البريد الإلكتروني"
        type="email"
        required="البريد الإلكتروني مطلوب"
        validation={{
          email: true,
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'البريد الإلكتروني غير صحيح'
          }
        }}
      />

      <ValidationField
        name="password"
        register={register}
        errors={errors}
        label="كلمة المرور"
        type="password"
        required="كلمة المرور مطلوبة"
        validation={{
          minLength: { value: 8, message: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل' },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            message: 'يجب أن تحتوي على حرف صغير، كبير، رقم، ورمز خاص'
          }
        }}
      />

      <ValidationField
        name="phone"
        register={register}
        errors={errors}
        label="رقم الهاتف"
        type="tel"
        required="رقم الهاتف مطلوب"
        validation={{
          phoneSA: true
        }}
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
      >
        إرسال
      </button>
    </form>
  )
}

export default ValidationField