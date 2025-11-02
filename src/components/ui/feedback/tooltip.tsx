import React, { useState, useRef, useEffect } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import { HelpCircle, Info, Lightbulb, AlertTriangle, X } from 'lucide-react'

// أنواع المساعدة السياقية
export type HelpType = 'info' | 'help' | 'tip' | 'warning' | 'error'

// واجهة بيانات المساعدة
export interface HelpData {
  title?: string
  content: string
  type?: HelpType
  examples?: string[]
  links?: Array<{
    text: string
    url: string
    external?: boolean
  }>
  videoUrl?: string
  imageUrl?: string
  actions?: Array<{
    text: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
}

// مكون Tooltip مساعد بسيط
const SimpleTooltip = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 500
}: {
  content: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
}) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(
              'z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              'max-w-xs'
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-popover" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

// مكون المساعدة السياقية المحسن
export const ContextualHelp = ({
  data,
  trigger,
  className = '',
  maxWidth = 'max-w-md',
  persistent = false
}: {
  data: HelpData
  trigger?: React.ReactNode
  className?: string
  maxWidth?: string
  persistent?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  const typeConfig = {
    info: {
      icon: <Info className="h-4 w-4" />,
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    help: {
      icon: <HelpCircle className="h-4 w-4" />,
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      textColor: 'text-gray-700 dark:text-gray-300'
    },
    tip: {
      icon: <Lightbulb className="h-4 w-4" />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      textColor: 'text-orange-700 dark:text-orange-300'
    },
    error: {
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300'
    }
  }

  const config = typeConfig[data.type || 'help']

  const defaultTrigger = (
    <button
      ref={triggerRef}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-1',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        config.textColor,
        className
      )}
      type="button"
    >
      {config.icon}
    </button>
  )

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <TooltipPrimitive.Trigger asChild>
          <div className="inline-block">
            {trigger || defaultTrigger}
          </div>
        </TooltipPrimitive.Trigger>
        
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={cn(
              'z-50 overflow-hidden rounded-lg border bg-popover p-4 shadow-lg',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              maxWidth
            )}
            side="right"
            align="start"
            collisionPadding={20}
          >
            <div className="space-y-4">
              {/* العنوان والأيقونة */}
              {(data.title || config.icon) && (
                <div className="flex items-start space-x-3">
                  {config.icon}
                  {data.title && (
                    <h4 className="font-semibold text-sm">{data.title}</h4>
                  )}
                  {!persistent && (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="ml-auto rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* المحتوى الرئيسي */}
              <div className={cn('text-sm space-y-3', config.textColor)}>
                <p className="leading-relaxed">{data.content}</p>

                {/* عرض الأمثلة */}
                {data.examples && data.examples.length > 0 && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowExamples(!showExamples)}
                      className={cn(
                        'text-xs underline underline-offset-2',
                        'hover:no-underline',
                        config.textColor
                      )}
                    >
                      {showExamples ? 'إخفاء الأمثلة' : 'عرض الأمثلة'}
                    </button>
                    
                    {showExamples && (
                      <div className={cn(
                        'p-3 rounded-md text-xs space-y-1',
                        config.bgColor,
                        config.borderColor,
                        'border'
                      )}>
                        <p className="font-medium">أمثلة:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {data.examples.map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* الروابط */}
                {data.links && data.links.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">روابط مفيدة:</p>
                    <div className="space-y-1">
                      {data.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target={link.external ? '_blank' : '_self'}
                          rel={link.external ? 'noopener noreferrer' : ''}
                          className={cn(
                            'inline-block text-xs underline underline-offset-2',
                            'hover:no-underline',
                            config.textColor
                          )}
                        >
                          {link.text}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* الصور أو الفيديوهات */}
                {(data.imageUrl || data.videoUrl) && (
                  <div className="space-y-2">
                    {data.imageUrl && (
                      <img
                        src={data.imageUrl}
                        alt="مثال"
                        className="rounded-md max-w-full h-auto border"
                      />
                    )}
                    {data.videoUrl && (
                      <video
                        src={data.videoUrl}
                        controls
                        className="rounded-md max-w-full h-auto border"
                      />
                    )}
                  </div>
                )}

                {/* الإجراءات */}
                {data.actions && data.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {data.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={cn(
                          'px-3 py-1.5 text-xs rounded-md font-medium transition-colors',
                          action.variant === 'primary'
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                        )}
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <TooltipPrimitive.Arrow className="fill-popover" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

// hook لإدارة المساعدة السياقية
export const useContextualHelp = () => {
  const helpLibrary: Record<string, HelpData> = {
    password: {
      title: 'متطلبات كلمة المرور',
      content: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتتضمن حرف صغير، حرف كبير، رقم، ورمز خاص.',
      type: 'help',
      examples: [
        'مثال صحيح: MyP@ssw0rd',
        'مثال صحيح: Secur3Pass!',
        'تجنب: password123'
      ],
      links: [
        { text: 'تعلم المزيد عن الأمان', url: '/security-guide' }
      ]
    },

    email: {
      title: 'تنسيق البريد الإلكتروني',
      content: 'يرجى إدخال بريد إلكتروني صحيح تنسيقه name@domain.com',
      type: 'info',
      examples: [
        'user@example.com',
        'name.lastname@company.co.uk'
      ]
    },

    phone: {
      title: 'تنسيق رقم الهاتف',
      content: 'أدخل رقم هاتف سعودي صحيح يبدأ بـ 5 ويحتوي على 9 أرقام.',
      type: 'warning',
      examples: [
        '0501234567',
        '+966501234567'
      ]
    },

    form: {
      title: 'نصائح ملء النموذج',
      content: 'تأكد من ملء جميع الحقول المطلوبة قبل الإرسال.',
      type: 'tip',
      actions: [
        {
          text: 'معاينة البيانات',
          onClick: () => console.log('Preview data'),
          variant: 'secondary'
        }
      ]
    }
  }

  const getHelp = (key: string): HelpData | null => {
    return helpLibrary[key] || null
  }

  const addHelp = (key: string, helpData: HelpData) => {
    helpLibrary[key] = helpData
  }

  return { getHelp, addHelp, helpLibrary }
}

// مكون حاوي للمساعدة السياقية مع التكامل
export const HelpProvider = ({ 
  children, 
  showGlobalHelp = true 
}: { 
  children: React.ReactNode
  showGlobalHelp?: boolean
}) => {
  const { helpLibrary } = useContextualHelp()

  if (!showGlobalHelp) return <>{children}</>

  return (
    <div className="help-provider">
      {children}
      
      {/* زر المساعدة العامة */}
      <div className="fixed bottom-4 right-4 z-50">
        <ContextualHelp
          data={{
            title: 'المساعدة العامة',
            content: 'مرحباً! كيف يمكنني مساعدتك؟',
            type: 'help',
            links: [
              { text: 'الوثائق', url: '/docs', external: true },
              { text: 'الدعم التقني', url: '/support' },
              { text: 'الأسئلة الشائعة', url: '/faq' }
            ]
          }}
          maxWidth="max-w-sm"
        >
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors">
            <HelpCircle className="h-6 w-6" />
          </button>
        </ContextualHelp>
      </div>
    </div>
  )
}

// مثال على الاستخدام
export const HelpTooltipExample = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  })

  const { getHelp } = useContextualHelp()

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h3 className="text-lg font-semibold text-center">نموذج مع المساعدة السياقية</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">البريد الإلكتروني</label>
            <ContextualHelp
              data={getHelp('email')!}
              className="ml-auto"
            />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="user@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">كلمة المرور</label>
            <ContextualHelp
              data={getHelp('password')!}
              className="ml-auto"
            />
          </div>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">رقم الهاتف</label>
            <ContextualHelp
              data={getHelp('phone')!}
              className="ml-auto"
            />
          </div>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0501234567"
          />
        </div>

        <ContextualHelp
          data={getHelp('form')!}
          className="w-full"
          persistent
        >
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
            إرسال مع المساعدة
          </button>
        </ContextualHelp>
      </div>
    </div>
  )
}

export default ContextualHelp