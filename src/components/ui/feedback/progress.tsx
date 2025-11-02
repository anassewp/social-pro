import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from './toast'
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  Pause, 
  Play, 
  RotateCcw,
  Upload,
  Download,
  Copy,
  Trash2,
  Save
} from 'lucide-react'

// أنواع العمليات
export type TaskType = 
  | 'upload' 
  | 'download' 
  | 'processing' 
  | 'saving' 
  | 'deleting' 
  | 'copying' 
  | 'custom'

// حالة المهمة
export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled'

// واجهة بيانات المهمة
export interface TaskData {
  id: string
  title: string
  description?: string
  type: TaskType
  status: TaskStatus
  progress: number
  total?: number
  current?: number
  estimatedTime?: number
  actualTime?: number
  error?: string
  canPause?: boolean
  canCancel?: boolean
  canRetry?: boolean
  autoStart?: boolean
  onComplete?: () => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void
}

// مكون Progress bar محسن
export const EnhancedProgress = ({
  progress = 0,
  status = 'pending',
  showLabel = true,
  showPercentage = true,
  animated = true,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: {
  progress?: number
  status?: TaskStatus
  showLabel?: boolean
  showPercentage?: boolean
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'error' | 'warning'
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'success'
      case 'error': return 'error'
      case 'running': return 'default'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  const color = getStatusColor()
  const percentage = Math.round(progress)

  return (
    <div className={cn('w-full space-y-2', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span>التقدم</span>
          {showPercentage && (
            <span className="font-medium">{percentage}%</span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-secondary rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[color],
            animated && status === 'running' && 'animate-pulse'
          )}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {status === 'error' && (
        <div className="text-xs text-red-600 flex items-center space-x-1">
          <XCircle className="h-3 w-3" />
          <span>حدث خطأ</span>
        </div>
      )}
      
      {status === 'completed' && (
        <div className="text-xs text-green-600 flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>مكتمل</span>
        </div>
      )}
    </div>
  )
}

// مكون Progress Circle محسن
export const CircularProgress = ({
  progress = 0,
  size = 60,
  strokeWidth = 4,
  status = 'pending',
  showLabel = true,
  className = '',
  ...props
}: {
  progress?: number
  size?: number
  strokeWidth?: number
  status?: TaskStatus
  showLabel?: boolean
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'error': return '#ef4444'
      case 'running': return '#3b82f6'
      case 'paused': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} {...props}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStatusColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300',
            status === 'running' && 'animate-pulse'
          )}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

// hook لإدارة المهام المتعددة
export const useTaskManager = () => {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const { showToast } = useToast()

  const createTask = useCallback((taskData: Omit<TaskData, 'id' | 'status' | 'progress'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newTask: TaskData = {
      id,
      status: taskData.autoStart ? 'running' : 'pending',
      progress: 0,
      ...taskData
    }

    setTasks(prev => [...prev, newTask])
    return id
  }, [])

  const updateTask = useCallback((taskId: string, updates: Partial<TaskData>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))
  }, [])

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }, [])

  const startTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'running' })
  }, [updateTask])

  const pauseTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'paused' })
  }, [updateTask])

  const cancelTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'cancelled' })
    
    // إزالة المهمة بعد فترة قصيرة
    setTimeout(() => {
      removeTask(taskId)
    }, 3000)
  }, [updateTask, removeTask])

  const completeTask = useCallback((taskId: string) => {
    updateTask(taskId, { 
      status: 'completed',
      progress: 100,
      actualTime: Date.now()
    })

    const task = tasks.find(t => t.id === taskId)
    if (task?.onComplete) {
      task.onComplete()
    }

    showToast({
      type: 'success',
      title: 'تمت المهمة',
      message: task?.title || 'تمت العملية بنجاح',
      duration: 3000
    })
  }, [updateTask, tasks, showToast])

  const errorTask = useCallback((taskId: string, error: string) => {
    updateTask(taskId, { 
      status: 'error',
      error,
      actualTime: Date.now()
    })

    const task = tasks.find(t => t.id === taskId)
    if (task?.onError) {
      task.onError(error)
    }

    showToast({
      type: 'error',
      title: 'خطأ في المهمة',
      message: error,
      duration: 5000
    })
  }, [updateTask, tasks, showToast])

  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(task => 
      !['completed', 'cancelled'].includes(task.status)
    ))
  }, [])

  const clearAllTasks = useCallback(() => {
    setTasks([])
  }, [])

  return {
    tasks,
    createTask,
    updateTask,
    removeTask,
    startTask,
    pauseTask,
    cancelTask,
    completeTask,
    errorTask,
    clearCompletedTasks,
    clearAllTasks
  }
}

// مكون إدارة المهام
export const TaskManager = ({
  showControls = true,
  maxHeight = 'max-h-96',
  className = ''
}: {
  showControls?: boolean
  maxHeight?: string
  className?: string
}) => {
  const { tasks, pauseTask, cancelTask, clearCompletedTasks, clearAllTasks } = useTaskManager()

  const runningTasks = tasks.filter(task => task.status === 'running').length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const errorTasks = tasks.filter(task => task.status === 'error').length

  const getTaskIcon = (type: TaskType, status: TaskStatus) => {
    if (status === 'error') return <XCircle className="h-4 w-4 text-red-500" />
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === 'paused') return <Pause className="h-4 w-4 text-yellow-500" />
    if (status === 'running') {
      switch (type) {
        case 'upload': return <Upload className="h-4 w-4 text-blue-500 animate-bounce" />
        case 'download': return <Download className="h-4 w-4 text-blue-500 animate-bounce" />
        case 'saving': return <Save className="h-4 w-4 text-blue-500 animate-bounce" />
        case 'deleting': return <Trash2 className="h-4 w-4 text-red-500 animate-bounce" />
        case 'copying': return <Copy className="h-4 w-4 text-blue-500 animate-bounce" />
        default: return <Loader className="h-4 w-4 text-blue-500 animate-spin" />
      }
    }
    return <Loader className="h-4 w-4 text-gray-500" />
  }

  if (tasks.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <Loader className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>لا توجد مهام قيد التشغيل</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showControls && (runningTasks > 0 || completedTasks > 0 || errorTasks > 0) && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <span>قيد التشغيل: {runningTasks}</span>
            <span>مكتملة: {completedTasks}</span>
            <span>خطأ: {errorTasks}</span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={clearCompletedTasks}
              disabled={completedTasks === 0}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
            >
              إزالة المكتملة
            </button>
            <button
              onClick={clearAllTasks}
              disabled={tasks.length === 0}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
            >
              إزالة الكل
            </button>
          </div>
        </div>
      )}

      <div className={cn('space-y-3 overflow-y-auto', maxHeight)}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'p-4 border rounded-lg space-y-3',
              task.status === 'completed' && 'bg-green-50 border-green-200',
              task.status === 'error' && 'bg-red-50 border-red-200',
              task.status === 'paused' && 'bg-yellow-50 border-yellow-200',
              task.status === 'running' && 'bg-blue-50 border-blue-200'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getTaskIcon(task.type, task.status)}
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {(task.canPause || task.canCancel) && (
                <div className="flex space-x-1">
                  {task.canPause && task.status === 'running' && (
                    <button
                      onClick={() => pauseTask(task.id)}
                      className="p-1 hover:bg-white/50 rounded"
                      title="إيقاف مؤقت"
                    >
                      <Pause className="h-3 w-3" />
                    </button>
                  )}
                  
                  {task.canCancel && task.status !== 'completed' && task.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelTask(task.id)}
                      className="p-1 hover:bg-white/50 rounded"
                      title="إلغاء"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <EnhancedProgress
                progress={task.progress}
                status={task.status}
                size="sm"
              />

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {task.current && task.total 
                    ? `${task.current} / ${task.total}`
                    : `${Math.round(task.progress)}%`
                  }
                </span>
                
                {task.estimatedTime && (
                  <span>
                    متبقي: {Math.round(task.estimatedTime / 1000)}ث
                  </span>
                )}
                
                {task.actualTime && (
                  <span>
                    استغرق: {Math.round(task.actualTime / 1000)}ث
                  </span>
                )}
              </div>

              {task.error && (
                <div className="text-xs text-red-600 p-2 bg-red-100 rounded">
                  خطأ: {task.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// مثال على الاستخدام
export const ProgressExample = () => {
  const [isRunning, setIsRunning] = useState(false)
  const { createTask, startTask } = useTaskManager()

  const simulateUpload = async () => {
    const taskId = createTask({
      title: 'رفع الملفات',
      description: 'رفع 5 ملفات إلى الخادم',
      type: 'upload',
      canPause: true,
      canCancel: true,
      current: 0,
      total: 5,
      autoStart: false
    })

    startTask(taskId)

    // محاكاة عملية الرفع
    for (let i = 0; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // هنا يتم تحديث التقدم
      // في التطبيق الحقيقي، سيتم استدعاؤها من عند اكتمال كل ملف
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-center">أمثلة على Progress Feedback</h3>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Progress Bar بسيط</h4>
          <EnhancedProgress
            progress={65}
            status="running"
            showLabel={true}
          />
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Progress Circle</h4>
          <div className="flex justify-center">
            <CircularProgress
              progress={75}
              status="running"
              size={80}
            />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">مدير المهام</h4>
          <TaskManager />
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">محاكاة رفع</h4>
          <button
            onClick={simulateUpload}
            disabled={isRunning}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunning ? 'جاري الرفع...' : 'بدء رفع الملفات'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedProgress