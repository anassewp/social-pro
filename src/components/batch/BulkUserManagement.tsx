'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  ShieldOff,
  Mail,
  UserCheck,
  UserX,
  Crown,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useBatch } from './BatchOperationsProvider';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  lastActive: Date;
  joinDate: Date;
}

interface BulkUserAction {
  type: 'assign_role' | 'remove_role' | 'activate' | 'deactivate' | 'send_invitation' | 'suspend' | 'unsuspend';
  name: string;
  description: string;
  icon: React.ReactNode;
  requiresConfirmation: boolean;
  requiresRole?: string;
}

interface BulkUserManagementProps {
  users: User[];
  currentUserRole: 'admin' | 'manager';
  onBulkAction?: (action: string, userIds: string[], data?: any) => Promise<void>;
  className?: string;
}

const BulkUserActions: BulkUserAction[] = [
  {
    type: 'assign_role',
    name: 'تعيين دور',
    description: 'تعيين دور جديد للمستخدمين المحددين',
    icon: <Crown className="w-4 h-4" />,
    requiresConfirmation: true,
  },
  {
    type: 'remove_role',
    name: 'إزالة دور',
    description: 'إزالة الدور من المستخدمين المحددين',
    icon: <ShieldOff className="w-4 h-4" />,
    requiresConfirmation: true,
    requiresRole: 'admin',
  },
  {
    type: 'activate',
    name: 'تفعيل',
    description: 'تفعيل المستخدمين المحددين',
    icon: <UserCheck className="w-4 h-4" />,
    requiresConfirmation: false,
  },
  {
    type: 'deactivate',
    name: 'إلغاء التفعيل',
    description: 'إلغاء تفعيل المستخدمين المحددين',
    icon: <UserX className="w-4 h-4" />,
    requiresConfirmation: true,
  },
  {
    type: 'send_invitation',
    name: 'إرسال دعوات',
    description: 'إرسال دعوات للمستخدمين المحددين',
    icon: <Mail className="w-4 h-4" />,
    requiresConfirmation: false,
  },
  {
    type: 'suspend',
    name: 'إيقاف مؤقت',
    description: 'إيقاف المستخدمين المحددين مؤقتاً',
    icon: <Clock className="w-4 h-4" />,
    requiresConfirmation: true,
  },
  {
    type: 'unsuspend',
    name: 'إلغاء الإيقاف',
    description: 'إلغاء إيقاف المستخدمين المحددين',
    icon: <UserCheck className="w-4 h-4" />,
    requiresConfirmation: false,
  },
];

export const BulkUserManagement: React.FC<BulkUserManagementProps> = ({
  users,
  currentUserRole,
  onBulkAction,
  className = '',
}) => {
  const { addOperation, addToQueue } = useBatch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<BulkUserAction | null>(null);
  const [actionData, setActionData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const availableActions = currentUserRole === 'admin' 
    ? BulkUserActions 
    : BulkUserActions.filter(action => action.type !== 'remove_role');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleAction = (action: BulkUserAction) => {
    if (selectedUsers.length === 0) {
      toast.error('يرجى تحديد مستخدمين أولاً');
      return;
    }

    setSelectedAction(action);
    
    if (action.requiresConfirmation) {
      setIsOpen(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: BulkUserAction) => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('تحضير العملية...');

    try {
      const operationId = addOperation({
        type: 'user_management',
        title: `${action.name} - ${selectedUsers.length} مستخدم`,
        description: action.description,
        priority: action.type.includes('suspend') || action.type.includes('remove_role') ? 'high' : 'normal',
        progress: 0,
        totalItems: selectedUsers.length,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        data: { selectedUsers, actionType: action.type, actionData },
      });

      setProgress(20);
      setCurrentStep('التحقق من البيانات...');

      // التحقق من صحة البيانات
      const validationResult = await validateUsers(selectedUsers, action);
      if (!validationResult.valid) {
        throw new Error(validationResult.error);
      }

      setProgress(40);
      setCurrentStep('تنفيذ العملية...');

      // إضافة إلى الطابور
      await addToQueue({
        priority: 'normal',
        data: { selectedUsers, actionType: action.type, actionData, operationId },
        retryCount: 0,
        maxRetries: 3,
        scheduledAt: new Date(),
        handler: async (queueData) => {
          await performBulkAction(queueData);
        },
      });

      setProgress(100);
      setCurrentStep('تمت العملية بنجاح');

      toast.success(`تمت العملية بنجاح لـ ${selectedUsers.length} مستخدم`);
    } catch (error) {
      setCurrentStep('فشلت العملية');
      toast.error(error instanceof Error ? error.message : 'فشلت العملية');
    } finally {
      setIsProcessing(false);
    }

    setIsOpen(false);
    setSelectedAction(null);
    setSelectedUsers([]);
    setActionData({});
  };

  const validateUsers = async (userIds: string[], action: BulkUserAction) => {
    const selectedUserObjects = users.filter(user => userIds.includes(user.id));
    
    // التحقق من الصلاحيات
    if (action.requiresRole === 'admin' && currentUserRole !== 'admin') {
      return { valid: false, error: 'ليس لديك صلاحية لتنفيذ هذه العملية' };
    }

    // التحقق من حالة المستخدمين
    for (const user of selectedUserObjects) {
      if (action.type === 'activate' && user.status === 'active') {
        return { valid: false, error: `المستخدم ${user.name} مفعل بالفعل` };
      }
      if (action.type === 'deactivate' && user.status !== 'active') {
        return { valid: false, error: `المستخدم ${user.name} غير مفعل` };
      }
    }

    return { valid: true };
  };

  const performBulkAction = async (queueData: any) => {
    const { selectedUsers, actionType, actionData } = queueData;
    let processedCount = 0;
    let successCount = 0;

    for (const userId of selectedUsers) {
      try {
        // تنفيذ العملية على المستخدم
        await performUserAction(userId, actionType, actionData);
        successCount++;
      } catch (error) {
        console.error(`فشل في تنفيذ العملية على المستخدم ${userId}:`, error);
      } finally {
        processedCount++;
        const progress = Math.round((processedCount / selectedUsers.length) * 100);
        setProgress(progress);
        setCurrentStep(`تمت معالجة ${processedCount} من ${selectedUsers.length} مستخدم`);
      }
    }

    // تحديث حالة العملية
    console.log(`تمت العملية: ${successCount} نجح، ${processedCount - successCount} فشل`);
  };

  const performUserAction = async (userId: string, actionType: string, actionData: any) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error(`المستخدم غير موجود: ${userId}`);
    }

    // محاكاة تنفيذ العملية
    console.log(`تنفيذ ${actionType} على المستخدم:`, user.name);
    
    // انتظار عشوائي لمحاكاة المعالجة
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // استدعاء callback إذا كان متاحاً
    if (onBulkAction) {
      await onBulkAction(actionType, [userId], actionData);
    }
  };

  const renderActionForm = () => {
    if (!selectedAction) return null;

    switch (selectedAction.type) {
      case 'assign_role':
      case 'remove_role':
        return (
          <div className="space-y-2">
            <Label>اختر الدور</Label>
            <Select value={actionData.role || ''} onValueChange={(value) => setActionData({ ...actionData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="manager">مشرف</SelectItem>
                <SelectItem value="user">مستخدم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'suspend':
        return (
          <div className="space-y-2">
            <Label>سبب الإيقاف</Label>
            <Input
              value={actionData.reason || ''}
              onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
              placeholder="سبب الإيقاف (اختياري)"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* زر إدارة المستخدمين */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            إدارة جماعية
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إدارة المستخدمين الجماعية</DialogTitle>
            <DialogDescription>
              تنفيذ عمليات جماعية على المستخدمين المحددين
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">قائمة المستخدمين</TabsTrigger>
              <TabsTrigger value="actions">الإجراءات الجماعية</TabsTrigger>
            </TabsList>

            {/* تبويب قائمة المستخدمين */}
            <TabsContent value="users" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAll}
                  />
                  <Label>تحديد الكل ({selectedUsers.length} من {users.length})</Label>
                </div>
                
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-right">تحديد</th>
                        <th className="p-2 text-right">الاسم</th>
                        <th className="p-2 text-right">البريد الإلكتروني</th>
                        <th className="p-2 text-right">الدور</th>
                        <th className="p-2 text-right">الحالة</th>
                        <th className="p-2 text-right">آخر نشاط</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-t">
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </td>
                          <td className="p-2 font-medium">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role === 'admin' ? 'مدير' : 
                               user.role === 'manager' ? 'مشرف' : 'مستخدم'}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status === 'active' ? 'نشط' : 
                               user.status === 'inactive' ? 'غير نشط' : 'موقوف'}
                            </Badge>
                          </td>
                          <td className="p-2">{user.lastActive.toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* تبويب الإجراءات الجماعية */}
            <TabsContent value="actions" className="space-y-4">
              {selectedUsers.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    يرجى تحديد مستخدمين أولاً من تبويب "قائمة المستخدمين"
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {availableActions.map(action => (
                    <Button
                      key={action.type}
                      variant="outline"
                      onClick={() => handleAction(action)}
                      disabled={isProcessing}
                      className="h-20 flex-col text-center"
                    >
                      {action.icon}
                      <span className="mt-2">{action.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* نموذج تنفيذ العملية */}
          {selectedAction && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{selectedAction.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
              
              {renderActionForm()}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedAction(null);
                    setActionData({});
                  }}
                  disabled={isProcessing}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => executeAction(selectedAction)}
                  disabled={isProcessing}
                >
                  تنفيذ العملية
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkUserManagement;