'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MoreVertical,
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Check,
  X
} from 'lucide-react'
import { useUpdateMemberRole, useRemoveMember } from '@/lib/hooks/useTeam'
import { ROLE_COLORS, USER_ROLES } from '@/lib/constants'
interface TeamMember {
  id: string
  userId: string
  email: string
  fullName: string
  role: 'admin' | 'manager' | 'operator'
  joinedAt: string
  invitedBy: string | null
  isCurrentUser: boolean
}

interface MemberCardProps {
  member: TeamMember
  currentUserRole: 'admin' | 'manager' | 'operator'
  isOwner: boolean
}

const roleLabels = {
  [USER_ROLES.ADMIN]: 'مدير',
  [USER_ROLES.MANAGER]: 'مدير مساعد',
  [USER_ROLES.OPERATOR]: 'مشغل',
}

const roleColors = {
  [USER_ROLES.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
  [USER_ROLES.MANAGER]: 'bg-blue-100 text-blue-800 border-blue-200',
  [USER_ROLES.OPERATOR]: 'bg-green-100 text-green-800 border-green-200',
}

export function MemberCard({ member, currentUserRole, isOwner }: MemberCardProps) {
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState(member.role)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()

  const canEditRole = currentUserRole === 'admin' && !member.isCurrentUser
  const canRemove = 
    (currentUserRole === 'admin' || currentUserRole === 'manager') && 
    !member.isCurrentUser &&
    !(member.role === 'admin' && currentUserRole !== 'admin')

  const handleRoleUpdate = async () => {
    try {
      await updateRole.mutateAsync({
        memberId: member.id,
        role: selectedRole,
      })
      setIsEditingRole(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleRemove = async () => {
    try {
      await removeMember.mutateAsync(member.id)
      setShowRemoveConfirm(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const month = date.toLocaleDateString('ar', { month: 'short' })
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
    } catch {
      return dateString
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                <h3 className="font-medium text-slate-900 truncate">
                  {member.fullName}
                </h3>
                {member.isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    أنت
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Mail className="h-3 w-3" />
                  <span className="truncate" dir="ltr">{member.email}</span>
                </div>
                
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Calendar className="h-3 w-3" />
                  <span>انضم في {formatDate(member.joinedAt)}</span>
                </div>
              </div>

              {isEditingRole ? (
                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-3">
                  <Select
                    value={selectedRole}
                    onValueChange={(value: any) => setSelectedRole(value)}
                  >
                    <SelectTrigger className="h-8 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="operator" className="bg-white hover:bg-slate-50">
                        {roleLabels[USER_ROLES.OPERATOR]}
                      </SelectItem>
                      <SelectItem value="manager" className="bg-white hover:bg-slate-50">
                        {roleLabels[USER_ROLES.MANAGER]}
                      </SelectItem>
                      <SelectItem value="admin" className="bg-white hover:bg-slate-50">
                        {roleLabels[USER_ROLES.ADMIN]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleRoleUpdate}
                    disabled={updateRole.isPending || selectedRole === member.role}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingRole(false)
                      setSelectedRole(member.role)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <Badge
                    className={`${roleColors[member.role]} text-xs border`}
                  >
                    <Shield className="h-3 w-3 ml-1" />
                    {roleLabels[member.role]}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {(canEditRole || canRemove) && !isEditingRole && !showRemoveConfirm && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {canEditRole && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingRole(true)}
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              )}
              {canRemove && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRemoveConfirm(true)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {showRemoveConfirm && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm text-slate-600">تأكيد الحذف؟</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={removeMember.isPending}
              >
                <Check className="h-3 w-3 ml-1" />
                نعم
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRemoveConfirm(false)}
              >
                <X className="h-3 w-3 ml-1" />
                لا
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

