import { z } from 'zod'

/**
 * Password Schema - سياسة كلمات المرور القوية
 */
const passwordSchema = z
  .string()
  .min(12, 'كلمة المرور يجب أن تكون 12 حرفاً على الأقل')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير واحد على الأقل')
  .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل')
  .regex(/[^a-zA-Z0-9]/, 'يجب أن تحتوي على رمز خاص واحد على الأقل (@#$%^&* إلخ)')

/**
 * Schema للتسجيل
 */
export const RegisterSchema = z.object({
  email: z.string()
    .email('بريد إلكتروني غير صالح')
    .max(255, 'البريد الإلكتروني طويل جداً'),
  
  password: passwordSchema,
  
  confirmPassword: z.string(),
  
  full_name: z.string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً')
    .optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
})

/**
 * Schema لتسجيل الدخول
 */
export const LoginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

/**
 * Schema لإعادة تعيين كلمة المرور
 */
export const ResetPasswordSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
})

/**
 * Schema لتحديث كلمة المرور
 */
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور الجديدة غير متطابقة',
  path: ['confirmPassword'],
})

