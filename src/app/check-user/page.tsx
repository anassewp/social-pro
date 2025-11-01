'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckUserPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setUserInfo({ error: 'لا يوجد مستخدم مسجل دخول' })
        setLoading(false)
        return
      }

      setUserInfo(user)

      // Check if user has teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id)

      if (teamsError) {
        console.error('Error fetching teams:', teamsError)
      } else {
        setTeams(teamsData || [])
      }

      // Check team membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('team_members')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('user_id', user.id)

      if (membershipError) {
        console.error('Error fetching membership:', membershipError)
      } else {
        console.log('User memberships:', membershipData)
      }

    } catch (error) {
      console.error('Error:', error)
      setUserInfo({ error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">فحص بيانات المستخدم</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>معلومات المستخدم</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الفرق المملوكة ({teams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-red-600">⚠️ لا توجد فرق! يجب إنشاء فريق تلقائياً</p>
            ) : (
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(teams, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <div className="text-sm text-gray-600">
          <p><strong>User ID:</strong> {userInfo?.id}</p>
          <p><strong>Email:</strong> {userInfo?.email}</p>
          <p><strong>Email Confirmed:</strong> {userInfo?.email_confirmed_at ? 'نعم' : 'لا'}</p>
          <p><strong>Created:</strong> {userInfo?.created_at}</p>
        </div>
      </div>
    </div>
  )
}
