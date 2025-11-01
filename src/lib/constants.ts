// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Campaign Status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS]

// Group Types
export const GROUP_TYPES = {
  CHANNEL: 'channel',
  GROUP: 'group',
  SUPERGROUP: 'supergroup',
} as const

export type GroupType = typeof GROUP_TYPES[keyof typeof GROUP_TYPES]

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TEAMS: '/teams',
  SESSIONS: '/sessions',
  GROUPS: '/groups',
  CAMPAIGNS: '/campaigns',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

// Role Permissions
export const PERMISSIONS = {
  // Team Management
  CREATE_TEAM: ['admin'],
  MANAGE_TEAM: ['admin'],
  INVITE_MEMBERS: ['admin', 'manager'],
  REMOVE_MEMBERS: ['admin', 'manager'],
  
  // Session Management
  CREATE_SESSION: ['admin', 'manager', 'operator'],
  DELETE_SESSION: ['admin', 'manager'],
  USE_SESSION: ['admin', 'manager', 'operator'],
  
  // Campaign Management
  CREATE_CAMPAIGN: ['admin', 'manager', 'operator'],
  EDIT_CAMPAIGN: ['admin', 'manager'],
  DELETE_CAMPAIGN: ['admin', 'manager'],
  RUN_CAMPAIGN: ['admin', 'manager', 'operator'],
  
  // Analytics
  VIEW_ANALYTICS: ['admin', 'manager'],
  EXPORT_DATA: ['admin', 'manager'],
  
  // System
  VIEW_AUDIT_LOGS: ['admin'],
  MANAGE_SETTINGS: ['admin'],
} as const

// Telegram Limits
export const TELEGRAM_LIMITS = {
  MAX_MESSAGE_LENGTH: 4096,
  MAX_CAPTION_LENGTH: 1024,
  FLOOD_WAIT_MAX: 3600, // seconds
  RATE_LIMIT_MESSAGES_PER_SECOND: 1,
  RATE_LIMIT_MESSAGES_PER_MINUTE: 20,
  MAX_MEMBERS_PER_REQUEST: 200,
} as const

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/csv', 'application/json'],
} as const

// UI Constants
export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
} as const

// Status Colors
export const STATUS_COLORS = {
  [CAMPAIGN_STATUS.DRAFT]: 'gray',
  [CAMPAIGN_STATUS.SCHEDULED]: 'blue',
  [CAMPAIGN_STATUS.RUNNING]: 'green',
  [CAMPAIGN_STATUS.PAUSED]: 'yellow',
  [CAMPAIGN_STATUS.COMPLETED]: 'emerald',
  [CAMPAIGN_STATUS.FAILED]: 'red',
} as const

// Role Colors
export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'red',
  [USER_ROLES.MANAGER]: 'blue',
  [USER_ROLES.OPERATOR]: 'green',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'غير مصرح لك بالوصول إلى هذا المورد',
  FORBIDDEN: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
  NOT_FOUND: 'المورد المطلوب غير موجود',
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  SERVER_ERROR: 'خطأ في الخادم',
  SESSION_EXPIRED: 'انتهت صلاحية الجلسة',
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  TELEGRAM_ERROR: 'خطأ في الاتصال بتيليجرام',
  FLOOD_WAIT: 'يجب الانتظار قبل إرسال المزيد من الرسائل',
  ACCOUNT_BANNED: 'تم حظر الحساب',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
  REGISTER_SUCCESS: 'تم إنشاء الحساب بنجاح',
  UPDATE_SUCCESS: 'تم التحديث بنجاح',
  DELETE_SUCCESS: 'تم الحذف بنجاح',
  CREATE_SUCCESS: 'تم الإنشاء بنجاح',
  INVITE_SENT: 'تم إرسال الدعوة بنجاح',
  SESSION_CREATED: 'تم إنشاء الجلسة بنجاح',
  CAMPAIGN_STARTED: 'تم بدء الحملة بنجاح',
  CAMPAIGN_PAUSED: 'تم إيقاف الحملة مؤقتاً',
  CAMPAIGN_COMPLETED: 'تم إكمال الحملة بنجاح',
} as const

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  TEAM_NAME_MIN_LENGTH: 3,
  TEAM_NAME_MAX_LENGTH: 50,
  CAMPAIGN_NAME_MIN_LENGTH: 3,
  CAMPAIGN_NAME_MAX_LENGTH: 100,
  PHONE_NUMBER_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const
