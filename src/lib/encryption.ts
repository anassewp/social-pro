import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

/**
 * تشفير البيانات باستخدام AES-256-CBC
 */
export function encrypt(text: string, key: string): string {
  try {
    const keyBuffer = Buffer.from(key, 'hex')
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // دمج IV + Encrypted Data
    const result = iv.toString('hex') + encrypted
    return result
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('فشل في تشفير البيانات')
  }
}

/**
 * فك تشفير البيانات
 */
export function decrypt(encryptedData: string, key: string): string {
  try {
    // التحقق من صحة البيانات المشفرة
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('البيانات المشفرة غير موجودة أو غير صحيحة')
    }

    // التحقق من طول البيانات (يجب أن تحتوي على IV + البيانات المشفرة)
    const minLength = IV_LENGTH * 2 // على الأقل IV (32 حرف hex)
    if (encryptedData.length < minLength) {
      throw new Error(`البيانات المشفرة قصيرة جداً. الطول المطلوب: ${minLength} حرف على الأقل`)
    }

    // التحقق من أن البيانات هي hex صالحة
    if (!/^[0-9a-fA-F]+$/.test(encryptedData)) {
      throw new Error('البيانات المشفرة ليست بتنسيق hex صالح')
    }

    const keyBuffer = Buffer.from(key, 'hex')
    
    // استخراج IV والبيانات المشفرة
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex')
    const encrypted = encryptedData.slice(IV_LENGTH * 2)
    
    // التحقق من أن البيانات المشفرة ليست فارغة بعد استخراج IV
    if (!encrypted || encrypted.length === 0) {
      throw new Error('البيانات المشفرة فارغة بعد استخراج IV')
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error: any) {
    console.error('Decryption error:', error)
    
    // رسائل خطأ أوضح
    if (error.code === 'ERR_OSSL_BAD_DECRYPT') {
      throw new Error(
        '❌ فشل في فك تشفير البيانات!\n\n' +
        '🔍 السبب المحتمل:\n' +
        '1. البيانات المشفرة في قاعدة البيانات مشفرة بمفتاح مختلف\n' +
        '2. مفتاح التشفير ENCRYPTION_KEY تغير بعد التشفير\n' +
        '3. البيانات المشفرة تالفة أو غير مكتملة\n\n' +
        '💡 الحل:\n' +
        '1. تحقق من أن ENCRYPTION_KEY في .env.local مطابق للمفتاح المستخدم عند التشفير\n' +
        '2. إذا تغير المفتاح، يجب إعادة حفظ الجلسات مرة أخرى\n' +
        '3. تحقق من البيانات في قاعدة البيانات'
      )
    }
    
    throw new Error(error.message || 'فشل في فك تشفير البيانات')
  }
}

/**
 * إنشاء مفتاح تشفير عشوائي
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * التحقق من صحة مفتاح التشفير
 */
export function validateEncryptionKey(key: string): boolean {
  try {
    // يجب أن يكون المفتاح 64 حرف hex (32 byte)
    if (key.length !== 64) return false
    
    // التحقق من أنه hex صالح
    Buffer.from(key, 'hex')
    return true
  } catch {
    return false
  }
}

/**
 * الحصول على مفتاح التشفير من Environment Variables
 * @throws Error إذا لم يكن المفتاح موجوداً أو غير صالح
 */
function getEncryptionKey(): string {
  // ✅ فقط من server-side environment variable
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    throw new Error(
      '❌ ENCRYPTION_KEY is not set in environment variables.\n' +
      '💡 Solution:\n' +
      '1. Generate a key: openssl rand -hex 32\n' +
      '2. Add to .env.local: ENCRYPTION_KEY=your_generated_key\n' +
      '3. Restart the development server'
    )
  }
  
  if (!validateEncryptionKey(key)) {
    throw new Error(
      '❌ ENCRYPTION_KEY is invalid. Must be 64 hexadecimal characters (32 bytes).\n' +
      '💡 Generate a valid key: openssl rand -hex 32'
    )
  }
  
  return key
}

/**
 * تشفير جلسة تيليجرام
 */
export function encryptTelegramSession(sessionString: string): string {
  const encryptionKey = getEncryptionKey()
  return encrypt(sessionString, encryptionKey)
}

/**
 * فك تشفير جلسة تيليجرام
 */
export function decryptTelegramSession(encryptedSession: string): string {
  const encryptionKey = getEncryptionKey()
  return decrypt(encryptedSession, encryptionKey)
}
