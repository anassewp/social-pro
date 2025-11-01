import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // إعدادات الصور (إذا كنت تستخدم next/image)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  
  // إعدادات Turbopack (Next.js 16 يستخدم Turbopack بشكل افتراضي)
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      // Turbopack يدعم HMR من أي host تلقائياً
    },
  }),
};

// السماح بالوصول من IP addresses في Development
if (process.env.NODE_ENV === 'development') {
  (nextConfig as any).allowedDevOrigins = [
    'http://177.88.46.98:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
  ];
}

export default nextConfig;
