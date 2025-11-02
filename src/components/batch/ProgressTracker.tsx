'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Timer,
  Activity
} from 'lucide-react';
import { useBatch } from './BatchOperationsProvider';
import { ProgressTracker as ProgressTrackerType, ProgressPhase } from '@/lib/types/batch';
import { toast } from 'sonner';

interface ProgressTrackerProps {
  operationId?: string;
  operationIds?: string[];
  showControls?: boolean;
  showPhases?: boolean;
  compact?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  operationId,
  operationIds = [],
  showControls = true,
  showPhases = true,
  compact = false,
  onPause,
  onResume,
  onStop,
  className = '',
}) => {
  const { operations, updateProgress, getOperation } = useBatch();
  const [localProgress, setLocalProgress] = useState<Map<string, ProgressTrackerType>>(new Map());
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [eta, setEta] = useState<Date | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const targetOperationIds = operationId ? [operationId] : operationIds;

  // حساب إحصائيات الأداء
  const calculateStats = (operation: any, tracker: ProgressTrackerType) => {
    if (!operation.totalItems || operation.progress === 0) return null;

    const elapsed = Date.now() - operation.createdAt.getTime();
    const processedItems = operation.processedItems;
    
    // حساب السرعة (عنصر/ثانية)
    const currentSpeed = processedItems / (elapsed / 1000);
    
    // حساب الوقت المتبقي
    const remainingItems = operation.totalItems - processedItems;
    const remainingTime = remainingItems / currentSpeed;
    
    // تقدير وقت الانتهاء
    const estimatedEnd = new Date(Date.now() + remainingTime * 1000);

    return {
      speed: currentSpeed,
      remainingTime: Math.round(remainingTime),
      eta: estimatedEnd,
    };
  };

  // تحديث الإحصائيات بشكل دوري
  useEffect(() => {
    const interval = setInterval(() => {
      targetOperationIds.forEach(id => {
        const operation = operations.get(id);
        if (operation && operation.status === 'running') {
          const tracker = localProgress.get(id);
          const stats = calculateStats(operation, tracker!);
          
          if (stats) {
            setSpeed(stats.speed);
            setTimeRemaining(stats.remainingTime);
            setEta(stats.eta);
          }
        }
      });
    }, 2000); // تحديث كل ثانيتين

    return () => clearInterval(interval);
  }, [operations, localProgress, targetOperationIds]);

  // حفظ بيانات التقدم
  useEffect(() => {
    targetOperationIds.forEach(id => {
      const operation = operations.get(id);
      if (operation) {
        const existing = localProgress.get(id);
        const tracker: ProgressTrackerType = {
          id,
          operationId: id,
          current: operation.processedItems,
          total: operation.totalItems || 0,
          percentage: operation.progress,
          eta: eta || undefined,
          speed,
          remainingTime: timeRemaining || undefined,
          status: operation.status as any,
          phases: existing?.phases || [],
        };

        setLocalProgress(prev => new Map(prev.set(id, tracker)));
      }
    });
  }, [operations, targetOperationIds, eta, speed, timeRemaining]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}ث`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}د ${remainingSeconds}ث`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}س ${minutes}د`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCurrentPhase = (operation: any) => {
    if (showPhases && operation.phases) {
      const currentPhaseItem = operation.phases.find((p: ProgressPhase) => 
        p.progress > 0 && !p.completedAt
      );
      return currentPhaseItem?.name || operation.currentPhase || 'المرحلة الحالية';
    }
    return operation.currentItem || 'قيد المعالجة';
  };

  const renderProgressItem = (id: string) => {
    const operation = operations.get(id);
    const tracker = localProgress.get(id);
    
    if (!operation || !tracker) return null;

    if (compact) {
      return (
        <div className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            {getStatusIcon(operation.status)}
            <span className="text-sm font-medium">{operation.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{operation.progress}%</span>
            <div className="w-20">
              <Progress value={operation.progress} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <Card key={id} className="mb-4">
        <CardContent className="space-y-4">
          {/* عنوان العملية والحالة */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(operation.status)}
              <h4 className="font-medium">{operation.title}</h4>
              <Badge className={getStatusColor(operation.status)}>
                {operation.status === 'running' && 'قيد المعالجة'}
                {operation.status === 'completed' && 'مكتملة'}
                {operation.status === 'failed' && 'فشلت'}
                {operation.status === 'paused' && 'متوقفة'}
                {operation.status === 'pending' && 'في الانتظار'}
              </Badge>
            </div>
            
            {showControls && operation.status === 'running' && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={onPause}>
                  <Pause className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onStop}>
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* المرحلة الحالية */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{getCurrentPhase(operation)}</span>
              {operation.status === 'running' && (
                <span className="text-muted-foreground">
                  • {operation.processedItems} / {operation.totalItems || '?'}
                </span>
              )}
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم</span>
              <span>{operation.progress}%</span>
            </div>
            <Progress value={operation.progress} />
          </div>

          {/* الإحصائيات */}
          {(operation.status === 'running' || operation.status === 'completed') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {speed > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>{speed.toFixed(1)} عنصر/ث</span>
                </div>
              )}
              
              {timeRemaining && timeRemaining > 0 && (
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-500" />
                  <span>{formatTime(timeRemaining)} متبقي</span>
                </div>
              )}
              
              {eta && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>انتهاء: {eta.toLocaleTimeString()}</span>
                </div>
              )}
              
              {operation.successItems !== undefined && operation.failedItems !== undefined && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    {operation.successItems} نجح • {operation.failedItems} فشل
                  </span>
                </div>
              )}
            </div>
          )}

          {/* المراحل التفصيلية */}
          {showPhases && operation.phases && operation.phases.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">المراحل</h5>
              <div className="space-y-1">
                {operation.phases.map((phase: ProgressPhase, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {phase.completedAt ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : phase.progress > 0 ? (
                      <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                    ) : (
                      <Clock className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={phase.completedAt ? 'text-green-600' : 
                                   phase.progress > 0 ? 'text-blue-600' : 'text-gray-400'}>
                      {phase.name}
                    </span>
                    {phase.progress > 0 && (
                      <span className="text-muted-foreground">({phase.progress}%)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* رسالة الخطأ */}
          {operation.status === 'failed' && operation.error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {operation.error}
              </AlertDescription>
            </Alert>
          )}

          {/* رسالة النجاح */}
          {operation.status === 'completed' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                تمت العملية بنجاح في {operation.completedAt?.toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  if (targetOperationIds.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={className}>
        <div className="space-y-2">
          {targetOperationIds.map(id => renderProgressItem(id))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {targetOperationIds.map(id => renderProgressItem(id))}
      </div>
    </div>
  );
};

export default ProgressTracker;