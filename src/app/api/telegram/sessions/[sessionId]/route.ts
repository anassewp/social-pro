import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * حذف جلسة تيليجرام
 * @route DELETE /api/telegram/sessions/[sessionId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> | { sessionId: string } }
) {
  try {
    // Next.js 16+ قد يجعل params Promise
    const resolvedParams = await (Promise.resolve(params))
    const { sessionId } = resolvedParams

    if (!sessionId) {
      return NextResponse.json(
        { error: 'معرف الجلسة مطلوب' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // التحقق من وجود الجلسة وملكيتها للمستخدم
    const { data: session, error: sessionError } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'الجلسة غير موجودة' },
        { status: 404 }
      )
    }

    // حذف الجلسة
    const { error: deleteError } = await supabase
      .from('telegram_sessions')
      .delete()
      .eq('id', sessionId)

    if (deleteError) {
      console.error('Delete session error:', deleteError)
      return NextResponse.json(
        { error: 'فشل في حذف الجلسة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الجلسة بنجاح'
    })

  } catch (error: any) {
    console.error('Delete session error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في حذف الجلسة' },
      { status: 500 }
    )
  }
}

