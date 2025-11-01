import { NextRequest, NextResponse } from 'next/server'
import { TelegramClientManager } from '@/lib/telegram/client'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, phoneCode, phoneCodeHash, apiId, apiHash } = await request.json()

    if (!phoneNumber || !phoneCode || !phoneCodeHash || !apiId || !apiHash) {
      return NextResponse.json(
        { error: 'جميع البيانات مطلوبة' },
        { status: 400 }
      )
    }

    // إنشاء مدير تيليجرام بالـ credentials المقدمة
    const telegramManager = new TelegramClientManager(
      parseInt(apiId),
      apiHash
    )

    try {
      const result = await telegramManager.verifyCode(
        phoneNumber,
        phoneCode,
        phoneCodeHash
      )

      return NextResponse.json({
        success: true,
        sessionString: result.sessionString,
        userInfo: result.userInfo,
        message: 'تم التحقق بنجاح'
      })

    } catch (error: any) {
      if (error.message.includes('SESSION_PASSWORD_NEEDED')) {
        return NextResponse.json({
          needPassword: true,
          message: 'يتطلب كلمة مرور إضافية'
        })
      }
      
      throw error
    }

  } catch (error: any) {
    console.error('Verify code error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في التحقق من الكود' },
      { status: 500 }
    )
  }
}
