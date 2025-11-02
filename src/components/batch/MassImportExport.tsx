'use client';

import React, { useState, useRef, useCallback } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useBatch } from './BatchOperationsProvider';
import { ImportExportConfig } from '@/lib/types/batch';
import { toast } from 'sonner';

interface MassImportExportProps {
  entityType: string;
  entityFields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  onImport?: (data: any[]) => Promise<void>;
  onExport?: (filters?: any) => Promise<any[]>;
  config?: Partial<ImportExportConfig>;
  className?: string;
}

const defaultConfig: ImportExportConfig = {
  fileType: 'csv',
  hasHeaders: true,
  encoding: 'UTF-8',
  delimiter: ',',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['csv', 'excel', 'json'],
  validationRules: {},
};

export const MassImportExport: React.FC<MassImportExportProps> = ({
  entityType,
  entityFields,
  onImport,
  onExport,
  config = {},
  className = '',
}) => {
  const { addOperation, addToQueue } = useBatch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [importData, setImportData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const finalConfig = { ...defaultConfig, ...config };

  // استيراد البيانات
  const handleFileUpload = useCallback(async (file: File) => {
    if (file.size > finalConfig.maxFileSize) {
      toast.error(`حجم الملف يتجاوز الحد المسموح (${finalConfig.maxFileSize / 1024 / 1024}MB)`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('قراءة الملف...');

    try {
      const operationId = addOperation({
        type: 'import',
        title: `استيراد ${entityType}`,
        description: `استيراد البيانات من ${file.name}`,
        priority: 'normal',
        progress: 0,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        data: { fileName: file.name, fileType: finalConfig.fileType },
      });

      setProgress(10);
      setCurrentStep('تحليل البيانات...');

      // قراءة وتحليل الملف
      const data = await parseFile(file, finalConfig);
      setImportData(data);
      setPreviewData(data.slice(0, 10)); // عرض أول 10 صفوف

      setProgress(50);
      setCurrentStep('التحقق من صحة البيانات...');

      // التحقق من صحة البيانات
      const errors = await validateData(data, entityFields);
      setValidationErrors(errors);

      setProgress(100);
      setCurrentStep('تم استيراد الملف بنجاح');

      await addToQueue({
        priority: 'normal',
        data: { data, operationId },
        retryCount: 0,
        maxRetries: 3,
        scheduledAt: new Date(),
        handler: async (queueData) => {
          if (onImport) {
            await onImport(queueData.data);
          }
        },
      });

      if (errors.length > 0) {
        toast.warning(`تم تحميل الملف مع ${errors.length} خطأ`);
      } else {
        toast.success('تم تحميل الملف بنجاح');
      }
    } catch (error) {
      toast.error('فشل في تحميل الملف');
      console.error('Import error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [entityType, entityFields, finalConfig, onImport, addOperation, addToQueue]);

  // تصدير البيانات
  const handleExport = useCallback(async (format: string, filters?: any) => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('جمع البيانات...');

    try {
      const operationId = addOperation({
        type: 'export',
        title: `تصدير ${entityType}`,
        description: `تصدير البيانات بصيغة ${format.toUpperCase()}`,
        priority: 'normal',
        progress: 0,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        data: { format, filters },
      });

      setProgress(25);
      setCurrentStep('استرجاع البيانات...');

      // استرجاع البيانات
      let data: any[] = [];
      if (onExport) {
        data = await onExport(filters);
      }

      setProgress(50);
      setCurrentStep('تنسيق البيانات...');

      // تنسيق البيانات للتصدير
      const exportData = formatData(data, format, entityFields);

      setProgress(75);
      setCurrentStep('إنشاء الملف...');

      // إنشاء وتحميل الملف
      const blob = await createFile(exportData, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setCurrentStep('تم تصدير البيانات بنجاح');

      await addToQueue({
        priority: 'normal',
        data: { data, operationId },
        retryCount: 0,
        maxRetries: 3,
        scheduledAt: new Date(),
        handler: async () => {
          // تحديث حالة العملية
          console.log('Export completed');
        },
      });

      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير البيانات');
      console.error('Export error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [entityType, entityFields, onExport, addOperation, addToQueue]);

  // قراءة وتحليل الملف
  const parseFile = async (file: File, config: ImportExportConfig): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let data: any[] = [];

          switch (config.fileType) {
            case 'csv':
              data = parseCSV(content, config.delimiter || ',');
              break;
            case 'json':
              data = JSON.parse(content);
              break;
            case 'excel':
              // استخدام مكتبة لفحص ملفات Excel
              data = parseExcel(content);
              break;
            default:
              throw new Error('نوع ملف غير مدعوم');
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      reader.readAsText(file, config.encoding);
    });
  };

  // تحليل ملف CSV
  const parseCSV = (content: string, delimiter: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(delimiter).map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(delimiter);
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  };

  // تحليل ملف Excel (مبسط)
  const parseExcel = (content: string): any[] => {
    // تنفيذ مبسط - يمكن استخدام مكتبة مثل xlsx
    throw new Error('تحليل ملفات Excel غير مدعوم حالياً');
  };

  // التحقق من صحة البيانات
  const validateData = async (data: any[], fields: any[]): Promise<string[]> => {
    const errors: string[] = [];

    data.forEach((row, index) => {
      fields.forEach(field => {
        if (field.required && (!row[field.name] || row[field.name].toString().trim() === '')) {
          errors.push(`الصف ${index + 1}: الحقل "${field.label}" مطلوب`);
        }
      });
    });

    return errors;
  };

  // تنسيق البيانات للتصدير
  const formatData = (data: any[], format: string, fields: any[]): any => {
    switch (format) {
      case 'csv':
        return convertToCSV(data, fields);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'excel':
        return convertToExcel(data, fields);
      default:
        return data;
    }
  };

  // تحويل إلى CSV
  const convertToCSV = (data: any[], fields: any[]): string => {
    const headers = fields.map(f => f.label).join(',');
    const rows = data.map(row => 
      fields.map(field => {
        const value = row[field.name] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  // تحويل إلى Excel (مبسط)
  const convertToExcel = (data: any[], fields: any[]): string => {
    // تنفيذ مبسط - يمكن استخدام مكتبة مثل xlsx
    throw new Error('تصدير ملفات Excel غير مدعوم حالياً');
  };

  // إنشاء ملف للتحميل
  const createFile = async (data: any, format: string): Promise<Blob> => {
    let content: string;
    let mimeType: string;

    switch (format) {
      case 'csv':
        content = data;
        mimeType = 'text/csv;charset=utf-8';
        break;
      case 'json':
        content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        mimeType = 'application/json;charset=utf-8';
        break;
      default:
        content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        mimeType = 'application/octet-stream';
    }

    return new Blob([content], { type: mimeType });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          استيراد/تصدير
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إدارة البيانات الجماعية</DialogTitle>
          <DialogDescription>
            استيراد وتصدير البيانات للـ {entityType}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">استيراد</TabsTrigger>
            <TabsTrigger value="export">تصدير</TabsTrigger>
          </TabsList>

          {/* تبويب الاستيراد */}
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  الصيغ المدعومة: {finalConfig.supportedFormats.join(', ')} | 
                  الحد الأقصى: {finalConfig.maxFileSize / 1024 / 1024}MB
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>اختر ملف للاستيراد</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={`.${finalConfig.supportedFormats.join(', .')}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  disabled={isProcessing}
                />
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{currentStep}</span>
                    <span className="text-sm">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {previewData.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">معاينة البيانات</h4>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {entityFields.map(field => (
                            <th key={field.name} className="p-2 text-right">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-t">
                            {entityFields.map(field => (
                              <td key={field.name} className="p-2">
                                {row[field.name] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {validationErrors.length > 0 && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>تم العثور على {validationErrors.length} خطأ:</p>
                      <ul className="list-disc list-inside text-xs">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                      {validationErrors.length > 10 && (
                        <p>و {validationErrors.length - 10} أخطاء أخرى...</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* تبويب التصدير */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  اختر صيغة التصدير لتحميل بيانات {entityType}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4">
                {finalConfig.supportedFormats.map(format => (
                  <Button
                    key={format}
                    variant="outline"
                    onClick={() => handleExport(format)}
                    disabled={isProcessing}
                    className="h-20 flex-col"
                  >
                    {format === 'csv' && <FileText className="w-6 h-6 mb-2" />}
                    {format === 'excel' && <FileSpreadsheet className="w-6 h-6 mb-2" />}
                    <span>{format.toUpperCase()}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MassImportExport;