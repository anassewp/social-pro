'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BulkAction } from '@/lib/types/batch';
import { useBatch } from './BatchOperationsProvider';
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Download, 
  Upload,
  Copy,
  Archive,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsProps {
  data: any[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  actions?: BulkAction[];
  entityType?: string;
  className?: string;
}

const DefaultActions: BulkAction[] = [
  {
    id: 'bulk_delete',
    name: 'حذف المحدد',
    description: 'حذف العناصر المحددة',
    icon: 'Trash2',
    color: 'destructive',
    enabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'هل أنت متأكد من حذف العناصر المحددة؟',
    handler: async (selectedIds) => {
      // منطق الحذف
      console.log('Deleting items:', selectedIds);
    },
  },
  {
    id: 'bulk_edit',
    name: 'تعديل المحدد',
    description: 'تعديل العناصر المحددة',
    icon: 'Edit',
    color: 'default',
    enabled: true,
    requiresConfirmation: false,
    handler: async (selectedIds) => {
      // منطق التعديل
      console.log('Editing items:', selectedIds);
    },
  },
  {
    id: 'bulk_export',
    name: 'تصدير المحدد',
    description: 'تصدير العناصر المحددة',
    icon: 'Download',
    color: 'default',
    enabled: true,
    requiresConfirmation: false,
    handler: async (selectedIds) => {
      // منطق التصدير
      console.log('Exporting items:', selectedIds);
    },
  },
  {
    id: 'bulk_copy',
    name: 'نسخ المحدد',
    description: 'نسخ العناصر المحددة',
    icon: 'Copy',
    color: 'default',
    enabled: true,
    requiresConfirmation: false,
    handler: async (selectedIds) => {
      // منطق النسخ
      console.log('Copying items:', selectedIds);
    },
  },
  {
    id: 'bulk_archive',
    name: 'أرشفة المحدد',
    description: 'أرشفة العناصر المحددة',
    icon: 'Archive',
    color: 'secondary',
    enabled: true,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد أرشفة العناصر المحددة؟',
    handler: async (selectedIds) => {
      // منطق الأرشفة
      console.log('Archiving items:', selectedIds);
    },
  },
];

const getActionIcon = (iconName: string) => {
  const icons = {
    Trash2: <Trash2 className="w-4 h-4" />,
    Edit: <Edit className="w-4 h-4" />,
    Download: <Download className="w-4 h-4" />,
    Upload: <Upload className="w-4 h-4" />,
    Copy: <Copy className="w-4 h-4" />,
    Archive: <Archive className="w-4 h-4" />,
    RefreshCw: <RefreshCw className="w-4 h-4" />,
  };
  return icons[iconName as keyof typeof icons] || <MoreHorizontal className="w-4 h-4" />;
};

export const BulkActions: React.FC<BulkActionsProps> = ({
  data,
  selectedItems,
  onSelectionChange,
  actions = DefaultActions,
  entityType = 'عنصر',
  className = '',
}) => {
  const { addOperation, addToQueue } = useBatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<BulkAction | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelectAll = () => {
    if (selectedItems.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(item => item.id));
    }
  };

  const handleAction = async (action: BulkAction) => {
    if (selectedItems.length === 0) {
      toast.error('يرجى تحديد عناصر أولاً');
      return;
    }

    // التحقق من صحة العملية
    if (action.validation) {
      const validationError = await action.validation(selectedItems);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    // إظهار التأكيد إذا لزم الأمر
    if (action.requiresConfirmation) {
      setConfirmationAction(action);
      setShowConfirmation(true);
      return;
    }

    // تنفيذ العملية مباشرة
    await executeAction(action);
  };

  const executeAction = async (action: BulkAction) => {
    setIsProcessing(true);
    setShowConfirmation(false);
    
    try {
      // إنشاء عملية جماعية
      const operationId = addOperation({
        type: 'bulk_update',
        title: `${action.name} - ${selectedItems.length} ${entityType}`,
        description: action.description,
        priority: 'normal',
        progress: 0,
        totalItems: selectedItems.length,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        data: { selectedItems, action: action.id },
      });

      // إضافة إلى الطابور
      await addToQueue({
        priority: 'normal',
        data: { selectedItems, action: action.id, operationId },
        retryCount: 0,
        maxRetries: 3,
        scheduledAt: new Date(),
        handler: async (queueData) => {
          await action.handler(selectedItems, queueData);
        },
      });

      toast.success('تم إضافة العملية إلى الطابور');
    } catch (error) {
      toast.error('فشل في تنفيذ العملية');
    } finally {
      setIsProcessing(false);
      setConfirmationAction(null);
    }
  };

  const enabledActions = actions.filter(action => action.enabled);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* تحديد الكل */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={data.length > 0 && selectedItems.length === data.length}
          onCheckedChange={handleSelectAll}
          disabled={data.length === 0}
        />
        <span className="text-sm text-muted-foreground">
          {selectedItems.length} من {data.length} محدد
        </span>
      </div>

      {/* الإجراءات الجماعية */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <MoreHorizontal className="w-4 h-4 mr-2" />
                إجراءات جماعية
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>الإجراءات المتاحة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {enabledActions.map(action => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleAction(action)}
                  disabled={isProcessing}
                  className={action.color === 'destructive' ? 'text-destructive' : ''}
                >
                  {action.icon && getActionIcon(action.icon)}
                  <span className="mr-2">{action.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* رسالة عدم تحديد عناصر */}
      {selectedItems.length === 0 && (
        <span className="text-sm text-muted-foreground">
          حدد عناصر للبدء بالإجراءات الجماعية
        </span>
      )}

      {/* حوار التأكيد */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد العملية</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction?.confirmationMessage || 'هل أنت متأكد من هذه العملية؟'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmationAction && executeAction(confirmationAction)}
              className={confirmationAction?.color === 'destructive' ? 'bg-destructive' : ''}
            >
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BulkActions;