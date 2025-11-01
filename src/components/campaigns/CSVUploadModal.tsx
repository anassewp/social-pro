'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Upload, FileText, X, CheckCircle2 } from 'lucide-react'
import { ButtonLoading } from '@/components/ui/Loading'
// سيتم استخدام parser مخصص للـ CSV و Excel

interface CSVUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (data: Array<{ name?: string; phone?: string; telegram_id?: string; username?: string }>) => void
}

export function CSVUploadModal({ open, onOpenChange, onUpload }: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>({})
  const [detectedColumns, setDetectedColumns] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPreview([])
    setColumnMapping({})

    try {
      const data = await parseFile(selectedFile)
      
      if (data.length === 0) {
        alert('الملف فارغ أو لا يحتوي على بيانات')
        return
      }

      // عرض أول 5 صفوف كمعاينة
      setPreview(data.slice(0, 5))
      
      // التعرف التلقائي على الأعمدة
      const columns = Object.keys(data[0])
      setDetectedColumns(columns)
      
      // محاولة التعرف التلقائي على الأعمدة بناءً على الاسم
      const autoMapping: { [key: string]: string } = {}
      columns.forEach(col => {
        const lowerCol = col.toLowerCase()
        
        if (lowerCol.includes('name') || lowerCol.includes('اسم') || lowerCol.includes('first')) {
          autoMapping['name'] = col
        } else if (lowerCol.includes('phone') || lowerCol.includes('جوال') || lowerCol.includes('mobile') || lowerCol.includes('tel')) {
          autoMapping['phone'] = col
        } else if (lowerCol.includes('telegram') || lowerCol.includes('tg') || lowerCol.includes('id') || lowerCol.includes('user_id')) {
          if (lowerCol.includes('username') || lowerCol.includes('user')) {
            autoMapping['username'] = col
          } else {
            autoMapping['telegram_id'] = col
          }
        } else if (lowerCol.includes('username') || lowerCol.includes('user') || lowerCol === '@' || lowerCol === 'user') {
          autoMapping['username'] = col
        }
      })
      
      setColumnMapping(autoMapping)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('حدث خطأ في قراءة الملف. يرجى التأكد من أن الملف بصيغة CSV أو Excel.')
    }
  }

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const text = e.target?.result as string
            const lines = text.split('\n').filter(line => line.trim())
            if (lines.length === 0) {
              resolve([])
              return
            }
            
            // Extract headers
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
            const data = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
              const obj: any = {}
              headers.forEach((header, index) => {
                obj[header] = values[index] || ''
              })
              return obj
            })
            
            resolve(data)
          } else {
            // For Excel files, we'll need xlsx library
            // For now, show a message
            reject(new Error('ملفات Excel تحتاج إلى تثبيت مكتبة xlsx. يرجى استخدام ملف CSV أو تثبيت المكتبة: npm install xlsx'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = reject
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8')
      } else {
        reader.readAsBinaryString(file)
      }
    })
  }

  const handleUpload = () => {
    if (!file || preview.length === 0) {
      alert('يرجى اختيار ملف أولاً')
      return
    }

    // التحقق من أن جميع الأعمدة المطلوبة تم تعيينها
    const requiredFields = ['name', 'phone', 'telegram_id', 'username']
    const hasAtLeastOne = requiredFields.some(field => columnMapping[field])
    
    if (!hasAtLeastOne) {
      alert('يرجى تعيين عمود واحد على الأقل (الاسم، رقم الهاتف، معرف تيليجرام، أو اسم المستخدم)')
      return
    }

    setUploading(true)

    // تحويل البيانات حسب التعيين
    const mappedData = preview.map((row: any) => {
      const mapped: any = {}
      
      if (columnMapping.name) mapped.name = row[columnMapping.name]
      if (columnMapping.phone) mapped.phone = row[columnMapping.phone]
      if (columnMapping.telegram_id) mapped.telegram_id = row[columnMapping.telegram_id]
      if (columnMapping.username) mapped.username = row[columnMapping.username]?.toString().replace('@', '')
      
      return mapped
    })

    onUpload(mappedData)
    setUploading(false)
    
    // إعادة تعيين
    setFile(null)
    setPreview([])
    setColumnMapping({})
    setDetectedColumns([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-foreground">
            <Upload className="h-5 w-5 ml-2 text-primary" />
            رفع ملف CSV/Excel
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ارفع ملف CSV أو Excel يحتوي على جهات الاتصال. سيتم التعرف التلقائي على الأعمدة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* اختيار الملف */}
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-foreground">اختر الملف</Label>
            <div className="flex items-center gap-3">
              <Input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="flex-1 bg-background border-border text-foreground"
              />
              {file && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setPreview([])
                    setColumnMapping({})
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              الصيغ المدعومة: CSV, XLSX, XLS
            </p>
          </div>

          {/* معاينة البيانات */}
          {preview.length > 0 && (
            <>
              <div className="space-y-2">
                <Label className="text-foreground">معاينة البيانات ({preview.length} صف)</Label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[200px]">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {detectedColumns.map((col) => (
                            <th key={col} className="px-3 py-2 text-right text-muted-foreground font-medium border-b border-border">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-background">
                        {preview.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-border">
                            {detectedColumns.map((col) => (
                              <td key={col} className="px-3 py-2 text-foreground text-right">
                                {row[col]?.toString() || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* تعيين الأعمدة */}
              <div className="space-y-3">
                <Label className="text-foreground">تعيين الأعمدة (اختياري)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="map-name" className="text-xs text-muted-foreground">الاسم</Label>
                    <select
                      id="map-name"
                      name="map-name"
                      value={columnMapping.name || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                      className="w-full p-2 border border-border bg-background text-foreground rounded-md"
                    >
                      <option value="">-- اختر العمود --</option>
                      {detectedColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="map-phone" className="text-xs text-muted-foreground">رقم الهاتف</Label>
                    <select
                      id="map-phone"
                      name="map-phone"
                      value={columnMapping.phone || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                      className="w-full p-2 border border-border bg-background text-foreground rounded-md"
                    >
                      <option value="">-- اختر العمود --</option>
                      {detectedColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="map-telegram-id" className="text-xs text-muted-foreground">معرف تيليجرام</Label>
                    <select
                      id="map-telegram-id"
                      name="map-telegram-id"
                      value={columnMapping.telegram_id || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, telegram_id: e.target.value })}
                      className="w-full p-2 border border-border bg-background text-foreground rounded-md"
                    >
                      <option value="">-- اختر العمود --</option>
                      {detectedColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="map-username" className="text-xs text-muted-foreground">اسم المستخدم</Label>
                    <select
                      id="map-username"
                      name="map-username"
                      value={columnMapping.username || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, username: e.target.value })}
                      className="w-full p-2 border border-border bg-background text-foreground rounded-md"
                    >
                      <option value="">-- اختر العمود --</option>
                      {detectedColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                  <p className="text-xs text-foreground flex items-center">
                    <AlertCircle className="h-3 w-3 ml-2 text-primary" />
                    💡 تم التعرف التلقائي على الأعمدة. يمكنك تعديل التعيين يدوياً إذا لزم الأمر.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* أزرار الإجراء */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || preview.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <ButtonLoading className="ml-2" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                  رفع البيانات
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

