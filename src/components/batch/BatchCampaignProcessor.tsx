'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Pause,
  Square,
  Zap,
  Users,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useBatch } from './BatchOperationsProvider';
import { toast } from 'sonner';

interface CampaignBatch {
  id: string;
  name: string;
  type: 'send_messages' | 'add_members' | 'create_polls' | 'schedule_posts';
  campaigns: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  totalItems: number;
  processedItems: number;
  successItems: number;
  failedItems: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  settings: {
    delay: number; // seconds between actions
    batchSize: number;
    retryAttempts: number;
    stopOnError: boolean;
  };
}

interface BatchCampaignProcessorProps {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    groupCount: number;
    memberCount: number;
  }>;
  onBatchCreate?: (batch: CampaignBatch) => Promise<void>;
  onBatchUpdate?: (batchId: string, updates: Partial<CampaignBatch>) => Promise<void>;
  className?: string;
}

export const BatchCampaignProcessor: React.FC<BatchCampaignProcessorProps> = ({
  campaigns,
  onBatchCreate,
  onBatchUpdate,
  className = '',
}) => {
  const { addOperation, addToQueue, updateOperation } = useBatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<CampaignBatch | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [batchType, setBatchType] = useState<CampaignBatch['type']>('send_messages');
  const [settings, setSettings] = useState({
    delay: 5,
    batchSize: 10,
    retryAttempts: 3,
    stopOnError: false,
  });

  const campaignTypes = [
    { value: 'send_messages', label: 'إرسال رسائل', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'add_members', label: 'إضافة أعضاء', icon: <Users className="w-4 h-4" /> },
    { value: 'create_polls', label: 'إنشاء استطلاعات', icon: <Zap className="w-4 h-4" /> },
    { value: 'schedule_posts', label: 'جدولة منشورات', icon: <Send className="w-4 h-4" /> },
  ];

  const getTypeIcon = (type: string) => {
    const campaignType = campaignTypes.find(t => t.value === type);
    return campaignType?.icon || <Zap className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
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

  const handleCreateBatch = async () => {
    if (selectedCampaigns.length === 0) {
      toast.error('يرجى اختيار حملات أولاً');
      return;
    }

    setIsProcessing(true);

    try {
      const batch: CampaignBatch = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `دفعة ${batchTypes.find(t => t.value === batchType)?.label} - ${new Date().toLocaleDateString()}`,
        type: batchType,
        campaigns: selectedCampaigns,
        status: 'pending',
        totalItems: selectedCampaigns.length,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        createdAt: new Date(),
        settings,
      };

      const operationId = addOperation({
        type: 'campaign_process',
        title: batch.name,
        description: `معالجة ${selectedCampaigns.length} حملة`,
        priority: 'high',
        progress: 0,
        totalItems: selectedCampaigns.length,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        data: { batch, campaignType },
      });

      await addToQueue({
        priority: 'high',
        data: { batch, operationId },
        retryCount: 0,
        maxRetries: settings.retryAttempts,
        scheduledAt: new Date(),
        handler: async (queueData) => {
          await processCampaigns(queueData.batch);
        },
      });

      setCurrentBatch(batch);
      setIsOpen(false);
      setSelectedCampaigns([]);
      
      toast.success('تم إنشاء الدفعة وإضافتها إلى الطابور');
    } catch (error) {
      toast.error('فشل في إنشاء الدفعة');
      console.error('Batch creation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processCampaigns = async (batch: CampaignBatch) => {
    batch.status = 'running';
    batch.startedAt = new Date();
    setCurrentBatch({ ...batch });

    const campaignsToProcess = batch.campaigns;
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < campaignsToProcess.length; i++) {
      const campaignId = campaignsToProcess[i];
      
      try {
        updateOperation(batch.id, {
          currentItem: campaignId,
          progress: Math.round((processedCount / campaignsToProcess.length) * 100),
        });

        // معالجة الحملة
        await processCampaign(campaignId, batch.type, settings);

        processedCount++;
        successCount++;

        // تأخير بين العمليات
        if (i < campaignsToProcess.length - 1 && settings.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, settings.delay * 1000));
        }
      } catch (error) {
        processedCount++;
        failedCount++;
        
        if (settings.stopOnError) {
          throw error;
        }
      }
    }

    batch.status = failedCount === 0 ? 'completed' : 'completed';
    batch.completedAt = new Date();
    batch.processedItems = processedCount;
    batch.successItems = successCount;
    batch.failedItems = failedCount;
    batch.progress = 100;

    setCurrentBatch({ ...batch });
  };

  const processCampaign = async (
    campaignId: string, 
    type: CampaignBatch['type'], 
    settings: any
  ) => {
    // محاكاة معالجة الحملة
    console.log(`Processing campaign ${campaignId} with type ${type}`);
    
    // انتظار عشوائي لمحاكاة المعالجة
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // محاكاة فشل عشوائي
    if (Math.random() < 0.1) {
      throw new Error('فشل في معالجة الحملة');
    }
  };

  const pauseBatch = () => {
    if (currentBatch) {
      currentBatch.status = 'paused';
      setCurrentBatch({ ...currentBatch });
      toast.success('تم إيقاف الدفعة مؤقتاً');
    }
  };

  const resumeBatch = () => {
    if (currentBatch) {
      currentBatch.status = 'running';
      setCurrentBatch({ ...currentBatch });
      toast.success('تم استئناف الدفعة');
    }
  };

  const stopBatch = () => {
    if (currentBatch) {
      currentBatch.status = 'failed';
      currentBatch.completedAt = new Date();
      setCurrentBatch({ ...currentBatch });
      toast.success('تم إيقاف الدفعة');
    }
  };

  return (
    <div className={className}>
      {/* زر إنشاء دفعة جديدة */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            معالجة جماعية
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء دفعة حملات جديدة</DialogTitle>
            <DialogDescription>
              إنشاء دفعة لمعالجة عدة حملات مرة واحدة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* اختيار نوع المعالجة */}
            <div className="space-y-2">
              <Label>نوع المعالجة</Label>
              <Select value={batchType} onValueChange={(v) => setBatchType(v as CampaignBatch['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* اختيار الحملات */}
            <div className="space-y-2">
              <Label>اختر الحملات ({selectedCampaigns.length} محددة)</Label>
              <div className="border rounded-lg p-4 max-h-40 overflow-y-auto space-y-2">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                        } else {
                          setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.groupCount} مجموعة، {campaign.memberCount} عضو
                      </div>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* إعدادات المعالجة */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التأخير بين العمليات (ثانية)</Label>
                <Input
                  type="number"
                  value={settings.delay}
                  onChange={(e) => setSettings({ ...settings, delay: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>حجم الدفعة</Label>
                <Input
                  type="number"
                  value={settings.batchSize}
                  onChange={(e) => setSettings({ ...settings, batchSize: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label>محاولات إعادة المحاولة</Label>
                <Input
                  type="number"
                  value={settings.retryAttempts}
                  onChange={(e) => setSettings({ ...settings, retryAttempts: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.stopOnError}
                    onChange={(e) => setSettings({ ...settings, stopOnError: e.target.checked })}
                  />
                  إيقاف عند الخطأ
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateBatch} disabled={isProcessing || selectedCampaigns.length === 0}>
                {isProcessing ? 'جاري الإنشاء...' : 'إنشاء الدفعة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* عرض الدفعة الحالية */}
      {currentBatch && (
        <div className="mt-4 p-4 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentBatch.status)}
              <h4 className="font-medium">{currentBatch.name}</h4>
              <Badge className={getStatusColor(currentBatch.status)}>
                {currentBatch.status === 'pending' && 'في الانتظار'}
                {currentBatch.status === 'running' && 'قيد المعالجة'}
                {currentBatch.status === 'completed' && 'مكتملة'}
                {currentBatch.status === 'failed' && 'فشلت'}
                {currentBatch.status === 'paused' && 'متوقفة'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {currentBatch.status === 'running' && (
                <Button variant="outline" size="sm" onClick={pauseBatch}>
                  <Pause className="w-4 h-4 mr-1" />
                  إيقاف
                </Button>
              )}
              {currentBatch.status === 'paused' && (
                <Button variant="outline" size="sm" onClick={resumeBatch}>
                  <Play className="w-4 h-4 mr-1" />
                  استئناف
                </Button>
              )}
              {(currentBatch.status === 'running' || currentBatch.status === 'paused') && (
                <Button variant="destructive" size="sm" onClick={stopBatch}>
                  <Square className="w-4 h-4 mr-1" />
                  إنهاء
                </Button>
              )}
            </div>
          </div>

          {currentBatch.currentItem && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                معالجة: {currentBatch.currentItem}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم: {currentBatch.processedItems} / {currentBatch.totalItems}</span>
              <span>{currentBatch.progress}%</span>
            </div>
            <Progress value={currentBatch.progress} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>نجحت: {currentBatch.successItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>فشلت: {currentBatch.failedItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>متبقية: {currentBatch.totalItems - currentBatch.processedItems}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchCampaignProcessor;