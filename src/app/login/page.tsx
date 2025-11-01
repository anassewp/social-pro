'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ButtonLoading } from '@/components/ui/Loading'
import { ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants'
import { isValidEmail } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول')
      return
    }
    
    if (!isValidEmail(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح')
      return
    }

    setLoading(true)
    
    try {
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError(ERROR_MESSAGES.INVALID_CREDENTIALS)
        } else {
          setError(signInError.message)
        }
      } else {
        // Success - redirect will happen automatically via auth state change
        router.push(ROUTES.DASHBOARD)
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
            <CardTitle className="text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك للوصول إلى حسابك
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
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
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                نسيت كلمة المرور؟
              </Link>
              
              <div className="text-sm text-gray-600">
                ليس لديك حساب؟{' '}
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
