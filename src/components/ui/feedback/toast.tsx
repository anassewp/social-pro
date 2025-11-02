import { toast, Toaster } from 'sonner'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import React from 'react'

// أنواع الإشعارات
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

// واجهة بيانات Toast
export interface ToastData {
  id?: string
  title?: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  description?: string
  persistent?: boolean
  withAudio?: boolean
  withHaptic?: boolean
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

// hook لإدارة Toast notifications
export const useToast = () => {
  const showToast = (data: ToastData) => {
    const {
      id,
      title,
      message,
      type,
      duration = 5000,
      action,
      description,
      persistent = false,
      withAudio = true,
      withHaptic = true,
      position = 'top-right'
    } = data

    // تشغيل الصوت والاهتزاز إذا كانت مفعلة
    if (withAudio) {
      playNotificationSound(type)
    }
    
    if (withHaptic && 'vibrate' in navigator) {
      triggerHapticFeedback(type)
    }

    const iconMap = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />,
      loading: <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
    }

    const classNameMap = {
      success: 'border-green-500/50 bg-green-50 dark:bg-green-950/20',
      error: 'border-red-500/50 bg-red-50 dark:bg-red-950/20',
      warning: 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20',
      info: 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/20',
      loading: 'border-gray-500/50 bg-gray-50 dark:bg-gray-950/20'
    }

    const toastConfig = {
      id,
      title: title || '',
      description: description || '',
      duration: persistent ? Infinity : duration,
      action: action ? (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      ) : undefined,
      className: classNameMap[type],
      icon: iconMap[type],
      position
    }

    switch (type) {
      case 'success':
        return toast.success(message, toastConfig)
      case 'error':
        return toast.error(message, toastConfig)
      case 'warning':
        return toast.warning(message, toastConfig)
      case 'info':
        return toast.info(message, toastConfig)
      case 'loading':
        return toast.loading(message, toastConfig)
      default:
        return toast(message, toastConfig)
    }
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }

  return {
    showToast,
    dismiss,
    success: (data: Omit<ToastData, 'type'>) => showToast({ ...data, type: 'success' }),
    error: (data: Omit<ToastData, 'type'>) => showToast({ ...data, type: 'error' }),
    warning: (data: Omit<ToastData, 'type'>) => showToast({ ...data, type: 'warning' }),
    info: (data: Omit<ToastData, 'type'>) => showToast({ ...data, type: 'info' }),
    loading: (data: Omit<ToastData, 'type'>) => showToast({ ...data, type: 'loading' }),
    promise: toast.promise
  }
}

// مكونات Toast المحسنة
export const EnhancedToaster = () => {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      visibleToasts={5}
      toastOptions={{
        style: {
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        className: 'toast-enhanced'
      }}
    />
  )
}

// دالة تشغيل الأصوات
const playNotificationSound = (type: ToastType) => {
  if (typeof window === 'undefined') return
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  // تخصيص نبرة الصوت حسب نوع الإشعار
  const frequencies = {
    success: [523, 659], // Do, Mi
    error: [220, 185], // A, F#
    warning: [440, 392], // A, G
    info: [349, 440], // F, A
    loading: [440] // A فقط
  }
  
  const frequency = frequencies[type][0]
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

// دالة تفعيل الاهتزاز
const triggerHapticFeedback = (type: ToastType) => {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  
  const patterns = {
    success: [100, 50, 100], // اهتزاز قصير - توقف - اهتزاز قصير
    error: [300], // اهتزاز طويل
    warning: [150, 75, 150, 75, 150], // ثلاث اهتزازات قصيرة
    info: [100], // اهتزاز واحد قصير
    loading: [0] // بدون اهتزاز
  }
  
  navigator.vibrate(patterns[type])
}

// مثال على الاستخدام
export const ToastExample = () => {
  const toast = useToast()

  const examples = [
    () => toast.success({
      message: 'تم حفظ البيانات بنجاح!',
      description: 'تم تحديث معلومات الملف الشخصي',
      duration: 3000
    }),
    
    () => toast.error({
      message: 'حدث خطأ في الحفظ',
      description: 'يرجى المحاولة مرة أخرى',
      persistent: true,
      action: {
        label: 'إعادة المحاولة',
        onClick: () => console.log('Retrying...')
      }
    }),
    
    () => toast.warning({
      message: 'تحذير: مساحة التخزين ممتلئة',
      description: 'لم يتبق سوى 10% من مساحة التخزين',
      duration: 8000
    }),
    
    () => toast.info({
      message: 'تحديث متوفر',
      description: 'يتوفر تحديث جديد للتطبيق',
      action: {
        label: 'تحديث الآن',
        onClick: () => console.log('Updating...')
      }
    }),
    
    () => {
      const loadingToast = toast.loading({
        message: 'جاري رفع الملفات...',
        description: 'يرجى الانتظار حتى اكتمال الرفع'
      })
      
      // محاكاة عملية طويلة
      setTimeout(() => {
        toast.dismiss(loadingToast)
        toast.success({
          message: 'تم رفع الملفات بنجاح!',
          description: 'تم رفع 5 ملفات من أصل 5'
        })
      }, 3000)
    }
  ]

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">أمثلة على Toast Notifications</h3>
      <div className="grid grid-cols-2 gap-4">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={example}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            تشغيل مثال {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export { toast }