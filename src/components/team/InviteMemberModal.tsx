'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, AlertCircle } from 'lucide-react'
import { useInviteMember } from '@/lib/hooks/useTeam'
import { ButtonLoading } from '@/components/ui/Loading'
import { ROLE_COLORS, USER_ROLES } from '@/lib/constants'

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const roleLabels = {
  [USER_ROLES.ADMIN]: 'مدير',
  [USER_ROLES.MANAGER]: 'مدير مساعد',
  [USER_ROLES.OPERATOR]: 'مشغل',
}

export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'operator'>('operator')
  const [error, setError] = useState('')

  const inviteMember = useInviteMember()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب')
      return
    }

    try {
      await inviteMember.mutateAsync({ email: email.trim(), role })
      
      // إعادة تعيين النموذج
      setEmail('')
      setRole('operator')
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'فشل في دعوة العضو')
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('operator')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-slate-900">
            <UserPlus className="h-5 w-5 ml-2" />
            دعوة عضو جديد
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            أدع عضو جديد للانضمام لفريقك. يجب أن يكون المستخدم مسجل في النظام أولاً.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-900">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              disabled={inviteMember.isPending}
              dir="ltr"
            />
            <p className="text-xs text-slate-500">
              يجب أن يكون المستخدم مسجل في النظام أولاً
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-900">
              الدور
            </Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger id="role" name="role" className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="operator" className="bg-white hover:bg-slate-50">
                  {roleLabels[USER_ROLES.OPERATOR]} - يمكنه إنشاء وإدارة الحملات
                </SelectItem>
                <SelectItem value="manager" className="bg-white hover:bg-slate-50">
                  {roleLabels[USER_ROLES.MANAGER]} - يمكنه إدارة الفريق والحملات
                </SelectItem>
                <SelectItem value="admin" className="bg-white hover:bg-slate-50">
                  {roleLabels[USER_ROLES.ADMIN]} - صلاحيات كاملة
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {role === 'admin' && '⚠️ فقط المدير الحالي يمكنه دعوة مدير آخر'}
            </p>
          </div>

          {error && (
            <div className="flex items-start space-x-2 rtl:space-x-reverse p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-2 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={inviteMember.isPending}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={inviteMember.isPending || !email.trim()}
            >
              {inviteMember.isPending ? (
                <>
                  <ButtonLoading className="ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 ml-2" />
                  دعوة
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

