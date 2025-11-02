import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features for Next.js 15
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns'
    ],
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Bundle optimization
    optimizeCss: true,
    optimizeServerReact: true,
    // Disable server source maps for better performance
    // mdxRs: true,
  },

  // Bundle analyzer and optimization
  webpack: (config, { dev, isServer }) => {
    // Only in production
    if (!dev && !isServer) {
      // Optimize chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separate heavy components
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 20,
          },
          // Separate UI components
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 30,
          },
        },
      };

      // Pre-bundle large dependencies
      config.module.rules.push({
        test: /\.m?js$/,
        include: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
            plugins: ['transform-remove-console'],
          },
        },
      });
    }

    // Performance optimizations
    config.performance = {
      maxEntrypointSize: 244000,
      maxAssetSize: 244000,
    };

    return config;
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // SWC minifier optimizations
  swcMinify: true,

  // Image optimization with advanced settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.telegram.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.imgix.net',
      },
    ],
    formats: ['image/avif', 'image/webp', 'image/jpeg'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 سنة لتحسين الأداء
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable experimental features for better performance
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript optimizations
  typescript: {
    ignoreBuildErrors: false,
  },

  // Output optimization
  output: 'standalone',
  outputFileTracingRoot: undefined,

  // Enable compression for better performance
  compress: true,
  poweredByHeader: false,

  // Enable modern build output
  outputFileTracing: true,

  // Security headers متقدمة
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return [
      // Global Security Headers لجميع الطلبات
      {
        source: '/(.*)',
        headers: [
          // X-Frame-Options - منع Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          
          // X-Content-Type-Options - منع MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          
          // X-XSS-Protection - حماية XSS للـ legacy browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          
          // Referrer-Policy - التحكم في referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          
          // Permissions-Policy - تقييد ميزات المتصفح
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'ambient-light-sensor=()',
              'autoplay=()',
              'battery=()',
              'camera=()',
              'display-capture=()',
              'document-domain=()',
              'encrypted-media=()',
              'fullscreen=(self)',
              'geolocation=()',
              'gyroscope=()',
              'magnetometer=()',
              'microphone=()',
              'payment=()',
              'picture-in-picture=(self)',
              'screen-wake-lock=()',
              'usb=()',
              'web-share=()',
              'xr-spatial-tracking=()'
            ].join(', '),
          },
          
          // Cross-Origin-Opener-Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          
          // Cross-Origin-Embedder-Policy
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          
          // Cross-Origin-Resource-Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          
          // Origin-Agent-Cluster
          {
            key: 'Origin-Agent-Cluster',
            value: '?1',
          },
          
          // X-Permitted-Cross-Domain-Policies
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          
          // X-DNS-Prefetch-Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
        ],
      },

      // Content Security Policy (CSP) - إعدادات متقدمة
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDevelopment 
              ? [
                "default-src 'self' http://localhost:3000 http://127.0.0.1:3000",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' http://localhost:* http://127.0.0.1:*",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com data:",
                "img-src 'self' data: https: blob:",
                "connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:* https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "manifest-src 'self'",
                "worker-src 'self' blob:",
                "prefetch-src 'self'"
              ].join('; ')
              : [
                "default-src 'self'",
                "script-src 'self' 'strict-dynamic'",
                "style-src 'self' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "manifest-src 'self'",
                "worker-src 'self'",
                "prefetch-src 'self'"
              ].join('; ')
          }
        ],
      },

      // Strict-Transport-Security (HSTS) - Production فقط
      ...(isDevelopment ? [] : [{
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }]),

      // API-specific headers
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: isDevelopment 
              ? 'http://localhost:3000 http://127.0.0.1:3000' 
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, X-API-Key',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'Vary',
            value: 'Origin',
          },
        ],
      },

      // Admin routes - تقييد إضافي
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },

      // Auth routes - تقييد إضافي
      {
        source: '/auth/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },

      // Static assets - تحسين caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },

      // Images - تحسين caching مع security
      {
        source: '/_next/image/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },

      // Font files - تحسين caching
      {
        source: '/(.*\\.(?:woff|woff2|ttf|eot)$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },

      // Security.txt للـ security researchers
      {
        source: '/.well-known/security.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
    ];
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Security rewrites وإدارة الملفات الحساسة
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return [
      // PWA manifest
      {
        source: '/manifest.json',
        destination: '/manifest.json',
      },
      
      // Service Worker
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
      
      // Web App Manifest للأجهزة المحمولة
      {
        source: '/site.webmanifest',
        destination: '/site.webmanifest',
      },
      
      // Security.txt للـ security researchers
      {
        source: '/security.txt',
        destination: '/.well-known/security.txt',
      },
      
      // Block access to sensitive files في Production
      ...(isDevelopment ? [] : [
        // منع الوصول لملفات النظام
        {
          source: '/.env',
          destination: '/_not-found',
        },
        {
          source: '/.env.local',
          destination: '/_not-found',
        },
        {
          source: '/.env.production',
          destination: '/_not-found',
        },
        {
          source: '/package.json',
          destination: '/_not-found',
        },
        {
          source: '/next.config.js',
          destination: '/_not-found',
        },
        {
          source: '/tsconfig.json',
          destination: '/_not-found',
        },
        {
          source: '/yarn.lock',
          destination: '/_not-found',
        },
        {
          source: '/package-lock.json',
          destination: '/_not-found',
        },
        
        // منع الوصول للمجلدات الحساسة
        {
          source: '/src/(.*)',
          destination: '/_not-found',
        },
        {
          source: '/node_modules/(.*)',
          destination: '/_not-found',
        },
        {
          source: '/.git/(.*)',
          destination: '/_not-found',
        },
        {
          source: '/supabase/(.*)',
          destination: '/_not-found',
        },
      ]),
      
      // Redirect common attack vectors
      {
        source: '/wp-login.php',
        destination: '/404',
      },
      {
        source: '/admin.php',
        destination: '/404',
      },
      {
        source: '/phpmyadmin',
        destination: '/404',
      },
      {
        source: '/xmlrpc.php',
        destination: '/404',
      },
      {
        source: '/.gitignore',
        destination: '/404',
      },
      {
        source: '/config.php',
        destination: '/404',
      },
      {
        source: '/database.php',
        destination: '/404',
      },
    ];
  },

  // Security redirects
  async redirects() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return [
      // Redirect HTTP to HTTPS في Production
      ...(isDevelopment ? [] : [
        {
          source: 'http://localhost:3000/(.*)',
          destination: 'https://localhost:3000/:splat*',
          permanent: true,
        },
      ]),
      
      // Redirect trailing slashes for better SEO
      {
        source: '/((?!api/)(.+)/$)',
        destination: '/$1',
        permanent: true,
      },
      
      // Security: Redirect suspicious paths
      {
        source: '/backup',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/temp',
        destination: '/404',
        permanent: true,
      },
    ];
  },
};

// Development network access
if (process.env.NODE_ENV === 'development') {
  (nextConfig as any).allowedDevOrigins = [
    'http://177.88.46.98:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
  ];
}

export default nextConfig;
