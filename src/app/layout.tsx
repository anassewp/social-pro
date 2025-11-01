import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryProvider } from "@/lib/providers/QueryProvider";

export const metadata: Metadata = {
  title: "SocialPro - منصة التسويق الاحترافية عبر تيليجرام",
  description: "منصة تسويق احترافية متكاملة مصممة للوكالات التسويقية لإدارة حملات تيليجرام بكفاءة عالية وأمان محكم",
  keywords: "تيليجرام, تسويق, حملات, وكالات تسويقية, SocialPro",
  authors: [{ name: "SocialPro Team" }],
  other: {
    'darkreader-lock': '',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-cairo antialiased" suppressHydrationWarning>
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
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
