'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, Key, Shield } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ButtonLoading } from '@/components/ui/Loading'

interface AddSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionAdded: () => void
}

type Step = 'credentials' | 'phone' | 'code' | 'password' | 'success'

export function AddSessionModal({ open, onOpenChange, onSessionAdded }: AddSessionModalProps) {
  const [step, setStep] = useState<Step>('credentials')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [apiId, setApiId] = useState('')
  const [apiHash, setApiHash] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [phoneCodeHash, setPhoneCodeHash] = useState('')
  
  const { user } = useAuth()
  const supabase = createClient()

  const resetForm = () => {
    setStep('credentials')
    setApiId('')
    setApiHash('')
    setPhoneNumber('')
    setVerificationCode('')
    setPassword('')
    setPhoneCodeHash('')
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleCredentialsSubmit = () => {
    if (!apiId.trim() || !apiHash.trim()) {
      setError('يرجى إدخال API ID و API Hash')
      return
    }
    setError('')
    setStep('phone')
  }

  const sendVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      setError('يرجى إدخال رقم الهاتف')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/telegram/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber,
          apiId,
          apiHash
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إرسال كود التحقق')
      }

      setPhoneCodeHash(data.phoneCodeHash)
      setStep('code')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('يرجى إدخال كود التحقق')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/telegram/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          phoneCode: verificationCode,
          phoneCodeHash,
          apiId,
          apiHash
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needPassword) {
          setStep('password')
          return
        }
        throw new Error(data.error || 'كود التحقق غير صحيح')
      }

      await saveSession(data.sessionString, data.userInfo)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/telegram/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          password,
          phoneCodeHash,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'كلمة المرور غير صحيحة')
      }

      await saveSession(data.sessionString, data.userInfo)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveSession = async (sessionString: string, userInfo: any) => {
    try {
      // إرسال الجلسة للـ API لتشفيرها وحفظها
      const response = await fetch('/api/telegram/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionString,
          userInfo,
          phoneNumber,
          teamId: user?.team_id,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في حفظ الجلسة')
      }

      setStep('success')
      setTimeout(() => {
        handleClose()
        onSessionAdded()
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'credentials':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Key className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">معلومات API تيليجرام</h3>
              <p className="text-sm text-slate-600 mt-2">
                أدخل API ID و API Hash الخاصة بك من my.telegram.org
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiId" className="text-slate-900">API ID</Label>
                <Input
                  id="apiId"
                  name="apiId"
                  type="text"
                  autoComplete="off"
                  value={apiId}
                  onChange={(e) => setApiId(e.target.value)}
                  placeholder="12345678"
                  dir="ltr"
                  className="text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiHash" className="text-slate-900">API Hash</Label>
                <Input
                  id="apiHash"
                  name="apiHash"
                  type="text"
                  autoComplete="off"
                  value={apiHash}
                  onChange={(e) => setApiHash(e.target.value)}
                  placeholder="abcdef1234567890abcdef1234567890"
                  dir="ltr"
                  className="text-slate-900"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 للحصول على API credentials:
                </p>
                <ol className="text-xs text-blue-700 mt-2 space-y-1 mr-4">
                  <li>1. اذهب إلى <a href="https://my.telegram.org" target="_blank" className="underline">my.telegram.org</a></li>
                  <li>2. سجل الدخول برقم هاتفك</li>
                  <li>3. اذهب إلى "API development tools"</li>
                  <li>4. انسخ API ID و API Hash</li>
                </ol>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <Button 
              onClick={handleCredentialsSubmit}
              className="w-full"
            >
              التالي
            </Button>
          </div>
        )

      case 'phone':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Phone className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">إضافة جلسة تيليجرام</h3>
              <p className="text-sm text-slate-600 mt-2">
                أدخل رقم هاتفك لإنشاء جلسة تيليجرام جديدة
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-900">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+967735727752"
                dir="ltr"
              />
              <p className="text-xs text-slate-600">
                يجب أن يتضمن رمز الدولة (مثل +967 لليمن)
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={() => setStep('credentials')} 
                variant="outline"
                className="flex-1"
              >
                رجوع
              </Button>
              <Button 
                onClick={sendVerificationCode} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال كود التحقق'
                )}
              </Button>
            </div>
          </div>
        )

      case 'code':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Key className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">كود التحقق</h3>
              <p className="text-sm text-slate-600 mt-2">
                تم إرسال كود التحقق إلى تيليجرام على رقم {phoneNumber}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="text-slate-900">كود التحقق</Label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="12345"
                maxLength={5}
                dir="ltr"
                className="text-center text-lg tracking-widest"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={() => setStep('phone')} 
                variant="outline"
                className="flex-1"
              >
                رجوع
              </Button>
              <Button 
                onClick={verifyCode} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  'تحقق'
                )}
              </Button>
            </div>
          </div>
        )

      case 'password':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">التحقق بخطوتين</h3>
              <p className="text-sm text-slate-600 mt-2">
                حسابك محمي بالتحقق بخطوتين. يرجى إدخال كلمة المرور
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twoFactorPassword" className="text-slate-900">كلمة المرور</Label>
              <Input
                id="twoFactorPassword"
                name="twoFactorPassword"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={() => setStep('code')} 
                variant="outline"
                className="flex-1"
              >
                رجوع
              </Button>
              <Button 
                onClick={verifyPassword} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  'تحقق'
                )}
              </Button>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="h-12 w-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900">تم بنجاح!</h3>
            <p className="text-sm text-slate-600">
              تم إضافة جلسة تيليجرام بنجاح وحفظها بشكل آمن
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">إضافة جلسة تيليجرام</DialogTitle>
          <DialogDescription className="text-slate-600">
            أضف رقم هاتفك لإنشاء جلسة تيليجرام جديدة
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}
