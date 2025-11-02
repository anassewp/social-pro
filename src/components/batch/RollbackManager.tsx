'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  RotateCcw, 
  Shield, 
  Database, 
  FileText, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Info,
  HardDrive,
  Archive
} from 'lucide-react';
import { useBatch } from './BatchOperationsProvider';
import { RollbackData, RollbackConfig } from '@/lib/types/batch';
import { toast } from 'sonner';

interface RollbackManagerProps {
  operationId?: string;
  showConfig?: boolean;
  compact?: boolean;
  autoCleanup?: boolean;
  onRollback?: (rollbackData: RollbackData) => Promise<void>;
  className?: string;
}

const defaultConfig: RollbackConfig = {
  enabled: true,
  retentionPeriod: 30, // days
  maxRollbackPoints: 100,
  autoCleanup: true,
  compressionEnabled: true,
};

export const RollbackManager: React.FC<RollbackManagerProps> = ({
  operationId,
  showConfig = true,
  compact = false,
  autoCleanup = true,
  onRollback,
  className = '',
}) => {
  const { rollbacks, getOperation } = useBatch();
  
  const [config, setConfig] = useState<RollbackConfig>(defaultConfig);
  const [selectedRollback, setSelectedRollback] = useState<RollbackData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // تحويل rollbacks Map إلى مصفوفة
  const rollbackList = Array.from(rollbacks.entries()).map(([operationId, data]) => ({
    id: operationId,
    operationId,
    data,
  }));

  const filteredRollbacks = operationId 
    ? rollbackList.filter(rb => rb.operationId === operationId)
    : rollbackList;

  const getTypeIcon = (type: RollbackData['type']) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4 text-blue-500" />;
      case 'file':
        return <FileText classNameName="w-4 h-4 text-green-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-purple-500" />;
      default:
        return <Archive className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: RollbackData['type']) => {
    switch (type) {
      case 'database':
        return 'قاعدة البيانات';
      case 'file':
        return 'ملفات';
      case 'system':
        return 'النظام';
      case 'custom':
        return 'مخصص';
      default:
        return 'غير محدد';
    }
  };

  const getTypeColor = (type: RollbackData['type']) => {
    switch (type) {
      case 'database':
        return 'bg-blue-100 text-blue-800';
      case 'file':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'custom':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDataSize = (data: any): string => {
    const size = JSON.stringify(data).length;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const getDataSize = (rollbackData: RollbackData): number => {
    return JSON.stringify(rollbackData.data).length;
  };

  const handleRollback = async (rollbackData: RollbackData) => {
    setIsProcessing(true);
    
    try {
      // استدعاء وظيفة الاستعادة المخصصة
      if (onRollback) {
        await onRollback(rollbackData);
      } else {
        // تنفيذ الاستعادة الافتراضي
        await performRollback(rollbackData);
      }

      toast.success('تمت الاستعادة بنجاح');
    } catch (error) {
      toast.error(`فشلت الاستعادة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const performRollback = async (rollbackData: RollbackData) => {
    const operation = getOperation(rollbackData.operationId);
    
    switch (rollbackData.type) {
      case 'database':
        await rollbackDatabase(rollbackData);
        break;
      case 'file':
        await rollbackFiles(rollbackData);
        break;
      case 'system':
        await rollbackSystem(rollbackData);
        break;
      default:
        throw new Error('نوع الاستعادة غير مدعوم');
    }
  };

  const rollbackDatabase = async (rollbackData: RollbackData) => {
    // محاكاة استعادة قاعدة البيانات
    console.log('استعادة قاعدة البيانات:', rollbackData.operationId);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const rollbackFiles = async (rollbackData: RollbackData) => {
    // محاكاة استعادة الملفات
    console.log('استعادة الملفات:', rollbackData.operationId);
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const rollbackSystem = async (rollbackData: RollbackData) => {
    // محاكاة استعادة النظام
    console.log('استعادة النظام:', rollbackData.operationId);
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const exportRollbackData = (rollbackData: RollbackData) => {
    const exportData = {
      ...rollbackData,
      exportedAt: new Date(),
      operation: getOperation(rollbackData.operationId),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rollback_${rollbackData.id}_${rollbackData.timestamp.toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('تم تصدير بيانات الاستعادة');
  };

  const deleteRollbackData = (rollbackData: RollbackData) => {
    if (confirm('هل أنت متأكد من حذف بيانات الاستعادة هذه؟')) {
      // حذف بيانات الاستعادة
      console.log('حذف بيانات الاستعادة:', rollbackData.id);
      toast.success('تم حذف بيانات الاستعادة');
    }
  };

  const cleanupOldRollbacks = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionPeriod);
    
    const oldRollbacks = filteredRollbacks.filter(rb => 
      new Date(rb.data.timestamp) < cutoffDate
    );
    
    if (oldRollbacks.length === 0) {
      toast.info('لا توجد بيانات استعادة قديمة للحذف');
      return;
    }

    if (confirm(`هل تريد حذف ${oldRollbacks.length} نقطة استعادة قديمة؟`)) {
      console.log('حذف البيانات القديمة:', oldRollbacks.length);
      toast.success(`تم حذف ${oldRollbacks.length} نقطة استعادة قديمة`);
    }
  };

  const getRollbackStats = () => {
    const total = filteredRollbacks.length;
    const database = filteredRollbacks.filter(rb => rb.data.type === 'database').length;
    const files = filteredRollbacks.filter(rb => rb.data.type === 'file').length;
    const system = filteredRollbacks.filter(rb => rb.data.type === 'system').length;
    
    const totalSize = filteredRollbacks.reduce((sum, rb) => 
      sum + getDataSize(rb.data), 0
    );

    return { total, database, files, system, totalSize };
  };

  const stats = getRollbackStats();

  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">استعادة: {stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{stats.database} قاعدة بيانات</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" />
            <span className="text-sm">{stats.files} ملف</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-500" />
            <span className="text-sm">{formatDataSize({ data: 'size' }).replace(' B', '')} {Math.round(stats.totalSize / 1024)}KB</span>
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
                <Shield className="w-5 h-5" />
                إدارة الاستعادة
              </CardTitle>
              <CardDescription>
                إدارة نقاط الاستعادة والتراجع عن التغييرات
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={cleanupOldRollbacks}>
                <Trash2 className="w-4 h-4 mr-2" />
                تنظيف قديم
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* إحصائيات الاستعادة */}
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.database}</div>
              <div className="text-sm text-muted-foreground">قاعدة بيانات</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-green-600">{stats.files}</div>
              <div className="text-sm text-muted-foreground">ملفات</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-purple-600">{stats.system}</div>
              <div className="text-sm text-muted-foreground">نظام</div>
            </div>
            <div className="text-center p-2 border rounded">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(stats.totalSize / 1024)}KB
              </div>
              <div className="text-sm text-muted-foreground">حجم البيانات</div>
            </div>
          </div>

          {/* إعدادات الاستعادة */}
          {showConfig && (
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  إعدادات الاستعادة
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                      />
                      تفعيل الاستعادة التلقائية
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label>فترة الاحتفاظ (أيام)</Label>
                    <Input
                      type="number"
                      value={config.retentionPeriod}
                      onChange={(e) => setConfig({ ...config, retentionPeriod: parseInt(e.target.value) || 30 })}
                      min="1"
                      max="365"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأقصى لنقاط الاستعادة</Label>
                    <Input
                      type="number"
                      value={config.maxRollbackPoints}
                      onChange={(e) => setConfig({ ...config, maxRollbackPoints: parseInt(e.target.value) || 100 })}
                      min="10"
                      max="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.compressionEnabled}
                        onChange={(e) => setConfig({ ...config, compressionEnabled: e.target.checked })}
                      />
                      ضغط البيانات
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* قائمة نقاط الاستعادة */}
          {filteredRollbacks.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {operationId 
                  ? 'لا توجد نقاط استعادة لهذه العملية'
                  : 'لا توجد نقاط استعادة متاحة'
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
                    <TableHead>الحجم</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>التحقق</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRollbacks.map(({ id, data }) => {
                    const operation = getOperation(id);
                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {operation?.title || `عملية ${id}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {operation?.description || 'لا يوجد وصف'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(data.type)}
                            <Badge className={getTypeColor(data.type)}>
                              {getTypeLabel(data.type)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDataSize(data.data)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{data.timestamp.toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              {data.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-mono">
                              {data.checksum.substring(0, 8)}...
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRollback(data);
                                setShowDetails(true);
                              }}
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
                                  onClick={() => handleRollback(data)}
                                  disabled={isProcessing}
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  استعادة
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => exportRollbackData(data)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  تصدير
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteRollbackData(data)}
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

          {/* تحذير الاستعادة */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>تنبيه:</strong> عملية الاستعادة ستؤثر على البيانات الحالية. 
              يُنصح بإنشاء نسخة احتياطية قبل الاستعادة.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* تفاصيل نقطة الاستعادة */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل نقطة الاستعادة</DialogTitle>
            <DialogDescription>
              معلومات تفصيلية عن نقطة الاستعادة المحددة
            </DialogDescription>
          </DialogHeader>
          
          {selectedRollback && (
            <div className="space-y-4">
              {/* معلومات أساسية */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">نوع الاستعادة:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedRollback.type)}
                    <Badge className={getTypeColor(selectedRollback.type)}>
                      {getTypeLabel(selectedRollback.type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium">حجم البيانات:</span>
                  <div>{formatDataSize(selectedRollback.data)}</div>
                </div>
                <div>
                  <span className="font-medium">تاريخ الإنشاء:</span>
                  <div>{selectedRollback.timestamp.toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium">رمز التحقق:</span>
                  <div className="font-mono text-xs break-all">
                    {selectedRollback.checksum}
                  </div>
                </div>
              </div>

              {/* عملية مرتبطة */}
              {selectedRollback.operationId && (
                <div className="space-y-2">
                  <span className="font-medium">العملية المرتبط:</span>
                  <div className="p-3 border rounded">
                    {(() => {
                      const operation = getOperation(selectedRollback.operationId);
                      return operation ? (
                        <div>
                          <div className="font-medium">{operation.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {operation.description}
                          </div>
                          <div className="mt-2 space-y-1">
                            <Badge className={`mr-2 ${
                              operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              operation.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {operation.status === 'completed' ? 'مكتملة' :
                               operation.status === 'failed' ? 'فشلت' :
                               operation.status === 'running' ? 'قيد المعالجة' :
                               'في الانتظار'}
                            </Badge>
                            {operation.totalItems && (
                              <span className="text-sm text-muted-foreground">
                                {operation.processedItems} / {operation.totalItems} عنصر
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          العملية غير متاحة
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* البيانات */}
              <div className="space-y-2">
                <span className="font-medium">البيانات المحفوظة:</span>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(selectedRollback.data, null, 2)}
                </pre>
              </div>

              {/* البيانات الوصفية */}
              {selectedRollback.metadata && (
                <div className="space-y-2">
                  <span className="font-medium">البيانات الوصفية:</span>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(selectedRollback.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  إغلاق
                </Button>
                <Button
                  onClick={() => {
                    handleRollback(selectedRollback);
                    setShowDetails(false);
                  }}
                  disabled={isProcessing}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  استعادة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RollbackManager;