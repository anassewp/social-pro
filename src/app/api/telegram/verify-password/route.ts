import { NextRequest, NextResponse } from 'next/server'
import { telegramManager } from '@/lib/telegram/client'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, password } = await request.json()

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: 'رقم الهاتف وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    try {
      const result = await telegramManager.verifyPassword(phoneNumber, password)

      return NextResponse.json({
        success: true,
        sessionString: result.sessionString,
        userInfo: result.userInfo,
        message: 'تم التحقق بنجاح'
      })

    } catch (error: any) {
      throw error
    }

  } catch (error: any) {
    console.error('Verify password error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في التحقق من كلمة المرور' },
      { status: 500 }
    )
  }
}
