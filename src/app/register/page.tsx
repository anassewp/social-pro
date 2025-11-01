'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ButtonLoading } from '@/components/ui/Loading'
import { ROUTES, ERROR_MESSAGES, VALIDATION_RULES } from '@/lib/constants'
import { isValidEmail } from '@/lib/utils'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData
    
    if (!fullName || !email || !password || !confirmPassword) {
      return 'يرجى ملء جميع الحقول المطلوبة'
    }
    
    if (!isValidEmail(email)) {
      return 'يرجى إدخال بريد إلكتروني صحيح'
    }
    
    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      return `كلمة المرور يجب أن تكون ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} أحرف على الأقل`
    }
    
    if (password !== confirmPassword) {
      return 'كلمات المرور غير متطابقة'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    
    try {
      const { error: signUpError } = await signUp(
        formData.email, 
        formData.password,
        {
          full_name: formData.fullName,
          company_name: formData.companyName,
        }
      )
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('هذا البريد الإلكتروني مسجل مسبقاً')
        } else {
          setError(signUpError.message)
        }
      } else {
        setSuccess('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.')
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push(ROUTES.LOGIN)
        }, 3000)
      }
    } catch (err) {
      setError(ERROR_MESSAGES.NETWORK_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SocialPro</h1>
          <p className="text-gray-600">منصة التسويق الاحترافية عبر تيليجرام</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك لإنشاء حساب جديد
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل *
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="أدخل اسمك الكامل"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الشركة (اختياري)
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="أدخل اسم شركتك"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  يجب أن تكون {VALIDATION_RULES.PASSWORD_MIN_LENGTH} أحرف على الأقل
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  'إنشاء حساب'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                لديك حساب بالفعل؟{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
