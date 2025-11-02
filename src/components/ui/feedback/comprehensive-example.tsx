import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// استيراد جميع أنظمة feedback
import { 
  useToast, 
  EnhancedAlert, 
  AlertContainer, 
  useAlert, 
  EnhancedModal,
  ValidationField, 
  useValidation, 
  ContextualHelp,
  useContextualHelp,
  useTaskManager,
  TaskManager
} from '@/components/ui/feedback'

import { 
  useAudioFeedback, 
  useHapticFeedback 
} from '@/lib/feedback'

// مكون الأمثلة الشاملة
export const ComprehensiveFeedbackExample = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  })
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info' | 'confirmation'
    title: string
    description: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    description: ''
  })

  // استيراد جميع hooks
  const toast = useToast()
  const { alerts, showAlert, dismissAlert } = useAlert()
  const { validationRules, validateData } = useValidation()
  const { getHelp } = useContextualHelp()
  const { tasks } = useTaskManager()
  const audio = useAudioFeedback()
  const haptic = useHapticFeedback()

  // وظائف التجريب
  const testToastSystem = () => {
    const examples = [
      () => toast.success({
        message: 'تم حفظ البيانات بنجاح!',
        description: 'تم تحديث معلومات الملف الشخصي',
        withAudio: true,
        withHaptic: true
      }),
      
      () => toast.error({
        message: 'حدث خطأ في الحفظ',
        description: 'يرجى المحاولة مرة أخرى',
        persistent: true,
        withAudio: true,
        withHaptic: true,
        action: {
          label: 'إعادة المحاولة',
          onClick: () => console.log('Retrying...')
        }
      }),
      
      () => {
        const loadingId = toast.loading({
          message: 'جاري رفع الملفات...',
          description: 'يرجى الانتظار حتى اكتمال الرفع'
        })
        
        // محاكاة عملية
        setTimeout(() => {
          toast.dismiss(loadingId)
          toast.success({
            message: 'تم رفع الملفات بنجاح!',
            withAudio: true,
            withHaptic: true
          })
        }, 3000)
      }
    ]

    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    randomExample()
    
    // تشغيل feedback إضافي
    audio.play('click')
    haptic.trigger('click')
  }

  const testAlertSystem = () => {
    const examples = [
      () => showAlert({
        type: 'success',
        title: 'تم بنجاح!',
        description: 'تمت العملية بنجاح تام',
        withAudio: true
      }),
      
      () => showAlert({
        type: 'error',
        title: 'خطأ!',
        description: 'حدث خطأ أثناء معالجة الطلب',
        withAudio: true
      }),
      
      () => showAlert({
        type: 'warning',
        title: 'تحذير!',
        description: 'يرجى مراجعة البيانات قبل الحفظ',
        withAudio: true
      })
    ]

    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    randomExample()
  }

  const testModalSystem = () => {
    const examples = [
      {
        type: 'confirmation' as const,
        title: 'تأكيد الحذف',
        description: 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟'
      },
      {
        type: 'info' as const,
        title: 'معلومة مهمة',
        description: 'هذا مثال على نافذة منبثقة تحتوي على معلومات مفيدة'
      }
    ]

    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    setModalState({
      isOpen: true,
      ...randomExample
    })
  }

  const testValidationSystem = async () => {
    const errors = await validateData(formData, {
      email: { email: true, required: 'البريد الإلكتروني مطلوب' },
      password: { 
        required: 'كلمة المرور مطلوبة', 
        ...validationRules.password 
      },
      phone: { phoneSA: true, required: 'رقم الهاتف مطلوب' }
    })

    if (errors.length > 0) {
      // تشغيل feedback للخطأ
      audio.play('form-error')
      haptic.trigger('form-error')
      toast.error({
        message: 'خطأ في التحقق من البيانات',
        description: errors.map(e => e.message).join(', '),
        persistent: true
      })
    } else {
      // تشغيل feedback للنجاح
      audio.play('form-success')
      haptic.trigger('form-success')
      toast.success({
        message: 'جميع البيانات صحيحة!',
        description: 'يمكنك الآن إرسال النموذج'
      })
    }
  }

  const testProgressSystem = async () => {
    // إنشاء مهمة جديدة
    const taskId = Math.random().toString(36).substr(2, 9)
    
    // محاكاة عملية مع تقدم
    for (let progress = 0; progress <= 100; progress += 10) {
      setTimeout(() => {
        // هنا يتم تحديث التقدم في التطبيق الحقيقي
        console.log(`Progress: ${progress}%`)
      }, progress * 100)
    }

    // تشغيل feedback
    audio.play('load')
    haptic.trigger('loading')
  }

  const testAudioSystem = () => {
    const examples = [
      'success', 'error', 'warning', 'info', 'click', 
      'hover', 'typing', 'modal-open', 'form-success'
    ]
    
    const randomSound = examples[Math.floor(Math.random() * examples.length)]
    audio.play(randomSound as any)
    haptic.trigger('click')
  }

  const testCompleteWorkflow = async () => {
    // محاكاة workflow كامل
    
    // 1. بدء العملية
    audio.play('modal-open')
    haptic.trigger('modal-open')
    
    // 2. محاكاة التقدم
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (i === 3) {
        // خطأ في المنتصف
        audio.play('error')
        haptic.trigger('error')
        toast.error({
          message: 'خطأ مؤقت في العملية',
          description: 'سيتم إعادة المحاولة تلقائياً',
          persistent: true
        })
      } else {
        // تقدم عادي
        haptic.trigger('progress')
        if (i === 5) {
          // اكتمال
          audio.play('success')
          haptic.trigger('complete')
          toast.success({
            message: 'تمت العملية بنجاح!',
            description: 'تم إنجاز جميع الخطوات'
          })
        }
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">نظام Feedback الشامل</h1>
        <p className="text-gray-600">
          مثال متكامل يجمع جميع أنظمة feedback: Toast, Alert, Modal, Validation, Progress, Audio, و Haptic
        </p>
      </div>

      {/* Alert Container */}
      <AlertContainer />

      {/* Modal */}
      <EnhancedModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        description={modalState.description}
        confirmText="تأكيد"
        cancelText="إلغاء"
        onConfirm={() => {
          audio.play('modal-close')
          haptic.trigger('click')
          console.log('Modal confirmed')
        }}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="toast">Toast</TabsTrigger>
          <TabsTrigger value="alert">Alert</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="complete">Workflow كامل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Toast Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Toast Notifications</CardTitle>
                <CardDescription>إشعارات فورية مع أصوات واهتزاز</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testToastSystem} 
                  className="w-full"
                  variant="outline"
                >
                  تجريب Toast System
                </Button>
                <div className="text-xs text-gray-500">
                  يتضمن: أصوات مخصصة، اهتزاز، إجراءات
                </div>
              </CardContent>
            </Card>

            {/* Alert Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert System</CardTitle>
                <CardDescription>تنبيهات ونوافذ منبثقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testAlertSystem} 
                  className="w-full"
                  variant="outline"
                >
                  تجريب Alert System
                </Button>
                <Button 
                  onClick={testModalSystem} 
                  className="w-full"
                  variant="outline"
                >
                  تجريب Modal System
                </Button>
              </CardContent>
            </Card>

            {/* Validation Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation System</CardTitle>
                <CardDescription>تحقق من البيانات مع feedback فوري</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testValidationSystem} 
                  className="w-full"
                  variant="outline"
                >
                  تجريب Validation
                </Button>
              </CardContent>
            </Card>

            {/* Progress Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress System</CardTitle>
                <CardDescription>متابعة تقدم المهام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testProgressSystem} 
                  className="w-full"
                  variant="outline"
                >
                  تجريب Progress
                </Button>
              </CardContent>
            </Card>

            {/* Audio Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audio System</CardTitle>
                <CardDescription>أصوات تفاعلية متنوعة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testAudioSystem} 
                  className="w-full"
                  variant="outline"
                >
                  تجريب الأصوات
                </Button>
                <div className="text-xs text-gray-500">
                  مفعّل: {audio.isEnabled ? 'نعم' : 'لا'} | 
                  مستوى الصوت: {Math.round(audio.volume * 100)}%
                </div>
              </CardContent>
            </Card>

            {/* Complete Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow كامل</CardTitle>
                <CardDescription>دمج جميع الأنظمة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testCompleteWorkflow} 
                  className="w-full"
                  variant="default"
                >
                  تشغيل Workflow كامل
                </Button>
                <div className="text-xs text-gray-500">
                  يجمع جميع أنظمة feedback في سيناريو واحد
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="toast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toast System - التفاصيل</CardTitle>
              <CardDescription>إشعارات فورية مع تحكم متقدم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => toast.success({ message: 'نجح!' })}>
                  Success Toast
                </Button>
                <Button onClick={() => toast.error({ message: 'فشل!' })} variant="destructive">
                  Error Toast
                </Button>
                <Button onClick={() => toast.warning({ message: 'تحذير!' })} variant="secondary">
                  Warning Toast
                </Button>
                <Button onClick={() => toast.info({ message: 'معلومة' })} variant="outline">
                  Info Toast
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• كل toast يمكن أن يتضمن صوت واهتزاز مخصص</p>
                <p>• دعم الإجراءات القابلة للنقر</p>
                <p>• مواضع متعددة للشاشة</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alert" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert & Modal System - التفاصيل</CardTitle>
              <CardDescription>تنبيهات ونوافذ منبثقة متقدمة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => showAlert({ type: 'success', title: 'نجح!', description: 'تمت العملية بنجاح' })}>
                  Success Alert
                </Button>
                <Button onClick={() => showAlert({ type: 'warning', title: 'تحذير!', description: 'انتبه للخطر' })} variant="secondary">
                  Warning Alert
                </Button>
                <Button onClick={() => showAlert({ type: 'error', title: 'خطأ!', description: 'حدث خطأ' })} variant="destructive">
                  Error Alert
                </Button>
                <Button onClick={() => showAlert({ type: 'info', title: 'معلومة', description: 'معلومة مفيدة' })} variant="outline">
                  Info Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation System - التفاصيل</CardTitle>
              <CardDescription>تحقق متقدم من البيانات مع feedback فوري</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <ContextualHelp
                      data={getHelp('email')!}
                      className="ml-auto"
                    />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <ContextualHelp
                      data={getHelp('password')!}
                      className="ml-auto"
                    />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <ContextualHelp
                      data={getHelp('phone')!}
                      className="ml-auto"
                    />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0501234567"
                  />
                </div>

                <Button 
                  type="button" 
                  onClick={testValidationSystem}
                  className="w-full"
                >
                  تحقق من البيانات
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress System - التفاصيل</CardTitle>
              <CardDescription>متابعة تقدم المهام مع feedback متعدد الوسائط</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TaskManager />
              <div className="text-sm text-gray-600">
                <p>• إدارة مهام متعددة</p>
                <p>• إيقاف مؤقت واستئناف</p>
                <p>• إشعار اكتمال مع صوت واهتزاز</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow شامل - مثال متكامل</CardTitle>
              <CardDescription>سيناريو يجمع جميع أنظمة feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">التفاعل مع النماذج:</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        audio.play('modal-open')
                        haptic.trigger('modal-open')
                        toast.info({ message: 'تم فتح النموذج' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      📝 فتح النموذج
                    </Button>
                    <Button 
                      onClick={() => {
                        audio.play('form-error')
                        haptic.trigger('form-error')
                        toast.error({ 
                          message: 'خطأ في التحقق',
                          description: 'البريد الإلكتروني غير صحيح'
                        })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      ❌ خطأ في النموذج
                    </Button>
                    <Button 
                      onClick={() => {
                        audio.play('form-success')
                        haptic.trigger('form-success')
                        toast.success({ message: 'تم حفظ البيانات!' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      ✅ نجح النموذج
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">إدارة الملفات:</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        audio.play('load')
                        haptic.trigger('upload')
                        toast.loading({ message: 'جاري رفع الملف...' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      📤 بدء الرفع
                    </Button>
                    <Button 
                      onClick={() => {
                        haptic.trigger('progress')
                        toast.info({ message: '50% مكتمل' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      📊 تحديث التقدم
                    </Button>
                    <Button 
                      onClick={() => {
                        audio.play('success')
                        haptic.trigger('complete')
                        toast.success({ message: 'تم رفع الملف بنجاح!' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      🎉 اكتمال الرفع
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">السيناريو الشامل:</h4>
                <Button 
                  onClick={testCompleteWorkflow} 
                  className="w-full"
                  size="lg"
                >
                  🚀 تشغيل Workflow كامل
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  سيشمل: فتح modal → معالجة → خطأ → إعادة محاولة → نجاح → notification
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* إحصائيات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات الأنظمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <div className="text-sm text-gray-600">Running Tasks</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{audio.isEnabled ? 'ON' : 'OFF'}</div>
              <div className="text-sm text-gray-600">Audio Status</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{haptic.isEnabled ? 'ON' : 'OFF'}</div>
              <div className="text-sm text-gray-600">Haptic Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ComprehensiveFeedbackExample