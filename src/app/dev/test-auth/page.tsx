'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testConnection = async () => {
    setLoading(true)
    setResult('جاري الاختبار...')
    
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from('teams').select('count').limit(1)
      
      if (error) {
        setResult(`خطأ في الاتصال: ${error.message}`)
      } else {
        setResult('✅ الاتصال بـ Supabase يعمل بنجاح!')
      }
    } catch (err) {
      setResult(`خطأ: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testSignUp = async () => {
    if (!email || !password) {
      setResult('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    setLoading(true)
    setResult('جاري إنشاء الحساب...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })
      
      if (error) {
        setResult(`خطأ في إنشاء الحساب: ${error.message}`)
      } else if (data.user) {
        setResult(`✅ تم إنشاء الحساب بنجاح! User ID: ${data.user.id}`)
      } else {
        setResult('لم يتم إنشاء المستخدم')
      }
    } catch (err) {
      setResult(`خطأ: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>اختبار المصادقة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="w-full"
          >
            اختبار الاتصال بـ Supabase
          </Button>
          
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              onClick={testSignUp} 
              disabled={loading}
              className="w-full"
            >
              اختبار إنشاء حساب
            </Button>
          </div>
          
          {result && (
            <div className="p-3 bg-gray-100 rounded-md text-sm">
              {result}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
