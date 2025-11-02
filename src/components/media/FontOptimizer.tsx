import { Cairo, Inter } from 'next/font/google'

// إعداد الخطوط باستخدام next/font للأداء الأمثل
export const cairoFont = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  fallback: ['Arial', 'sans-serif']
})

export const interFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  fallback: ['Arial', 'sans-serif']
})

// خط مخصص للحالات الخاصة
export const arabicFont = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  fallback: ['Tahoma', 'Arial', 'sans-serif']
})

// Font loading hooks
export const fontConfigs = {
  cairo: {
    font: cairoFont,
    className: cairoFont.className,
    variable: cairoFont.variable,
    preload: true,
    fallback: ['system-ui', 'sans-serif']
  },
  inter: {
    font: interFont,
    className: interFont.className,
    variable: interFont.variable,
    preload: true,
    fallback: ['system-ui', 'sans-serif']
  },
  arabic: {
    font: arabicFont,
    className: arabicFont.className,
    variable: arabicFont.variable,
    preload: true,
    fallback: ['Tahoma', 'Arial', 'sans-serif']
  }
}

// Utility function to get font styles
export function getFontStyles(fontType: keyof typeof fontConfigs = 'cairo') {
  const config = fontConfigs[fontType]
  
  return {
    fontFamily: config.className,
    fontDisplay: 'swap' as const,
    preload: config.preload,
    fallback: config.fallback
  }
}

// CSS variables for fonts
export const fontCSS = `
  :root {
    --font-cairo: ${cairoFont.style.fontFamily};
    --font-inter: ${interFont.style.fontFamily};
    --font-arabic: ${arabicFont.style.fontFamily};
  }
  
  .font-cairo {
    font-family: var(--font-cairo);
  }
  
  .font-inter {
    font-family: var(--font-inter);
  }
  
  .font-arabic {
    font-family: var(--font-arabic);
  }
  
  /* تحسين عرض الخطوط */
  * {
    font-display: swap;
  }
  
  /* الخطوط الأساسية */
  html {
    font-family: var(--font-cairo), system-ui, sans-serif;
    font-feature-settings: 'kern' 1, 'liga' 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* تحسين عرض النصوص العربية */
  [dir="rtl"] {
    font-family: var(--font-cairo), Tahoma, Arial, sans-serif;
    direction: rtl;
    text-align: right;
  }
  
  /* تحسين عرض النصوص الإنجليزية */
  [dir="ltr"] {
    font-family: var(--font-inter), system-ui, sans-serif;
    direction: ltr;
    text-align: left;
  }
  
  /* الأرقام والاتجاهات المختلطة */
  .mixed-content {
    font-family: var(--font-arabic), var(--font-inter), system-ui, sans-serif;
    direction: ltr;
    display: inline-block;
  }
  
  /* تحسين حجم وعرض العناوين */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.025em;
  }
  
  /* تحسين عرض النصوص الطويلة */
  .long-text {
    line-height: 1.7;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  /* تحسين عرض النصوص التفاعلية */
  button, a, input, textarea {
    font-feature-settings: 'kern' 1;
    text-rendering: optimizeLegibility;
  }
`

// Font loading optimization for critical content
export const criticalFonts = {
  headers: cairoFont,
  body: cairoFont,
  ui: interFont,
  code: 'Monaco, "Courier New", monospace'
}

// Function to preload critical fonts
export function preloadCriticalFonts() {
  if (typeof window === 'undefined') return
  
  // Preload Cairo font for Arabic content
  const cairoLink = document.createElement('link')
  cairoLink.rel = 'preload'
  cairoLink.as = 'font'
  cairoLink.type = 'font/woff2'
  cairoLink.crossOrigin = 'anonymous'
  cairoLink.href = cairoFont.src
  document.head.appendChild(cairoLink)
  
  // Preload Inter font for UI elements
  const interLink = document.createElement('link')
  interLink.rel = 'preload'
  interLink.as = 'font'
  interLink.type = 'font/woff2'
  interLink.crossOrigin = 'anonymous'
  interLink.href = interFont.src
  document.head.appendChild(interLink)
}