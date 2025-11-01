'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/constants'

interface AuthUser extends User {
  role?: UserRole
  team_id?: string
  team_name?: string
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: any) => Promise<{ error: any }>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserWithRole = useCallback(async (authUser: User) => {
    try {
      // Get user's team and role information
      const { data: teamData, error } = await supabase
        .from('team_members')
        .select(`
          role,
          team:teams (
            id,
            name
          )
        `)
        .eq('user_id', authUser.id)
        .single()

      if (error || !teamData) {
        // User doesn't have a team yet (new user) - this is normal
        console.log('User has no team yet (new user):', error?.message)
        setUser(authUser as AuthUser)
        return
      }

      const userWithRole: AuthUser = {
        ...authUser,
        role: teamData.role,
        team_id: (teamData.team as any)?.id,
        team_name: (teamData.team as any)?.name,
      }

      setUser(userWithRole)
    } catch (error) {
      console.error('Error in fetchUserWithRole:', error)
      setUser(authUser as AuthUser)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session مع timeout
    const getInitialSession = async () => {
      try {
        // استخدام Promise.race لتجنب انتظار طويل
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) => 
            setTimeout(() => resolve({ data: { session: null } }), 1000)
          )
        ])

        const { data: { session } } = sessionResult
        if (session?.user) {
          // Fetch user role بشكل غير متزامن بعد إظهار loading
          fetchUserWithRole(session.user).catch(() => {
            // إذا فشل، نعرض user بدون role
            setUser(session.user as AuthUser)
          })
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserWithRole(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchUserWithRole])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    const result = await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
    return result
  }

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }

  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error('No user logged in') }
    
    const result = await supabase.auth.updateUser(updates)
    if (!result.error && result.data.user) {
      await fetchUserWithRole(result.data.user)
    }
    return result
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }
}
