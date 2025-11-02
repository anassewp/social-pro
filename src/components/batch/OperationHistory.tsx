'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  History, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Download,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  RefreshCw
} from 'lucide-react';
import { useBatch } from './BatchOperationsProvider';
import { BatchStatus, BatchType, OperationHistory as HistoryType } from '@/lib/types/batch';
import { toast } from 'sonner';

interface OperationHistoryProps {
  maxDisplayItems?: number;
  showFilters?: boolean;
  showActions?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const OperationHistory: React.FC<OperationHistoryProps> = ({
  maxDisplayItems = 50,
  showFilters = true,
  showActions = true,
  compact = false,
  autoRefresh = false,
  refreshInterval = 30000,
  className = '',
}) => {
  const { history, clearHistory, getOperation } = useBatch();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BatchStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<BatchType | 'all'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // فلترة السجل
  const filteredHistory = history.filter(record => {
    // فلترة بالنص البحثي
    if (searchTerm && !record.operation.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // فلترة بالحالة
    if (filterStatus !== 'all' && record.operation.status !== filterStatus) {
      return false;
    }

    // فلترة بالنوع
    if (filterType !== 'all' && record.operation.type !== filterType) {
      return false;
    }

    // فلترة بالنطاق الزمني
    if (filterDateRange !== 'all') {
      const now = new Date();
      const recordDate = new Date(record.timestamp);
      
      switch (filterDateRange) {
        case 'today':
          if (recordDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (recordDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (recordDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  // ترتيب السجل (الأحدث أولاً)
  const sortedHistory = filteredHistory.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const displayItems = sortedHistory.slice(0, maxDisplayItems);

  const getStatusIcon = (status: BatchStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: BatchStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: BatchStatus) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'failed':
        return 'فشلت';
      case 'running':
        return 'قيد المعالجة';
      case 'pending':
        return 'في الانتظار';
      default:
        return 'غير محدد';
    }
  };

  const getTypeLabel = (type: BatchType) => {
    switch (type) {
      case 'bulk_update':
        return 'تحديث جماعي';
      case 'bulk_delete':
        return 'حذف جماعي';
      case 'import':
        return 'استيراد';
      case 'export':
        return 'تصدير';
      case 'campaign_process':
        return 'معالجة حملات';
      case 'user_management':
        return 'إدارة مستخدمين';
      default:
        return type;
    }
  };

  const getTypeColor = (type: BatchType) => {
    switch (type) {
      case 'bulk_update':
        return 'bg-blue-100 text-blue-800';
      case 'bulk_delete':
        return 'bg-red-100 text-red-800';
      case 'import':
        return 'bg-green-100 text-green-800';
      case 'export':
        return 'bg-purple-100 text-purple-800';
      case 'campaign_process':
        return 'bg-orange-100 text-orange-800';
      case 'user_management':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'partial':
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'success':
        return 'نجح';
      case 'failure':
        return 'فشل';
      case 'partial':
        return 'جزئي';
      default:
        return 'غير محدد';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecordAction = (record: HistoryType, action: string) => {
    switch (action) {
      case 'view':
        setSelectedRecord(record);
        setShowDetails(true);
        break;
      case 'repeat':
        toast.success('تم إعادة تشغيل العملية');
        break;
      case 'download':
        // تصدير تفاصيل العملية
        const data = {
          operation: record.operation,
          timestamp: record.timestamp,
          result: record.result,
          details: record.details,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `operation_${record.operation.id}_${record.timestamp.toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('تم تصدير تفاصيل العملية');
        break;
      case 'delete':
        toast.success('تم حذف السجل');
        break;
    }
  };

  const handleClearHistory = () => {
    if (confirm('هل أنت متأكد من حذف جميع السجلات؟')) {
      clearHistory();
      toast.success('تم حذف جميع السجلات');
    }
  };

  const getHistoryStats = () => {
    const total = filteredHistory.length;
    const success = filteredHistory.filter(r => r.result === 'success').length;
    const failure = filteredHistory.filter(r => r.result === 'failure').length;
    const partial = filteredHistory.filter(r => r.result === 'partial').length;
    
    return { total, success, failure, partial };
  };

  const stats = getHistoryStats();

  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="text-sm">سجل: {stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">{stats.success} نجح</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm">{stats.failure} فشل</span>
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
                <History className="w-5 h-5" />
                سجل العمليات
              </CardTitle>
              <CardDescription>
                سجل شامل لجميع العمليات الجماعية المنفذة
              </CardDescription>
            </div>
            {showActions && (
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="w-4 h-4 mr-2" />
                مسح السجل
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* إحصائيات السجل */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <div className="text-sm text-muted-foreground">نجح</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-red-600">{stats.failure}</div>
              <div className="text-sm text-muted-foreground">فشل</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
              <div className="text-sm text-muted-foreground">جزئي</div>
            </div>
          </div>

          {/* فلاتر البحث */}
          {showFilters && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في العمليات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-sm border rounded px-3 py-2"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="completed">مكتملة</option>
                  <option value="failed">فشلت</option>
                  <option value="running">قيد المعالجة</option>
                  <option value="pending">في الانتظار</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="text-sm border rounded px-3 py-2"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="bulk_update">تحديث جماعي</option>
                  <option value="bulk_delete">حذف جماعي</option>
                  <option value="import">استيراد</option>
                  <option value="export">تصدير</option>
                  <option value="campaign_process">معالجة حملات</option>
                  <option value="user_management">إدارة مستخدمين</option>
                </select>

                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value as any)}
                  className="text-sm border rounded px-3 py-2"
                >
                  <option value="all">جميع الأوقات</option>
                  <option value="today">اليوم</option>
                  <option value="week">آخر أسبوع</option>
                  <option value="month">آخر شهر</option>
                </select>
              </div>
            </div>
          )}

          {/* جدول السجل */}
          {displayItems.length === 0 ? (
            <Alert>
              <History className="h-4 w-4" />
              <AlertDescription>
                {filteredHistory.length === 0 
                  ? 'لا توجد سجلات متاحة' 
                  : 'لا توجد سجلات تطابق المرشح'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العملية</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>النتيجة</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayItems.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.operation.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.operation.description}
                          </div>
                          {record.operation.totalItems && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {record.operation.processedItems} / {record.operation.totalItems} عنصر
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(record.operation.type)}>
                          {getTypeLabel(record.operation.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.operation.status)}
                          <Badge className={getStatusColor(record.operation.status)}>
                            {getStatusLabel(record.operation.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getResultIcon(record.result || 'unknown')}
                          <Badge className={getResultColor(record.result || 'unknown')}>
                            {getResultLabel(record.result || 'unknown')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{record.timestamp.toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {record.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {record.userId}
                          </div>
                          {record.ipAddress && (
                            <div className="text-xs text-muted-foreground">
                              {record.ipAddress}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {showActions && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRecordAction(record, 'view')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRecordAction(record, 'repeat')}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                إعادة التشغيل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRecordAction(record, 'download')}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                تصدير التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRecordAction(record, 'delete')}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredHistory.length > maxDisplayItems && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                عرض {maxDisplayItems} من أصل {filteredHistory.length} سجل. استخدم الفلاتر للعثور على سجلات محددة.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* تفاصيل السجل */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العملية</DialogTitle>
            <DialogDescription>
              معلومات تفصيلية عن العملية المحددة
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              {/* معلومات أساسية */}
              <div className="space-y-2">
                <h4 className="font-medium">{selectedRecord.operation.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedRecord.operation.description}
                </p>
              </div>

              {/* حالة العملية */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">الحالة:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedRecord.operation.status)}
                    <Badge className={getStatusColor(selectedRecord.operation.status)}>
                      {getStatusLabel(selectedRecord.operation.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium">النتيجة:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getResultIcon(selectedRecord.result)}
                    <Badge className={getResultColor(selectedRecord.result)}>
                      {getResultLabel(selectedRecord.result)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* التوقيتات */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">وقت الإنشاء:</span>
                  <div>{selectedRecord.operation.createdAt.toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium">وقت الانتهاء:</span>
                  <div>
                    {selectedRecord.operation.completedAt?.toLocaleString() || 'غير محدد'}
                  </div>
                </div>
              </div>

              {/* إحصائيات العملية */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">إجمالي العناصر:</span>
                  <div>{selectedRecord.operation.totalItems || 'غير محدد'}</div>
                </div>
                <div>
                  <span className="font-medium">تمت المعالجة:</span>
                  <div>{selectedRecord.operation.processedItems || 0}</div>
                </div>
                <div>
                  <span className="font-medium">نجحت:</span>
                  <div>{selectedRecord.operation.successItems || 0}</div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="text-sm">
                <span className="font-medium">المستخدم:</span>
                <div>{selectedRecord.userId}</div>
                {selectedRecord.ipAddress && (
                  <>
                    <span className="font-medium">عنوان IP:</span>
                    <div>{selectedRecord.ipAddress}</div>
                  </>
                )}
                {selectedRecord.userAgent && (
                  <>
                    <span className="font-medium">المتصفح:</span>
                    <div className="text-xs text-muted-foreground break-all">
                      {selectedRecord.userAgent}
                    </div>
                  </>
                )}
              </div>

              {/* تفاصيل إضافية */}
              {selectedRecord.details && (
                <div className="space-y-2">
                  <span className="font-medium">التفاصيل:</span>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(selectedRecord.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperationHistory;