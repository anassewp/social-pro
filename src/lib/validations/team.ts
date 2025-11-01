import { z } from 'zod'
import { USER_ROLES } from '@/lib/constants'

/**
 * Schema لدعوة عضو جديد
 */
export const InviteMemberSchema = z.object({
  email: z
    .string()
    .email('بريد إلكتروني غير صالح')
    .max(255, 'البريد الإلكتروني طويل جداً'),
  role: z.enum(['admin', 'manager', 'operator'], {
    message: 'الدور يجب أن يكون admin أو manager أو operator',
  }).default('operator'),
})

/**
 * Schema لتحديث دور العضو
 */
export const UpdateMemberRoleSchema = z.object({
  memberId: z.string().uuid('معرف العضو غير صالح'),
  role: z.enum(['admin', 'manager', 'operator'], {
    message: 'الدور يجب أن يكون admin أو manager أو operator',
  }),
})

/**
 * Schema لإزالة عضو
 */
export const RemoveMemberSchema = z.object({
  memberId: z.string().uuid('معرف العضو غير صالح'),
})

