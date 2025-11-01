import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { encryptTelegramSession, decryptTelegramSession } from '@/lib/encryption'

export interface TelegramSessionData {
  id: string
  phone: string
  sessionString: string
  isActive: boolean
  lastUsed: Date
  createdAt: Date
}

// Map عام لحفظ العملاء المؤقتين عبر جميع الطلبات
const globalPendingClients = new Map<string, TelegramClient>()

export class TelegramClientManager {
  private apiId: number
  private apiHash: string
  private pendingClients: Map<string, TelegramClient>

  constructor(apiId?: number, apiHash?: string) {
    // استخدام القيم المقدمة أو القيم من متغيرات البيئة
    this.apiId = apiId || parseInt(process.env.TELEGRAM_API_ID || process.env.NEXT_PUBLIC_TELEGRAM_API_ID || '0')
    this.apiHash = apiHash || process.env.TELEGRAM_API_HASH || process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || ''
    
    if (!this.apiId || !this.apiHash) {
      throw new Error('Telegram API credentials not found')
    }
    
    // استخدام الـ Map العام بدلاً من إنشاء واحد جديد
    this.pendingClients = globalPendingClients
  }

  /**
   * إرسال كود التحقق لرقم الهاتف
   */
  async sendCode(phoneNumber: string): Promise<{ phoneCodeHash: string }> {
    try {
      const session = new StringSession('')
      const client = new TelegramClient(session, this.apiId, this.apiHash, {
        connectionRetries: 5,
      })

      await client.connect()

      // استخدام sendCode بدلاً من start
      const result = await client.sendCode(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        phoneNumber
      )

      // حفظ العميل للاستخدام لاحقاً
      this.pendingClients.set(phoneNumber, client)

      return { phoneCodeHash: result.phoneCodeHash }
    } catch (error: any) {
      console.error('Error sending code:', error)
      throw new Error(error.message || 'فشل في إرسال كود التحقق')
    }
  }

  /**
   * التحقق من كود التحقق وإنشاء الجلسة
   */
  async verifyCode(
    phoneNumber: string,
    phoneCode: string,
    phoneCodeHash: string
  ): Promise<{ sessionString: string; userInfo: any }> {
    try {
      // الحصول على العميل المحفوظ
      const client = this.pendingClients.get(phoneNumber)
      
      if (!client) {
        throw new Error('جلسة منتهية الصلاحية، يرجى إعادة إرسال الكود')
      }

      // التحقق من الكود
      await client.invoke(
        new (await import('telegram/tl')).Api.auth.SignIn({
          phoneNumber: phoneNumber,
          phoneCodeHash: phoneCodeHash,
          phoneCode: phoneCode,
        })
      )

      // الحصول على session string
      const sessionString = client.session.save() as any

      // الحصول على معلومات المستخدم
      const me = await client.getMe()
      
      const userInfo = {
        id: me.id?.toString(),
        firstName: me.firstName,
        lastName: me.lastName,
        username: me.username,
        phone: me.phone,
      }

      // تنظيف
      await client.disconnect()
      this.pendingClients.delete(phoneNumber)
      
      return { sessionString: String(sessionString), userInfo }
    } catch (error: any) {
      console.error('Error verifying code:', error)
      
      // تنظيف في حالة الخطأ
      const client = this.pendingClients.get(phoneNumber)
      if (client) {
        try {
          await client.disconnect()
        } catch (e) {
          // ignore
        }
        this.pendingClients.delete(phoneNumber)
      }
      
      if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
        throw new Error('SESSION_PASSWORD_NEEDED')
      }
      
      throw new Error(error.message || 'كود التحقق غير صحيح')
    }
  }

  /**
   * التحقق من كلمة المرور الإضافية (محاكاة)
   */
  async verifyPassword(
    phoneNumber: string,
    password: string
  ): Promise<{ sessionString: string; userInfo: any }> {
    try {
      // محاكاة التحقق من كلمة المرور
      if (password !== 'password123') {
        throw new Error('كلمة المرور غير صحيحة')
      }
      
      const sessionString = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const userInfo = {
        id: Math.floor(Math.random() * 1000000),
        firstName: 'مستخدم',
        lastName: 'محمي',
        username: 'secure_user',
        phone: phoneNumber,
      }
      
      return { sessionString, userInfo }
    } catch (error: any) {
      console.error('Error verifying password:', error)
      throw new Error(error.message || 'كلمة المرور غير صحيحة')
    }
  }
}

// إنشاء instance واحد للاستخدام العام
export const telegramManager = new TelegramClientManager()
