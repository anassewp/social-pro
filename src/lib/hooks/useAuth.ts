'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/constants'
import {
  sessionManager,
  jwtSecurityManager,
  twoFactorManager,
  passwordPolicyManager,
  logoutManager,
  accountSecurityManager,
  AuthConfigHelpers,
} from '@/lib/auth'

interface AuthUser extends User {
  role?: UserRole
  team_id?: string
  team_name?: string
  session_id?: string
  device_fingerprint?: string
  two_factor_enabled?: boolean
  security_level?: 'basic' | 'enhanced' | 'maximum'
  last_password_change?: Date
  login_count?: number
  trusted_devices?: number
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  sessionInfo: any
  securityAlerts: any[]
  trustedDevices: any[]
  sessionExpired: boolean
  
  // Authentication methods
  signIn: (email: string, password: string, twoFactorCode?: string) => Promise<{ 
    error?: any
    requiresTwoFactor?: boolean
    isNewDevice?: boolean
  }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>
  signOut: (reason?: string) => Promise<{ error?: any }>
  resetPassword: (email: string) => Promise<{ error?: any }>
  updateProfile: (updates: any) => Promise<{ error?: any }>
  
  // Security methods
  setupTwoFactor: (method: 'totp' | 'sms' | 'email') => Promise<{ error?: any; setup?: any }>
  verifyTwoFactor: (code: string, method: string, backupCode?: string) => Promise<{ error?: any }>
  disableTwoFactor: (verificationCode: string) => Promise<{ error?: any }>
  getTwoFactorStatus: () => Promise<{ isEnabled: boolean; method?: string }>
  
  // Password methods
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: any }>
  validatePassword: (password: string) => Promise<{ isValid: boolean; errors: string[] }>
  getPasswordStrength: (password: string) => Promise<{ score: number; label: string; feedback: string[] }>
  
  // Session methods
  getActiveSessions: () => Promise<any[]>
  terminateSession: (sessionId: string) => Promise<{ error?: any }>
  terminateAllOtherSessions: () => Promise<{ error?: any }>
  
  // Security monitoring
  getSecurityAlerts: () => Promise<any[]>
  markAlertAsRead: (alertId: string) => Promise<void>
  getTrustedDevices: () => Promise<any[]>
  addTrustedDevice: (deviceName: string) => Promise<{ error?: any }>
  removeTrustedDevice: (deviceId: string) => Promise<{ error?: any }>
  updateSecuritySettings: (settings: any) => Promise<{ error?: any }>
  
  // Utility methods
  hasPermission: (permission: string) => boolean
  isSessionExpired: () => boolean
  refreshSession: () => Promise<{ error?: any }>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([])
  const [trustedDevices, setTrustedDevices] = useState<any[]>([])
  const [sessionExpired, setSessionExpired] = useState(false)
  
  const supabase = createClient()

  // Enhanced user fetching with security data
  const fetchUserWithSecurityData = useCallback(async (authUser: User) => {
    try {
      // Get user's team and role information
      const { data: teamData } = await supabase
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

      // Get two-factor status
      const twoFactorStatus = await twoFactorManager.getTwoFactorStatus(authUser.id)
      
      // Get security settings
      const securitySettings = await accountSecurityManager.getSecuritySettings(authUser.id)
      
      // Get session info
      const sessions = await sessionManager.getUserSessions(authUser.id)
      const currentSession = sessions.find(s => s.user_id === authUser.id && s.is_active)

      const userWithSecurity: AuthUser = {
        ...authUser,
        role: teamData?.role || 'operator',
        team_id: teamData?.team?.id,
        team_name: teamData?.team?.name,
        session_id: currentSession?.id,
        device_fingerprint: jwtSecurityManager.getSecurityContext()?.deviceFingerprint,
        two_factor_enabled: twoFactorStatus.isEnabled,
        security_level: twoFactorStatus.isEnabled ? 'enhanced' : 'basic',
        trusted_devices: 0, // This would come from trusted devices count
      }

      setUser(userWithSecurity)
      setSessionInfo(currentSession)
      
      // Load security data
      await loadSecurityData(authUser.id)

    } catch (error) {
      console.error('Error fetching user data:', error)
      setUser(authUser as AuthUser)
    }
  }, [supabase])

  const loadSecurityData = useCallback(async (userId: string) => {
    try {
      const [alerts, devices] = await Promise.all([
        accountSecurityManager.getSecurityAlerts(userId),
        accountSecurityManager.getTrustedDevices(userId)
      ])
      
      setSecurityAlerts(alerts)
      setTrustedDevices(devices)
    } catch (error) {
      console.error('Error loading security data:', error)
    }
  }, [])

  // Enhanced session management
  const startSessionMonitoring = useCallback((userId: string, sessionId: string) => {
    const cleanup = sessionManager.startSessionMonitoring(userId, sessionId)
    
    // Set up session timeout
    const timeoutDuration = AuthConfigHelpers.getSessionTimeout() * 1000
    const timeoutTimer = setTimeout(() => {
      setSessionExpired(true)
      signOut('timeout')
    }, timeoutDuration)

    return () => {
      cleanup()
      clearTimeout(timeoutTimer)
    }
  }, [])

  // Authentication methods
  const signIn = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      setLoading(true)

      // First, check for suspicious activity
      const { data: testUser } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (testUser.error) {
        return { error: testUser.error }
      }

      if (!testUser.user) {
        return { error: new Error('Login failed') }
      }

      // Check two-factor requirement
      const twoFactorStatus = await twoFactorManager.getTwoFactorStatus(testUser.user.id)
      
      if (twoFactorStatus.isEnabled && !twoFactorCode) {
        // Sign out and require 2FA
        await supabase.auth.signOut()
        return { 
          error: null, 
          requiresTwoFactor: true 
        }
      }

      // Verify two-factor if provided
      if (twoFactorCode) {
        const verification = await twoFactorManager.verifyTwoFactorCode(testUser.user.id, {
          user_id: testUser.user.id,
          method: twoFactorStatus.method || 'totp',
          code: twoFactorCode,
        })

        if (!verification.success) {
          await supabase.auth.signOut()
          return { 
            error: new Error('Invalid two-factor code') 
          }
        }
      }

      // Create session
      const deviceFingerprint = jwtSecurityManager.getSecurityContext()?.deviceFingerprint || ''
      const sessionId = await sessionManager.createSession(
        testUser.user.id, 
        deviceFingerprint
      )

      // Update JWT security context
      jwtSecurityManager.updateSessionInfo(sessionId)

      // Check for new device
      const isNewDevice = verification?.isNewDevice || false
      
      if (isNewDevice) {
        await twoFactorManager.notifyNewDevice(
          testUser.user.id, 
          'New Device Login'
        )
      }

      // Fetch enhanced user data
      await fetchUserWithSecurityData(testUser.user)

      return { 
        error: null,
        requiresTwoFactor: false,
        isNewDevice 
      }

    } catch (error) {
      console.error('Sign in error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      
      // Validate password strength
      const passwordValidation = passwordPolicyManager.validatePassword(password)
      if (!passwordValidation.isValid) {
        return { 
          error: new Error(passwordValidation.errors.join(', ')) 
        }
      }

      // Check for compromised password
      const breachCheck = await passwordPolicyManager.checkPasswordBreach(password)
      if (breachCheck.isBreached) {
        return { 
          error: new Error('This password has been compromised. Please choose a different one.') 
        }
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      // Save password history
      if (result.user) {
        await passwordPolicyManager.savePasswordHistory(result.user.id, password)
      }

      return { error: result.error }

    } catch (error) {
      console.error('Sign up error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (reason: string = 'manual') => {
    try {
      setLoading(true)
      
      if (user?.session_id) {
        await logoutManager.secureLogout(user.id, user.session_id, reason as any)
      } else {
        await supabase.auth.signOut()
      }

      setUser(null)
      setSessionInfo(null)
      setSecurityAlerts([])
      setTrustedDevices([])
      setSessionExpired(false)

      return { error: null }

    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error: result.error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error }
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      const result = await supabase.auth.updateUser(updates)
      
      if (!result.error && result.data.user) {
        await fetchUserWithSecurityData(result.data.user)
      }
      
      return { error: result.error }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error }
    }
  }

  // Two-factor methods
  const setupTwoFactor = async (method: 'totp' | 'sms' | 'email') => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      const setup = await twoFactorManager.setupTwoFactor(user.id, method)
      return { error: null, setup }
    } catch (error) {
      console.error('Setup 2FA error:', error)
      return { error }
    }
  }

  const verifyTwoFactor = async (code: string, method: string, backupCode?: string) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      const result = await twoFactorManager.verifyTwoFactorCode(user.id, {
        user_id: user.id,
        method: method as any,
        code,
        backup_code: backupCode,
      })
      
      return { error: result.success ? null : new Error('Verification failed') }
    } catch (error) {
      console.error('Verify 2FA error:', error)
      return { error }
    }
  }

  const disableTwoFactor = async (verificationCode: string) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      const result = await twoFactorManager.disableTwoFactor(user.id, verificationCode)
      return { error: result.success ? null : new Error('Failed to disable 2FA') }
    } catch (error) {
      console.error('Disable 2FA error:', error)
      return { error }
    }
  }

  const getTwoFactorStatus = async () => {
    try {
      if (!user) return { isEnabled: false, method: undefined }
      
      const status = await twoFactorManager.getTwoFactorStatus(user.id)
      return { 
        isEnabled: status.isEnabled, 
        method: status.method 
      }
    } catch (error) {
      console.error('Get 2FA status error:', error)
      return { isEnabled: false, method: undefined }
    }
  }

  // Password methods
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      // Validate new password
      const validation = passwordPolicyManager.validatePassword(newPassword)
      if (!validation.isValid) {
        return { error: new Error(validation.errors.join(', ')) }
      }

      // Check password history
      const historyCheck = await passwordPolicyManager.checkPasswordHistory(user.id, newPassword)
      if (!historyCheck.isAllowed) {
        return { error: new Error(historyCheck.reason) }
      }

      // Check for compromised password
      const breachCheck = await passwordPolicyManager.checkPasswordBreach(newPassword)
      if (breachCheck.isBreached) {
        return { error: new Error('This password has been compromised.') }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (!error) {
        // Save to password history
        await passwordPolicyManager.savePasswordHistory(user.id, newPassword)
      }

      return { error }
    } catch (error) {
      console.error('Change password error:', error)
      return { error }
    }
  }

  const validatePassword = async (password: string) => {
    const validation = passwordPolicyManager.validatePassword(password)
    return {
      isValid: validation.isValid,
      errors: validation.errors
    }
  }

  const getPasswordStrength = async (password: string) => {
    const personalInfo = user ? {
      email: user.email,
      name: user.user_metadata?.full_name
    } : undefined

    const strength = passwordPolicyManager.evaluatePasswordStrength(password, personalInfo)
    return {
      score: strength.score,
      label: strength.label,
      feedback: strength.feedback
    }
  }

  // Session methods
  const getActiveSessions = async () => {
    try {
      if (!user) return []
      return await sessionManager.getUserSessions(user.id)
    } catch (error) {
      console.error('Get active sessions error:', error)
      return []
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      await sessionManager.terminateSession(sessionId, user.id, 'manual')
      return { error: null }
    } catch (error) {
      console.error('Terminate session error:', error)
      return { error }
    }
  }

  const terminateAllOtherSessions = async () => {
    try {
      if (!user || !user.session_id) return { error: new Error('No active session') }
      
      await logoutManager.secureLogout(user.id, user.session_id, 'manual', true)
      return { error: null }
    } catch (error) {
      console.error('Terminate all sessions error:', error)
      return { error }
    }
  }

  // Security monitoring methods
  const getSecurityAlerts = async () => {
    try {
      if (!user) return []
      const alerts = await accountSecurityManager.getSecurityAlerts(user.id)
      setSecurityAlerts(alerts)
      return alerts
    } catch (error) {
      console.error('Get security alerts error:', error)
      return []
    }
  }

  const markAlertAsRead = async (alertId: string) => {
    try {
      await accountSecurityManager.markAlertAsRead(alertId)
      setSecurityAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ))
    } catch (error) {
      console.error('Mark alert as read error:', error)
    }
  }

  const getTrustedDevices = async () => {
    try {
      if (!user) return []
      const devices = await accountSecurityManager.getTrustedDevices(user.id)
      setTrustedDevices(devices)
      return devices
    } catch (error) {
      console.error('Get trusted devices error:', error)
      return []
    }
  }

  const addTrustedDevice = async (deviceName: string) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      const deviceInfo = {
        device_id: jwtSecurityManager.getSecurityContext()?.deviceFingerprint || '',
        device_name: deviceName,
        device_type: 'desktop' as const,
        browser: 'Unknown',
        os: 'Unknown'
      }
      
      await accountSecurityManager.addTrustedDevice(user.id, deviceInfo)
      await getTrustedDevices()
      
      return { error: null }
    } catch (error) {
      console.error('Add trusted device error:', error)
      return { error }
    }
  }

  const removeTrustedDevice = async (deviceId: string) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      await accountSecurityManager.removeTrustedDevice(user.id, deviceId)
      await getTrustedDevices()
      
      return { error: null }
    } catch (error) {
      console.error('Remove trusted device error:', error)
      return { error }
    }
  }

  const updateSecuritySettings = async (settings: any) => {
    try {
      if (!user) return { error: new Error('No user logged in') }
      
      const result = await accountSecurityManager.updateSecuritySettings(user.id, settings)
      return result
    } catch (error) {
      console.error('Update security settings error:', error)
      return { error }
    }
  }

  // Utility methods
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    return AuthConfigHelpers.hasPermission(user, permission)
  }

  const isSessionExpired = (): boolean => {
    return sessionExpired || !user
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (!error && data.user) {
        await fetchUserWithSecurityData(data.user)
        return { error: null }
      }
      
      return { error }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { error }
    }
  }

  // Enhanced initialization
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) => 
            setTimeout(() => resolve({ data: { session: null } }), 1000)
          )
        ])

        const { data: { session } } = sessionResult
        if (session?.user) {
          await fetchUserWithSecurityData(session.user)
          
          // Start session monitoring
          const sessions = await sessionManager.getUserSessions(session.user.id)
          const currentSession = sessions.find(s => s.user_id === session.user.id && s.is_active)
          
          if (currentSession) {
            startSessionMonitoring(session.user.id, currentSession.id)
          }
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
          await fetchUserWithSecurityData(session.user)
          
          // Start session monitoring
          const sessions = await sessionManager.getUserSessions(session.user.id)
          const currentSession = sessions.find(s => s.user_id === session.user.id && s.is_active)
          
          if (currentSession) {
            startSessionMonitoring(session.user.id, currentSession.id)
          }
        } else {
          setUser(null)
          setSessionInfo(null)
          setSecurityAlerts([])
          setTrustedDevices([])
          setSessionExpired(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchUserWithSecurityData, startSessionMonitoring])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    sessionInfo,
    securityAlerts,
    trustedDevices,
    sessionExpired,
    
    // Authentication
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    
    // Security
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    getTwoFactorStatus,
    
    // Password
    changePassword,
    validatePassword,
    getPasswordStrength,
    
    // Sessions
    getActiveSessions,
    terminateSession,
    terminateAllOtherSessions,
    
    // Security monitoring
    getSecurityAlerts,
    markAlertAsRead,
    getTrustedDevices,
    addTrustedDevice,
    removeTrustedDevice,
    updateSecuritySettings,
    
    // Utilities
    hasPermission,
    isSessionExpired,
    refreshSession,
  }
}