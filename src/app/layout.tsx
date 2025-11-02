import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EnhancedThemeWrapper, ThemeDebugInfo } from "@/components/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { cairoFont, interFont, fontCSS } from "@/components/media/FontOptimizer";
import { MediaProvider } from "@/components/media/MediaProvider";
import { ResourceHints } from "@/lib/hooks/usePreload";

export const metadata: Metadata = {
  title: "SocialPro - منصة التسويق الاحترافية عبر تيليجرام",
  description: "منصة تسويق احترافية متكاملة مصممة للوكالات التسويقية لإدارة حملات تيليجرام بكفاءة عالية وأمان محكم",
  keywords: "تيليجرام, تسويق, حملات, وكالات تسويقية, SocialPro",
  authors: [{ name: "SocialPro Team" }],
  other: {
    'darkreader-lock': '',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'SocialPro',
    'format-detection': 'telephone=no',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#2563eb',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <body 
        className={`${cairoFont.className} ${interFont.className} antialiased`}
        suppressHydrationWarning
        style={{
          fontFamily: cairoFont.style.fontFamily,
        }}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  if (
                    typeof args[0] === 'string' &&
                    (args[0].includes('Hydration') || 
                     args[0].includes('hydrated') ||
                     args[0].includes('darkreader') ||
                     args[0].includes('did not match'))
                  ) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  if (
                    typeof args[0] === 'string' &&
                    (args[0].includes('darkreader'))
                  ) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
        <ErrorBoundary>
          <QueryProvider>
            <EnhancedThemeWrapper
              enableAnimations={true}
              enableAccessibility={true}
              enablePerformanceOptimizations={true}
            >
              <MediaProvider>
                <ResourceHints />
                {children}
              </MediaProvider>
            </EnhancedThemeWrapper>
          </QueryProvider>
        </ErrorBoundary>
        
        {/* Theme Debug Info - Development only */}
        {process.env.NODE_ENV === 'development' && <ThemeDebugInfo />}
      </body>
    </html>
  );
}
