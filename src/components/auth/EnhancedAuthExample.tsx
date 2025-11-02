// مثال على استخدام نظام المصادقة المحسن
// يمكن استخدام هذا الملف كمرجع للتطوير

import React, { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthConfigHelpers } from '@/lib/auth'

export const EnhancedAuthExample = () => {
  const {
    user,
    loading,
    isAuthenticated,
    securityAlerts,
    trustedDevices,
    signIn,
    signOut,
    setupTwoFactor,
    getSecurityAlerts,
    addTrustedDevice,
    hasPermission,
    getPasswordStrength,
    terminateAllOtherSessions,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  // مثال على تسجيل الدخول المحسن
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await signIn(email, password, twoFactorCode)
    
    if (result.requiresTwoFactor) {
      setShowTwoFactor(true)
      return
    }
    
    if (result.error) {
      console.error('Login failed:', result.error)
      return
    }
    
    if (result.isNewDevice) {
      // إشعار جهاز جديد
      alert('تم تسجيل الدخول من جهاز جديد')
    }
  }

  // مثال على إعداد المصادقة الثنائية
  const handleSetupTwoFactor = async () => {
    const result = await setupTwoFactor('totp')
    
    if (result.error) {
      console.error('Failed to setup 2FA:', result.error)
      return
    }
    
    // عرض QR code للرموز أو تعليمات SMS/Email
    console.log('2FA Setup:', result.setup)
  }

  // مثال على إدارة الأجهزة الموثوقة
  const handleAddTrustedDevice = async () => {
    const deviceName = 'My Laptop'
    const result = await addTrustedDevice(deviceName)
    
    if (!result.error) {
      console.log('Device added as trusted')
    }
  }

  // مثال على فحص الصلاحيات
  const renderAdminPanel = () => {
    if (!hasPermission('MANAGE_SETTINGS')) {
      return <div>ليس لديك صلاحية للوصول إلى لوحة الإدارة</div>
    }
    
    return (
      <div className="admin-panel">
        <h3>لوحة الإدارة</h3>
        <button onClick={handleSetupTwoFactor}>
          إعداد المصادقة الثنائية
        </button>
        <button onClick={handleAddTrustedDevice}>
          إضافة جهاز موثوق
        </button>
      </div>
    )
  }

  // مثال على تقييم قوة كلمة المرور
  const handlePasswordStrengthCheck = async () => {
    const strength = await getPasswordStrength(password)
    console.log('Password Strength:', strength)
    
    // عرض feedback للمستخدم
    if (strength.score < 3) {
      alert(`كلمة المرور ضعيفة: ${strength.feedback.join(', ')}`)
    }
  }

  // مثال على إنهاء جميع الجلسات الأخرى
  const handleTerminateOtherSessions = async () => {
    const confirm = window.confirm(
      'هل أنت متأكد من رغبتك في إنهاء جميع الجلسات الأخرى؟'
    )
    
    if (confirm) {
      const result = await terminateAllOtherSessions()
      if (!result.error) {
        alert('تم إنهاء جميع الجلسات الأخرى بنجاح')
      }
    }
  }

  // مثال على عرض التنبيهات الأمنية
  const renderSecurityAlerts = () => {
    if (securityAlerts.length === 0) {
      return <div>لا توجد تنبيهات أمنية</div>
    }
    
    return (
      <div className="security-alerts">
        <h4>التنبيهات الأمنية:</h4>
        {securityAlerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.severity}`}>
            <h5>{alert.title}</h5>
            <p>{alert.message}</p>
            <small>{AuthConfigHelpers.formatRelativeTime(alert.created_at)}</small>
          </div>
        ))}
      </div>
    )
  }

  // مثال على عرض الأجهزة الموثوقة
  const renderTrustedDevices = () => {
    return (
      <div className="trusted-devices">
        <h4>الأجهزة الموثوقة:</h4>
        {trustedDevices.map(device => (
          <div key={device.id} className="device-item">
            <strong>{device.device_name}</strong>
            <span>{device.device_type}</span>
            <small>
              آخر استخدام: {AuthConfigHelpers.formatRelativeTime(device.last_used)}
            </small>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return <div>جاري التحميل...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="login-form">
        <h2>تسجيل الدخول المحسن</h2>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {showTwoFactor && (
            <input
              type="text"
              placeholder="رمز المصادقة الثنائية"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              maxLength={6}
            />
          )}
          
          <button type="submit">
            {showTwoFactor ? 'تحقق من الرمز' : 'تسجيل الدخول'}
          </button>
          
          <button type="button" onClick={handlePasswordStrengthCheck}>
            فحص قوة كلمة المرور
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="dashboard-enhanced">
      <header>
        <h1>مرحباً {user?.email}</h1>
        <div className="user-info">
          <span>الدور: {user?.role}</span>
          <span>مستوى الأمان: {user?.security_level}</span>
          {user?.two_factor_enabled && <span>✓ المصادقة الثنائية مفعلة</span>}
        </div>
        
        <button onClick={() => signOut('manual')}>
          تسجيل الخروج الآمن
        </button>
      </header>

      <div className="content">
        {/* لوحة الإدارة */}
        {renderAdminPanel()}

        {/* التنبيهات الأمنية */}
        {renderSecurityAlerts()}

        {/* الأجهزة الموثوقة */}
        {renderTrustedDevices()}

        {/* إدارة الجلسات */}
        <div className="session-management">
          <h3>إدارة الجلسات</h3>
          <button onClick={handleTerminateOtherSessions}>
            إنهاء جميع الجلسات الأخرى
          </button>
          
          {/* عرض معلومات الجلسة */}
          {user?.session_id && (
            <div className="session-info">
              <p>معرف الجلسة: {user.session_id}</p>
              <p>بصمة الجهاز: {user.device_fingerprint}</p>
            </div>
          )}
        </div>

        {/* أدوات الأمان */}
        <div className="security-tools">
          <h3>أدوات الأمان</h3>
          <button onClick={handleSetupTwoFactor}>
            إعداد المصادقة الثنائية
          </button>
          
          <button onClick={() => getSecurityAlerts()}>
            تحديث التنبيهات الأمنية
          </button>
          
          <button onClick={handlePasswordStrengthCheck}>
            فحص قوة كلمة المرور
          </button>
        </div>
      </div>
    </div>
  )
}

// مثال على مكون التنبيهات الأمنية
export const SecurityAlertsComponent = () => {
  const { securityAlerts, markAlertAsRead } = useAuth()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      case 'low': return 'blue'
      default: return 'gray'
    }
  }

  return (
    <div className="security-alerts-container">
      <h3>مركز التنبيهات الأمنية</h3>
      
      {securityAlerts.length === 0 ? (
        <div className="no-alerts">
          <p>لا توجد تنبيهات أمنية جديدة</p>
          <span className="success-icon">✓</span>
        </div>
      ) : (
        <div className="alerts-list">
          {securityAlerts.map(alert => (
            <div
              key={alert.id}
              className={`security-alert ${alert.is_read ? 'read' : 'unread'}`}
              style={{ borderLeftColor: getSeverityColor(alert.severity) }}
            >
              <div className="alert-header">
                <h4>{alert.title}</h4>
                <span className={`severity-badge ${alert.severity}`}>
                  {alert.severity}
                </span>
              </div>
              
              <p>{alert.message}</p>
              
              <div className="alert-footer">
                <small>{AuthConfigHelpers.formatRelativeTime(alert.created_at)}</small>
                
                {!alert.is_read && (
                  <button
                    onClick={() => markAlertAsRead(alert.id)}
                    className="mark-read-btn"
                  >
                    تحديد كمقروء
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// مثال على مكون إدارة الأجهزة الموثوقة
export const TrustedDevicesComponent = () => {
  const { trustedDevices, addTrustedDevice, removeTrustedDevice } = useAuth()
  const [newDeviceName, setNewDeviceName] = useState('')

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newDeviceName.trim()) {
      await addTrustedDevice(newDeviceName)
      setNewDeviceName('')
    }
  }

  return (
    <div className="trusted-devices-container">
      <h3>إدارة الأجهزة الموثوقة</h3>
      
      <form onSubmit={handleAddDevice} className="add-device-form">
        <input
          type="text"
          placeholder="اسم الجهاز الجديد"
          value={newDeviceName}
          onChange={(e) => setNewDeviceName(e.target.value)}
        />
        <button type="submit">إضافة جهاز</button>
      </form>

      <div className="devices-grid">
        {trustedDevices.map(device => (
          <div key={device.id} className="device-card">
            <div className="device-info">
              <h4>{device.device_name}</h4>
              <p className="device-type">{device.device_type}</p>
              <p className="device-browser">{device.browser} على {device.os}</p>
            </div>
            
            <div className="device-meta">
              <small>آخر استخدام: {AuthConfigHelpers.formatRelativeTime(device.last_used)}</small>
            </div>
            
            <button
              onClick={() => removeTrustedDevice(device.id)}
              className="remove-device-btn"
            >
              إزالة
            </button>
          </div>
        ))}
      </div>

      {trustedDevices.length === 0 && (
        <div className="no-devices">
          <p>لا توجد أجهزة موثوقة حالياً</p>
        </div>
      )}
    </div>
  )
}

export default EnhancedAuthExample