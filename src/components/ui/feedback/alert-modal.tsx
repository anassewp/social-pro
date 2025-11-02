import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  X
} from 'lucide-react'

// أنواع التنبيهات
export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirmation'

// واجهة بيانات Alert
export interface AlertData {
  title: string
  description?: string
  type: AlertType
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  persistent?: boolean
  withIcon?: boolean
  withAudio?: boolean
}

// مكون Alert محسن
export const EnhancedAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data: AlertData
    onDismiss?: () => void
  }
>(({ data, onDismiss, className, ...props }, ref) => {
  const {
    title,
    description,
    type,
    persistent = false,
    withIcon = true
  } = data

  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    confirmation: <AlertCircle className="h-5 w-5 text-blue-500" />
  }

  const variantMap = {
    success: 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800',
    error: 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800',
    warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800',
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800',
    confirmation: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800'
  }

  return (
    <Alert
      ref={ref}
      className={`${variantMap[type]} ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {withIcon && iconMap[type]}
          <div className="space-y-1 flex-1">
            {title && (
              <AlertTitle className="text-base font-semibold">
                {title}
              </AlertTitle>
            )}
            {description && (
              <AlertDescription className="text-sm text-muted-foreground">
                {description}
              </AlertDescription>
            )}
          </div>
        </div>
        
        {!persistent && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  )
})

EnhancedAlert.displayName = 'EnhancedAlert'

// hook لإدارة Alerts
export const useAlert = () => {
  const [alerts, setAlerts] = React.useState<Array<{
    id: string
    data: AlertData
  }>>([])

  const showAlert = (data: AlertData) => {
    const id = Math.random().toString(36).substr(2, 9)
    setAlerts(prev => [...prev, { id, data }])
    
    // تشغيل الصوت
    if (data.withAudio !== false) {
      playAlertSound(data.type)
    }
    
    return id
  }

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const clearAllAlerts = () => {
    setAlerts([])
  }

  return {
    alerts,
    showAlert,
    dismissAlert,
    clearAllAlerts,
    success: (data: Omit<AlertData, 'type'>) => showAlert({ ...data, type: 'success' }),
    error: (data: Omit<AlertData, 'type'>) => showAlert({ ...data, type: 'error' }),
    warning: (data: Omit<AlertData, 'type'>) => showAlert({ ...data, type: 'warning' }),
    info: (data: Omit<AlertData, 'type'>) => showAlert({ ...data, type: 'info' }),
    confirmation: (data: Omit<AlertData, 'type'>) => showAlert({ ...data, type: 'confirmation' })
  }
}

// مكون حاوي للأليرتس
export const AlertContainer = () => {
  const { alerts, dismissAlert } = useAlert()

  if (alerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {alerts.map((alert) => (
        <EnhancedAlert
          key={alert.id}
          data={alert.data}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))}
    </div>
  )
}

// مكون Modal محسن
export interface EnhancedModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  type?: AlertType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  type = 'info',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  size = 'md',
  closable = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  }

  const iconMap = {
    success: <CheckCircle className="h-8 w-8 text-green-500" />,
    error: <XCircle className="h-8 w-8 text-red-500" />,
    warning: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
    info: <Info className="h-8 w-8 text-blue-500" />,
    confirmation: <AlertCircle className="h-8 w-8 text-blue-500" />
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closable ? onClose : undefined}>
      <DialogContent 
        className={`${sizeClasses[size]} ${className}`}
        onClick={handleOverlayClick}
      >
        <DialogHeader>
          {type !== 'info' && iconMap[type] && (
            <div className="flex justify-center mb-4">
              {iconMap[type]}
            </div>
          )}
          
          {title && (
            <DialogTitle className="text-center text-lg font-semibold">
              {title}
            </DialogTitle>
          )}
          
          {description && (
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {children}
        </div>

        {(onConfirm || cancelText) && (
          <DialogFooter className="flex-col sm:flex-col gap-2">
            {onConfirm && (
              <Button 
                onClick={handleConfirm}
                className={
                  type === 'error' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : type === 'warning'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : ''
                }
              >
                {confirmText}
              </Button>
            )}
            
            {cancelText && (
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                {cancelText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// دالة تشغيل صوت التنبيه
const playAlertSound = (type: AlertType) => {
  if (typeof window === 'undefined') return
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  const frequencies = {
    success: [523, 659, 784], // Do, Mi, Sol
    error: [220, 185, 155], // A, F#, D
    warning: [440, 392, 349], // A, G, F
    info: [349, 440], // F, A
    confirmation: [440, 523] // A, Do
  }
  
  const frequency = frequencies[type][0]
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

// مثال على الاستخدام
export const AlertModalExample = () => {
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean
    type: AlertType
    title: string
    description: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    description: ''
  })

  const showModal = (type: AlertType, title: string, description: string) => {
    setModalState({ isOpen: true, type, title, description })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">أمثلة على Alerts</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => showModal('success', 'تم بنجاح!', 'تمت العملية بنجاح تام')}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            عرض Success Alert
          </Button>
          
          <Button
            variant="outline"
            onClick={() => showModal('error', 'خطأ!', 'حدث خطأ أثناء معالجة الطلب')}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            عرض Error Alert
          </Button>
          
          <Button
            variant="outline"
            onClick={() => showModal('warning', 'تحذير!', 'يرجى مراجعة البيانات قبل الحفظ')}
            className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
          >
            عرض Warning Alert
          </Button>
          
          <Button
            variant="outline"
            onClick={() => showModal('info', 'معلومة!', 'تحديث متوفر للتطبيق')}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            عرض Info Alert
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">أمثلة على Modals</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => showModal('confirmation', 'تأكيد الحذف', 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟')}
          >
            عرض Confirmation Modal
          </Button>
          
          <Button
            onClick={() => showModal('info', 'تفاصيل', 'هذا مثال على نافذة منبثقة تحتوي على تفاصيل إضافية')}
          >
            عرض Info Modal
          </Button>
        </div>
      </div>

      <EnhancedModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        description={modalState.description}
        onConfirm={() => console.log('Confirmed!')}
        confirmText="تأكيد"
        cancelText="إلغاء"
      />
    </div>
  )
}