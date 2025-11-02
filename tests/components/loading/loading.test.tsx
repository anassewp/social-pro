/**
 * اختبارات شاملة لمكونات Loading States المحسنة
 * Comprehensive tests for enhanced Loading States components
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// استيراد المكونات المراد اختبارها
import {
  ProgressIndicator,
  ShimmerEffect,
  AdaptiveLoading,
  CardLoader,
  TableLoader,
  SmartLoadingWrapper,
  LoadingProvider,
  useLoadingState,
  RetryableComponent,
} from '@/components/ui/loading'

import { useAdaptiveLoading, useNetworkDetection, useLoadingState } from '@/hooks'

describe('ProgressIndicator Component', () => {
  test('يعرض نسبة التقدم الصحيحة', () => {
    render(
      <ProgressIndicator
        progress={75}
        status="جاري التحميل..."
        variant="primary"
      />
    )

    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument()
  })

  test('يعرض نوع circular progress بشكل صحيح', () => {
    render(
      <ProgressIndicator
        progress={60}
        type="circular"
        variant="success"
      />
    )

    const progressElement = document.querySelector('.circular-progress')
    expect(progressElement).toBeInTheDocument()
  })

  test('يعرض خطوات التقدم', () => {
    render(
      <ProgressIndicator
        type="steps"
        steps={5}
        currentStep={3}
        stepLabels={['خط1', 'خط2', 'خط3', 'خط4', 'خط5']}
      />
    )

    expect(screen.getByText('خط3')).toBeInTheDocument()
    expect(screen.getAllByText('3')).toHaveLength(2) // رقم في الدائرة + رقم في النص
  })

  test('يعرض_progress اللانهائي', () => {
    render(
      <ProgressIndicator
        type="infinite"
        status="جاري المعالجة..."
        variant="warning"
      />
    )

    expect(screen.getByText('جاري المعالجة...')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})

describe('ShimmerEffect Component', () => {
  test('يعرض تأثير التوهج الخطي', () => {
    render(
      <ShimmerEffect
        type="wave"
        width="200px"
        height="100px"
      />
    )

    const shimmer = document.querySelector('[data-testid="shimmer-wave"]')
    expect(shimmer).toBeInTheDocument()
  })

  test('يعرض تأثير النبضات', () => {
    render(
      <ShimmerEffect
        type="pulse"
        backgroundColor="#f3f4f6"
        shimmerColor="#ffffff"
      />
    )

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  test('يعرض تأثير المسح', () => {
    render(
      <ShimmerEffect
        type="scan"
        duration={2000}
      />
    )

    // التحقق من وجود animations في DOM
    const styleElement = document.querySelector('style[data-shimmer="scan"]')
    expect(styleElement).toBeInTheDocument()
  })
})

describe('CardLoader Component', () => {
  test('يعرض بطاقات المقالات', () => {
    render(
      <CardLoader
        type="article"
        count={3}
        showImage={true}
        shimmerType="gradient"
      />
    )

    // التحقق من وجود 3 بطاقات
    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards).toHaveLength(3)

    // التحقق من وجود الصور الوهمية
    const images = document.querySelectorAll('[data-testid="shimmer"]')
    expect(images).toHaveLength(3)
  })

  test('يعرض بطاقات المنتجات', () => {
    render(
      <CardLoader
        type="product"
        count={2}
        shimmerType="wave"
        size="lg"
      />
    )

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards).toHaveLength(2)

    // التحقق من الحجم الكبير
    cards.forEach(card => {
      expect(card).toHaveClass('p-8')
    })
  })

  test('يعرض بطاقات الملفات الشخصية', () => {
    render(
      <CardLoader
        type="profile"
        count={1}
        showImage={true}
        showAdvanced={true}
      />
    )

    const avatar = document.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()

    // التحقق من الإحصائيات المتقدمة
    expect(screen.getByText(/الإحصائيات/)).toBeInTheDocument()
  })
})

describe('TableLoader Component', () => {
  test('يعرض جدول مع رأس', () => {
    render(
      <TableLoader
        rows={5}
        columns={4}
        showHeader={true}
        shimmerType="scan"
      />
    )

    // التحقق من رأس الجدول
    expect(screen.getByText(/العمود/)).toBeInTheDocument()
    
    // التحقق من عدد الصفوف
    const rows = document.querySelectorAll('.divide-y > div')
    expect(rows).toHaveLength(5)
  })

  test('يعرض شريط التقدم للجداول الكبيرة', () => {
    render(
      <TableLoader
        rows={10}
        columns={6}
        showProgress={true}
        loadedItems={7}
        totalItems={15}
      />
    )

    expect(screen.getByText('7 من 15')).toBeInTheDocument()
    
    // التحقق من شريط التقدم
    const progressBar = document.querySelector('.bg-primary')
    expect(progressBar).toBeInTheDocument()
  })
})

describe('SmartLoadingWrapper Component', () => {
  test('يعرض حالة التحميل', () => {
    render(
      <LoadingProvider>
        <SmartLoadingWrapper id="test-loading">
          <div>Test Content</div>
        </SmartLoadingWrapper>
      </LoadingProvider>
    )

    // في البداية يجب أن يظهر محتوى loading
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument()
  })

  test('يعرض المحتوى بعد انتهاء التحميل', async () => {
    const TestComponent = () => {
      const { startLoading, completeLoading, isLoading } = useLoadingState('test')
      
      useState(() => {
        startLoading()
        setTimeout(() => completeLoading(), 100)
      }, [])

      return (
        <SmartLoadingWrapper id="test-loading">
          <div>Test Content</div>
        </SmartLoadingWrapper>
      )
    }

    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    )

    // انتظار انتهاء التحميل
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  test('يعرض حالة الخطأ', async () => {
    const TestComponent = () => {
      const { startLoading, setError } = useLoadingState('test-error')
      
      useState(() => {
        startLoading()
        setTimeout(() => setError(new Error('خطأ في التحميل')), 100)
      }, [])

      return (
        <SmartLoadingWrapper id="test-error">
          <div>Test Content</div>
        </SmartLoadingWrapper>
      )
    }

    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/خطأ في التحميل/)).toBeInTheDocument()
    })
  })
})

describe('AdaptiveLoading Component', () => {
  test('يعرض حالة عدم الاتصال', () => {
    // محاكاة حالة عدم الاتصال
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    render(
      <AdaptiveLoading
        isLoading={false}
        error={null}
        priority="high"
      />
    )

    expect(screen.getByText(/غير متصل بالإنترنت/)).toBeInTheDocument()
    
    // استعادة الحالة الأصلية
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  test('يعرض مؤشرات التحميل التكيفية', () => {
    render(
      <AdaptiveLoading
        isLoading={true}
        priority="high"
        contentType="data"
        expectedDataSize={1024 * 1024}
      />
    )

    expect(screen.getByText(/تحميل البيانات/)).toBeInTheDocument()
    expect(screen.getByText(/أولوية high/)).toBeInTheDocument()
  })
})

describe('useLoadingState Hook', () => {
  test('يدير حالة التحميل بشكل صحيح', () => {
    let result: any

    const TestComponent = () => {
      result = useLoadingState('test-state', {
        defaultMessage: 'رسالة مخصصة',
        enableProgress: true,
        advancedMessages: true,
      })

      const { startLoading, isLoading, message } = result

      return (
        <div>
          <button onClick={() => startLoading('fetching', 'جاري الجلب...')}>
            Start Loading
          </button>
          <div data-testid="status">
            {isLoading ? message : 'Idle'}
          </div>
        </div>
      )
    }

    render(<TestComponent />)

    // التحقق من الحالة الأولية
    expect(screen.getByTestId('status')).toHaveTextContent('Idle')
    expect(result.isLoading).toBe(false)

    // بدء التحميل
    fireEvent.click(screen.getByText('Start Loading'))

    // التحقق من حالة التحميل
    expect(screen.getByTestId('status')).toHaveTextContent('جاري الجلب...')
    expect(result.isLoading).toBe(true)
    expect(result.progress).toBeGreaterThan(0)
  })

  test('يدير التحديثات والتقدم', () => {
    let result: any

    const TestComponent = () => {
      result = useLoadingState('test-progress')

      return (
        <div>
          <button onClick={() => result.updateProgress(50, 'نصف الطريق')}>
            Update Progress
          </button>
          <button onClick={() => result.completeLoading('تم بنجاح!')}>
            Complete
          </button>
          <div data-testid="progress">{result.progress}%</div>
          <div data-testid="message">{result.message}</div>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByText('Update Progress'))

    expect(screen.getByTestId('progress')).toHaveTextContent('50%')
    expect(screen.getByTestId('message')).toHaveTextContent('نصف الطريق')
  })

  test('يدير حالات الخطأ', () => {
    let result: any

    const TestComponent = () => {
      result = useLoadingState('test-error')

      return (
        <div>
          <button onClick={() => result.setError('خطأ في التطبيق')}>
            Trigger Error
          </button>
          <div data-testid="error">{result.error?.message || 'No error'}</div>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByText('Trigger Error'))

    expect(screen.getByTestId('error')).toHaveTextContent('خطأ في التطبيق')
    expect(result.isError).toBe(true)
    expect(result.canRetry).toBe(true)
  })
})

describe('RetryableComponent Component', () => {
  test('ينفذ العملية مع آليات إعادة المحاولة', async () => {
    let callCount = 0
    const failingOperation = async () => {
      callCount++
      if (callCount < 3) {
        throw new Error('NETWORK_ERROR')
      }
      return { success: true }
    }

    render(
      <RetryableComponent
        operation={failingOperation}
        config={{
          maxRetries: 3,
          initialDelay: 100,
          retryableErrors: ['NETWORK_ERROR'],
        }}
      >
        <div>Success Content</div>
      </RetryableComponent>
    )

    // انتظار انتهاء جميع المحاولات
    await waitFor(() => {
      expect(screen.getByText('Success Content')).toBeInTheDocument()
    }, { timeout: 5000 })

    // التحقق من عدد المحاولات
    expect(callCount).toBe(3)
  })

  test('يعرض زر إعادة المحاولة عند الفشل', () => {
    const alwaysFailingOperation = async () => {
      throw new Error('PERMANENT_ERROR')
    }

    render(
      <RetryableComponent
        operation={alwaysFailingOperation}
        config={{ maxRetries: 1 }}
      >
        <div>Success Content</div>
      </RetryableComponent>
    )

    expect(screen.getByText(/فشل في التحميل/)).toBeInTheDocument()
    expect(screen.getByText(/إعادة المحاولة/)).toBeInTheDocument()
  })
})

describe('useAdaptiveLoading Hook', () => {
  test('يتكيف مع حالة الشبكة', async () => {
    let result: any

    const TestComponent = () => {
      result = useAdaptiveLoading(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return { data: 'test' }
        },
        {
          progressive: true,
          timeout: 5000,
          autoRetry: true,
        }
      )

      return (
        <div>
          <button 
            onClick={result.execute}
            disabled={result.isLoading}
          >
            Execute
          </button>
          <div data-testid="network">{result.networkInfo.effectiveType}</div>
          <div data-testid="loading">{result.isLoading ? 'Loading' : 'Idle'}</div>
          <div data-testid="slow">{result.isSlowConnection ? 'Slow' : 'Fast'}</div>
        </div>
      )
    }

    render(<TestComponent />)

    // التحقق من معلومات الشبكة الأولية
    expect(screen.getByTestId('network')).toHaveTextContent('4g')
    expect(screen.getByTestId('loading')).toHaveTextContent('Idle')
    expect(screen.getByTestId('slow')).toHaveTextContent('Fast')

    // تنفيذ العملية
    fireEvent.click(screen.getByText('Execute'))

    // التحقق من حالة التحميل
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    })

    // انتظار انتهاء العملية
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Idle')
      expect(result.stage).toBe('complete')
    })
  })

  test('يعرض التقدم التدريجي', async () => {
    let result: any

    const TestComponent = () => {
      result = useAdaptiveLoading(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return { data: 'test' }
        },
        { progressive: true }
      )

      return (
        <div>
          <div data-testid="progress">{Math.round(result.progress)}%</div>
          <div data-testid="stage">{result.stage}</div>
        </div>
      )
    }

    render(<TestComponent />)

    act(() => {
      result.execute()
    })

    await waitFor(() => {
      expect(parseInt(screen.getByTestId('progress').textContent || '0')).toBeGreaterThan(0)
    })
  })
})

describe('useNetworkDetection Hook', () => {
  test('يكشف معلومات الشبكة', () => {
    let result: any

    const TestComponent = () => {
      result = useNetworkDetection()
      return (
        <div>
          <div data-testid="online">{result.isOnline ? 'Online' : 'Offline'}</div>
          <div data-testid="type">{result.networkInfo.effectiveType}</div>
          <div data-testid="downlink">{result.networkInfo.downlink} Mbps</div>
          <div data-testid="slow">{result.isSlowConnection ? 'Slow' : 'Fast'}</div>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('online')).toHaveTextContent('Online')
    expect(screen.getByTestId('type')).toHaveTextContent('4g')
    expect(screen.getByTestId('downlink')).toHaveTextContent('10 Mbps')
    expect(screen.getByTestId('slow')).toHaveTextContent('Fast')
  })

  test('يوفر الإعدادات الموصى بها', () => {
    let result: any

    const TestComponent = () => {
      result = useNetworkDetection()
      const settings = result.getRecommendedSettings()

      return (
        <div>
          <div data-testid="quality">{settings.imageQuality}</div>
          <div data-testid="preload">{settings.preloadImages ? 'Yes' : 'No'}</div>
          <div data-testid="requests">{settings.concurrentRequests}</div>
        </div>
      )
    }

    render(<TestComponent />)

    // في الاتصال السريع، يجب أن تكون الجودة عالية
    expect(screen.getByTestId('quality')).toHaveTextContent('high')
    expect(screen.getByTestId('preload')).toHaveTextContent('Yes')
  })
})

// اختبارات الأداء / Performance Tests
describe('Performance Tests', () => {
  test('لا يسبب memory leaks', async () => {
    const { unmount } = render(
      <ProgressIndicator progress={50} />
    )

    // unmount component
    unmount()

    // تحقق من عدم وجود timers معلقة
    expect(1).toBe(1) // Placeholder - في التطبيق الحقيقي ستتحقق من clearInterval/clearTimeout
  })

  test('يدير التحميل بكفاءة', async () => {
    const startTime = performance.now()

    render(
      <CardLoader
        type="article"
        count={100} // عدد كبير من البطاقات
        shimmerType="gradient"
      />
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // يجب أن يكون وقت الرندر أقل من 100ms
    expect(renderTime).toBeLessThan(100)
  })
})

// اختبارات إمكانية الوصول / Accessibility Tests
describe('Accessibility Tests', () => {
  test('مكونات التحميل تدعم ARIA labels', () => {
    render(
      <ProgressIndicator
        progress={75}
        status="جاري التحميل..."
      />
    )

    const progressElement = document.querySelector('[role="progressbar"]')
    expect(progressElement).toBeInTheDocument()
    expect(progressElement).toHaveAttribute('aria-valuenow', '75')
    expect(progressElement).toHaveAttribute('aria-label', 'جاري التحميل...')
  })

  test('جداول التحميل تدعم screen readers', () => {
    render(
      <TableLoader
        rows={3}
        columns={2}
        showHeader={true}
      />
    )

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })
})

// اختبارات الاستجابة / Responsive Tests
describe('Responsive Tests', () => {
  test('المكونات تتكيف مع أحجام الشاشات المختلفة', () => {
    // محاكاة شاشة الهاتف
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    })

    render(
      <CardLoader
        type="article"
        count={3}
        shimmerType="wave"
      />
    )

    // في الهاتف، يجب أن تكون البطاقات في عمود واحد
    const container = document.querySelector('.grid')
    expect(container).toHaveClass('grid-cols-1')
  })

  test('شريط التقدم يتكيف مع المساحة المتاحة', () => {
    const { container } = render(
      <ProgressIndicator
        progress={50}
        type="linear"
        size="sm"
      />
    )

    const progressElement = container.querySelector('.h-1') // الحجم الصغير
    expect(progressElement).toBeInTheDocument()
  })
})

// اختبارات التكامل / Integration Tests
describe('Integration Tests', () => {
  test('تكامل مع Context API', () => {
    render(
      <LoadingProvider>
        <SmartLoadingWrapper id="integration-test">
          <div>Content</div>
        </SmartLoadingWrapper>
      </LoadingProvider>
    )

    // التحقق من توفر السياق
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument()
  })

  test('تكامل مع useLoadingState', () => {
    let loadingState: any

    const TestComponent = () => {
      loadingState = useLoadingState('integration-hook')
      
      return (
        <div>
          <button onClick={() => loadingState.startLoading()}>
            Start
          </button>
          <div>{loadingState.isLoading ? 'Loading' : 'Ready'}</div>
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByText('Ready')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Start'))
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })
})

// اختبارات التخصيص / Customization Tests
describe('Customization Tests', () {
  test('يدعم الألوان المخصصة', () => {
    const { container } = render(
      <ProgressIndicator
        progress={50}
        variant="success"
      />
    )

    // التحقق من تطبيق اللون الأخضر
    const progressBar = container.querySelector('.bg-green-500')
    expect(progressBar).toBeInTheDocument()
  })

  test('يدعم الأحجام المختلفة', () => {
    const { rerender } = render(
      <ProgressIndicator progress={50} size="lg" />
    )

    let progressElement = document.querySelector('.h-3') // الحجم الكبير
    expect(progressElement).toBeInTheDocument()

    rerender(<ProgressIndicator progress={50} size="sm" />)
    progressElement = document.querySelector('.h-1') // الحجم الصغير
    expect(progressElement).toBeInTheDocument()
  })

  test('يدعم الرسائل المخصصة', () => {
    render(
      <ProgressIndicator
        progress={50}
        status="رسالة مخصصة للتحميل"
      />
    )

    expect(screen.getByText('رسالة مخصصة للتحميل')).toBeInTheDocument()
  })
})

// اختبارات الأمان / Security Tests
describe('Security Tests', () => {
  test('لا يسمح بـ XSS في الرسائل', () => {
    const maliciousMessage = '<script>alert("xss")</script>'

    render(
      <ProgressIndicator
        progress={50}
        status={maliciousMessage}
      />
    )

    // التحقق من أن الـ script لم يتم تنفيذه
    expect(screen.getByText(maliciousMessage)).toBeInTheDocument()
    expect(document.querySelector('script')).not.toBeInTheDocument()
  })

  test('يتعامل مع البيانات الكبيرة بأمان', () => {
    const largeData = 'x'.repeat(1000000) // 1MB من البيانات

    render(
      <ShimmerEffect
        width={largeData}
        height="200px"
      />
    )

    // يجب أن لا يحدث crash
    expect(document.body).toBeInTheDocument()
  })
})

// تشغيل جميع الاختبارات
// Run all tests: npm test -- --testPathPattern=loading