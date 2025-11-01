import { NextRequest, NextResponse } from 'next/server'
import { TelegramClientManager } from '@/lib/telegram/client'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, apiId, apiHash } = await request.json()

    if (!phoneNumber || !apiId || !apiHash) {
      return NextResponse.json(
        { error: 'جميع البيانات مطلوبة (رقم الهاتف، API ID، API Hash)' },
        { status: 400 }
      )
    }

    // التحقق من صحة رقم الهاتف
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صحيح' },
        { status: 400 }
      )
    }

    // إنشاء مدير تيليجرام بالـ credentials المقدمة
    const telegramManager = new TelegramClientManager(
      parseInt(apiId),
      apiHash
    )

    const result = await telegramManager.sendCode(phoneNumber)

    return NextResponse.json({
      success: true,
      phoneCodeHash: result.phoneCodeHash,
      message: 'تم إرسال كود التحقق بنجاح'
    })

  } catch (error: any) {
    console.error('Send code error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في إرسال كود التحقق' },
      { status: 500 }
    )
  }
}
