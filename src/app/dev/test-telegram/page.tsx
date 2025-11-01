'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Phone, Key, Shield, CheckCircle, XCircle } from 'lucide-react'
import { generateEncryptionKey, validateEncryptionKey, encrypt, decrypt } from '@/lib/encryption'

export default function TestTelegramPage() {
  const [results, setResults] = useState<string[]>([])
  const [testPhone, setTestPhone] = useState('+966501234567')
  const [loading, setLoading] = useState(false)

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setResults(prev => [...prev, `${icon} ${message}`])
  }

  const clearResults = () => setResults([])

  const testEnvironmentVariables = () => {
    clearResults()
    addResult('فحص متغيرات البيئة...', 'info')
    
    const apiId = process.env.NEXT_PUBLIC_TELEGRAM_API_ID
    const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    
    if (!apiId || apiId === 'your_telegram_api_id') {
      addResult('TELEGRAM_API_ID غير موجود أو لم يتم تعديله', 'error')
    } else {
      addResult(`TELEGRAM_API_ID: ${apiId}`, 'success')
    }
    
    if (!apiHash || apiHash === 'your_telegram_api_hash') {
      addResult('TELEGRAM_API_HASH غير موجود أو لم يتم تعديله', 'error')
    } else {
      addResult(`TELEGRAM_API_HASH: ${apiHash.substring(0, 10)}...`, 'success')
    }
    
    if (!encryptionKey) {
      addResult('ENCRYPTION_KEY غير موجود', 'error')
    } else if (validateEncryptionKey(encryptionKey)) {
      addResult('ENCRYPTION_KEY صالح', 'success')
    } else {
      addResult('ENCRYPTION_KEY غير صالح', 'error')
    }
  }

  const testEncryption = () => {
    clearResults()
    addResult('اختبار نظام التشفير...', 'info')
    
    try {
      const testData = 'test-telegram-session-data-12345'
      const key = generateEncryptionKey()
      
      addResult(`إنشاء مفتاح تشفير: ${key.substring(0, 16)}...`, 'info')
      
      const encrypted = encrypt(testData, key)
      addResult(`تشفير البيانات: ${encrypted.substring(0, 20)}...`, 'success')
      
      const decrypted = decrypt(encrypted, key)
      addResult(`فك التشفير: ${decrypted}`, 'success')
      
      if (decrypted === testData) {
        addResult('نظام التشفير يعمل بشكل صحيح!', 'success')
      } else {
        addResult('خطأ في نظام التشفير!', 'error')
      }
    } catch (error) {
      addResult(`خطأ في التشفير: ${error}`, 'error')
    }
  }

  const testTelegramConnection = async () => {
    setLoading(true)
    clearResults()
    addResult('اختبار الاتصال بـ Telegram API...', 'info')
    
    try {
      // This would be implemented with actual Telegram API call
      addResult('هذا الاختبار سيتم تطويره بعد إضافة API Keys', 'info')
      addResult('يرجى إضافة TELEGRAM_API_ID و TELEGRAM_API_HASH أولاً', 'info')
      
      // Simulate API check
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const apiId = process.env.NEXT_PUBLIC_TELEGRAM_API_ID
      const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH
      
      if (apiId && apiHash && apiId !== 'your_telegram_api_id' && apiHash !== 'your_telegram_api_hash') {
        addResult('API Keys موجودة - جاهز للاختبار الفعلي', 'success')
      } else {
        addResult('يرجى إضافة API Keys من Telegram', 'error')
      }
      
    } catch (error) {
      addResult(`خطأ: ${error}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const validatePhoneNumber = () => {
    clearResults()
    addResult('التحقق من صحة رقم الهاتف...', 'info')
    
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    
    if (!testPhone) {
      addResult('يرجى إدخال رقم هاتف', 'error')
      return
    }
    
    if (phoneRegex.test(testPhone)) {
      addResult(`رقم الهاتف صحيح: ${testPhone}`, 'success')
      addResult('يمكن استخدامه لإنشاء جلسة تيليجرام', 'success')
    } else {
      addResult('رقم الهاتف غير صحيح', 'error')
      addResult('يجب أن يبدأ برمز الدولة (مثل +966)', 'info')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">اختبار Telegram API</h1>
          <p className="text-slate-600">اختبار الإعدادات والاتصال بـ Telegram</p>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Key className="h-4 w-4 ml-2" />
                متغيرات البيئة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testEnvironmentVariables} className="w-full" size="sm">
                فحص المتغيرات
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Shield className="h-4 w-4 ml-2" />
                نظام التشفير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testEncryption} variant="outline" className="w-full" size="sm">
                اختبار التشفير
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Phone className="h-4 w-4 ml-2" />
                رقم الهاتف
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+966501234567"
                className="text-sm"
              />
              <Button onClick={validatePhoneNumber} variant="outline" className="w-full" size="sm">
                تحقق
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <CheckCircle className="h-4 w-4 ml-2" />
                اتصال API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testTelegramConnection} 
                disabled={loading}
                variant="outline" 
                className="w-full" 
                size="sm"
              >
                {loading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              نتائج الاختبار
              <Button onClick={clearResults} variant="ghost" size="sm">
                مسح النتائج
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm min-h-[200px]">
              {results.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  اضغط على أي زر لبدء الاختبار
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>تعليمات الإعداد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. احصل على Telegram API Keys:</h4>
              <p className="text-slate-600">
                اذهب إلى <a href="https://my.telegram.org/auth" target="_blank" className="text-blue-600 underline">my.telegram.org/auth</a> وأنشئ تطبيق جديد
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. أضف المفاتيح لملف .env.local:</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
{`TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. أعد تشغيل الخادم:</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs">
                npm run dev
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
