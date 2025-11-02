'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Trash2,
  Eye,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useBatch } from './BatchOperationsProvider';
import { Priority } from '@/lib/types/batch';
import { toast } from 'sonner';

interface BatchQueueProps {
  maxDisplayItems?: number;
  showControls?: boolean;
  compact?: boolean;
  className?: string;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  maxDisplayItems = 20,
  showControls = true,
  compact = false,
  className = '',
}) => {
  const { 
    queue, 
    operations, 
    isProcessing, 
    processNextInQueue,
    updateOperation,
    removeOperation 
  } = useBatch();
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'running' | 'completed' | 'failed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Priority>('all');

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'عاجل';
      case 'high':
        return 'عالي';
      case 'normal':
        return 'عادي';
      case 'low':
        return 'منخفض';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'running':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتملة';
      case 'failed':
        return 'فشلت';
      default:
        return 'غير محدد';
    }
  };

  const filteredQueue = queue.filter(item => {
    const operation = operations.get(item.operationId);
    if (!operation) return false;

    if (filterStatus !== 'all' && operation.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;

    return true;
  });

  const displayItems = filteredQueue.slice(0, maxDisplayItems);
  const priorityQueue = filteredQueue.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const handleItemAction = (itemId: string, action: string) => {
    const queueItem = queue.find(item => item.id === itemId);
    if (!queueItem) return;

    switch (action) {
      case 'remove':
        // إزالة من الطابور
        console.log('Remove from queue:', itemId);
        toast.success('تم إزالة العنصر من الطابور');
        break;
      
      case 'priority_up':
        // زيادة الأولوية
        console.log('Increase priority:', itemId);
        toast.success('تم زيادة الأولوية');
        break;
      
      case 'priority_down':
        // تقليل الأولوية
        console.log('Decrease priority:', itemId);
        toast.success('تم تقليل الأولوية');
        break;
      
      case 'retry':
        // إعادة المحاولة
        console.log('Retry item:', itemId);
        toast.success('تم إعادة إضافة العنصر للطابور');
        break;
    }
  };

  const showItemDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const getQueueStats = () => {
    const total = queue.length;
    const pending = queue.filter(item => operations.get(item.operationId)?.status === 'pending').length;
    const running = queue.filter(item => operations.get(item.operationId)?.status === 'running').length;
    
    return { total, pending, running };
  };

  const stats = getQueueStats();

  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">طابور: {stats.total}</span>
          </div>
          {stats.running > 0 && (
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{stats.running} قيد المعالجة</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{stats.pending} في الانتظار</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                طابور المعالجة
              </CardTitle>
              <CardDescription>
                إدارة ومعالجة العمليات الجماعية
              </CardDescription>
            </div>
            {showControls && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={processNextInQueue}
                  disabled={isProcessing || queue.length === 0}
                >
                  {isProcessing ? (
                    <RotateCcw className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Play className="w-4 h-4 mr-1" />
                  )}
                  معالجة التالية
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* إحصائيات */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
              <div className="text-sm text-muted-foreground">قيد المعالجة</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">في الانتظار</div>
            </div>
          </div>

          {/* فلاتر */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">تصفية:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="running">قيد المعالجة</option>
              <option value="completed">مكتملة</option>
              <option value="failed">فشلت</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">جميع الأولويات</option>
              <option value="urgent">عاجل</option>
              <option value="high">عالي</option>
              <option value="normal">عادي</option>
              <option value="low">منخفض</option>
            </select>
          </div>

          {/* قائمة الطابور */}
          {displayItems.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {queue.length === 0 ? 'الطابور فارغ' : 'لا توجد عناصر تطابق المرشح'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العملية</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayItems.map((item) => {
                    const operation = operations.get(item.operationId);
                    if (!operation) return null;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{operation.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {operation.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {operation.totalItems && (
                                <>
                                  {operation.processedItems} / {operation.totalItems} عنصر
                                  {operation.progress > 0 && ` (${operation.progress}%)`}
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(item.priority)}>
                            {getPriorityLabel(item.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(operation.status)}
                            <Badge className={getStatusColor(operation.status)}>
                              {getStatusLabel(operation.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.scheduledAt.toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showItemDetails({ item, operation })}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleItemAction(item.id, 'priority_up')}
                                >
                                  <Zap className="w-4 h-4 mr-2" />
                                  زيادة الأولوية
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleItemAction(item.id, 'priority_down')}
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  تقليل الأولوية
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleItemAction(item.id, 'retry')}
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  إعادة المحاولة
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleItemAction(item.id, 'remove')}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {queue.length > maxDisplayItems && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                عرض {maxDisplayItems} من أصل {queue.length} عنصر. استخدم الفلاتر للعثور على عناصر محددة.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* تفاصيل العنصر */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل العملية</DialogTitle>
            <DialogDescription>
              معلومات تفصيلية عن العملية المحددة
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedItem.operation.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.operation.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">الأولوية:</span>
                  <Badge className={getPriorityColor(selectedItem.priority)}>
                    {getPriorityLabel(selectedItem.priority)}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">الحالة:</span>
                  <Badge className={getStatusColor(selectedItem.operation.status)}>
                    {getStatusLabel(selectedItem.operation.status)}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">تم الإنشاء:</span>
                  <span>{selectedItem.operation.createdAt.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">مجدولة:</span>
                  <span>{selectedItem.scheduledAt.toLocaleString()}</span>
                </div>
              </div>

              {selectedItem.operation.totalItems && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم</span>
                    <span>
                      {selectedItem.operation.processedItems} / {selectedItem.operation.totalItems}
                    </span>
                  </div>
                  <Progress value={selectedItem.operation.progress} />
                </div>
              )}

              {selectedItem.operation.error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedItem.operation.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchQueue;