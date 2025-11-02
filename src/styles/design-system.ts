/**
 * Design System المتقدم
 * يحتوي على جميع المتغيرات والقيم الموحدة للتصميم
 */

// =============================================
// THEME TOKENS - رموز النظام الأساسية
// =============================================

export const themeTokens = {
  // الألوان الأساسية
  colors: {
    primary: {
      50: 'hsl(217, 91%, 98%)',
      100: 'hsl(217, 91%, 95%)',
      200: 'hsl(217, 91%, 90%)',
      300: 'hsl(217, 91%, 85%)',
      400: 'hsl(217, 91%, 70%)',
      500: 'hsl(217, 91%, 60%)', // Default
      600: 'hsl(217, 91%, 55%)',
      700: 'hsl(217, 91%, 45%)',
      800: 'hsl(217, 91%, 35%)',
      900: 'hsl(217, 91%, 25%)',
    },
    
    secondary: {
      50: 'hsl(240, 4.8%, 98%)',
      100: 'hsl(240, 4.8%, 95.9%)',
      200: 'hsl(240, 4.8%, 92%)',
      300: 'hsl(240, 4.8%, 88%)',
      400: 'hsl(240, 4.8%, 82%)',
      500: 'hsl(240, 4.8%, 76%)',
      600: 'hsl(240, 4.8%, 70%)',
      700: 'hsl(240, 4.8%, 60%)',
      800: 'hsl(240, 4.8%, 50%)',
      900: 'hsl(240, 4.8%, 40%)',
    },

    neutral: {
      50: 'hsl(0, 0%, 98%)',
      100: 'hsl(0, 0%, 95%)',
      200: 'hsl(0, 0%, 90%)',
      300: 'hsl(0, 0%, 80%)',
      400: 'hsl(0, 0%, 60%)',
      500: 'hsl(0, 0%, 40%)',
      600: 'hsl(0, 0%, 30%)',
      700: 'hsl(0, 0%, 20%)',
      800: 'hsl(0, 0%, 12%)',
      900: 'hsl(0, 0%, 6%)',
    },

    success: {
      50: 'hsl(142, 76%, 98%)',
      100: 'hsl(142, 76%, 95%)',
      200: 'hsl(142, 76%, 85%)',
      300: 'hsl(142, 76%, 75%)',
      400: 'hsl(142, 76%, 55%)',
      500: 'hsl(142, 76%, 36%)', // Default
      600: 'hsl(142, 76%, 32%)',
      700: 'hsl(142, 76%, 28%)',
      800: 'hsl(142, 76%, 24%)',
      900: 'hsl(142, 76%, 20%)',
    },

    warning: {
      50: 'hsl(38, 92%, 98%)',
      100: 'hsl(38, 92%, 95%)',
      200: 'hsl(38, 92%, 85%)',
      300: 'hsl(38, 92%, 75%)',
      400: 'hsl(38, 92%, 65%)',
      500: 'hsl(38, 92%, 50%)', // Default
      600: 'hsl(38, 92%, 45%)',
      700: 'hsl(38, 92%, 40%)',
      800: 'hsl(38, 92%, 35%)',
      900: 'hsl(38, 92%, 30%)',
    },

    error: {
      50: 'hsl(0, 84%, 98%)',
      100: 'hsl(0, 84%, 95%)',
      200: 'hsl(0, 84%, 85%)',
      300: 'hsl(0, 84%, 75%)',
      400: 'hsl(0, 84%, 65%)',
      500: 'hsl(0, 84%, 60%)', // Default
      600: 'hsl(0, 84%, 55%)',
      700: 'hsl(0, 84%, 50%)',
      800: 'hsl(0, 84%, 45%)',
      900: 'hsl(0, 84%, 40%)',
    },

    info: {
      50: 'hsl(199, 89%, 98%)',
      100: 'hsl(199, 89%, 95%)',
      200: 'hsl(199, 89%, 85%)',
      300: 'hsl(199, 89%, 75%)',
      400: 'hsl(199, 89%, 65%)',
      500: 'hsl(199, 89%, 48%)', // Default
      600: 'hsl(199, 89%, 45%)',
      700: 'hsl(199, 89%, 40%)',
      800: 'hsl(199, 89%, 35%)',
      900: 'hsl(199, 89%, 30%)',
    },
  },

  // الخطوط والتايبوغرافي
  typography: {
    fontFamily: {
      sans: ['Cairo', 'Inter', 'ui-sans-serif', 'system-ui'],
      serif: ['ui-serif', 'Georgia', 'Cambria'],
      mono: ['Inter', 'ui-monospace', 'Monaco', 'Consolas'],
    },

    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5' }],
      sm: ['0.875rem', { lineHeight: '1.5' }],
      base: ['1rem', { lineHeight: '1.7' }],
      lg: ['1.125rem', { lineHeight: '1.7' }],
      xl: ['1.25rem', { lineHeight: '1.6' }],
      '2xl': ['1.5rem', { lineHeight: '1.4' }],
      '3xl': ['1.875rem', { lineHeight: '1.3' }],
      '4xl': ['2.25rem', { lineHeight: '1.2' }],
      '5xl': ['3rem', { lineHeight: '1.1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },

    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.01em',
      wider: '0.02em',
      widest: '0.1em',
    },
  },

  // المسافات
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    7: '1.75rem', // 28px
    8: '2rem',    // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem',   // 48px
    14: '3.5rem', // 56px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
    28: '7rem',   // 112px
    32: '8rem',   // 128px
    36: '9rem',   // 144px
    40: '10rem',  // 160px
    44: '11rem',  // 176px
    48: '12rem',  // 192px
    52: '13rem',  // 208px
    56: '14rem',  // 224px
    60: '15rem',  // 240px
    64: '16rem',  // 256px
    72: '18rem',  // 288px
    80: '20rem',  // 320px
    96: '24rem',  // 384px
  },

  // الحدود والانحناءات
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    default: '0.375rem', // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },

  // الظلال
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // الانتقالات
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    default: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // نقاط التوقف للاستجابة
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index layers
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
}

// =============================================
// GRID SYSTEM - نظام الشبكة المتقدم
// =============================================

export const gridSystem = {
  columns: {
    1: 'repeat(1, minmax(0, 1fr))',
    2: 'repeat(2, minmax(0, 1fr))',
    3: 'repeat(3, minmax(0, 1fr))',
    4: 'repeat(4, minmax(0, 1fr))',
    5: 'repeat(5, minmax(0, 1fr))',
    6: 'repeat(6, minmax(0, 1fr))',
    7: 'repeat(7, minmax(0, 1fr))',
    8: 'repeat(8, minmax(0, 1fr))',
    9: 'repeat(9, minmax(0, 1fr))',
    10: 'repeat(10, minmax(0, 1fr))',
    11: 'repeat(11, minmax(0, 1fr))',
    12: 'repeat(12, minmax(0, 1fr))',
    13: 'repeat(13, minmax(0, 1fr))',
    14: 'repeat(14, minmax(0, 1fr))',
    15: 'repeat(15, minmax(0, 1fr))',
    16: 'repeat(16, minmax(0, 1fr))',
  },

  gaps: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
  },
}

// =============================================
// ANIMATION SYSTEM - نظام الحركة والتفاعل
// =============================================

export const animationSystem = {
  // حركات الدخول والخروج
  enter: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, transform: 'translateY(20px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
      exit: { opacity: 0, transform: 'translateY(-20px)' },
    },
    slideDown: {
      initial: { opacity: 0, transform: 'translateY(-20px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
      exit: { opacity: 0, transform: 'translateY(20px)' },
    },
    slideLeft: {
      initial: { opacity: 0, transform: 'translateX(20px)' },
      animate: { opacity: 1, transform: 'translateX(0)' },
      exit: { opacity: 0, transform: 'translateX(-20px)' },
    },
    slideRight: {
      initial: { opacity: 0, transform: 'translateX(-20px)' },
      animate: { opacity: 1, transform: 'translateX(0)' },
      exit: { opacity: 0, transform: 'translateX(20px)' },
    },
    scale: {
      initial: { opacity: 0, transform: 'scale(0.95)' },
      animate: { opacity: 1, transform: 'scale(1)' },
      exit: { opacity: 0, transform: 'scale(0.95)' },
    },
  },

  // حركات التفاعل
  hover: {
    lift: { transform: 'translateY(-2px)' },
    scale: { transform: 'scale(1.02)' },
    glow: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' },
  },

  // الحركات المستمرة
  loop: {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
    },
    bounce: {
      transform: ['translateY(0)', 'translateY(-10px)', 'translateY(0)'],
    },
    shimmer: {
      backgroundPosition: ['-200px 0', '200px 0'],
    },
  },
}

// =============================================
// ACCESSIBILITY TOKENS - متغيرات إمكانية الوصول
// =============================================

export const accessibilityTokens = {
  focusRing: {
    light: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    default: '0 0 0 3px rgba(59, 130, 246, 0.3)',
    strong: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  },

  contrast: {
    normal: 4.5, // WCAG AA standard
    large: 3.0,  // WCAG AA for large text
    enhanced: 7.0, // WCAG AAA standard
  },

  spacing: {
    touchTarget: '44px', // Minimum touch target size
    focusOutline: '2px', // Focus indicator size
  },
}

// =============================================
// RESPONSIVE UTILITIES - أدوات الاستجابة
// =============================================

export const responsiveUtils = {
  // Container sizes
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Aspect ratios
  aspectRatios: {
    square: '1 / 1',
    video: '16 / 9',
    photo: '4 / 3',
    landscape: '3 / 2',
    portrait: '2 / 3',
    wide: '21 / 9',
  },

  // Safe areas for mobile
  safeAreas: {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
  },
}

// =============================================
// EXPORT ALL
// =============================================

export {
  themeTokens as tokens,
  gridSystem,
  animationSystem,
  accessibilityTokens,
  responsiveUtils,
}