const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,});
  
module.exports = withPWA({
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "connect-src 'self' https://auth.ashe.tn/auth/verify-email https://auth.ashe.tn/auth/send-password-reset https://auth.ashe.tn https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://apis.google.com",
              "script-src 'self' 'unsafe-eval' https://www.gstatic.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https://*.googleusercontent.com https://dl.dropboxusercontent.com https://firebasestorage.googleapis.com https://picsum.photos https://fastly.picsum.photos",
              "frame-src 'self' https://securetoken.googleapis.com https://ashe-comm.firebaseapp.com",
              "form-action 'self'",
              "font-src 'self' https://fonts.gstatic.com https://res.cloudinary.com data:",
              "media-src 'self' https://*.firebaseio.com"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'geolocation=()',
              'microphone=()',
              'camera=()'
            ].join(', ')
          }
        ]
      }
    ]
  },
  
  devIndicators: {
    buildActivity: false,
  },

  images: {
    domains: [
      'via.placeholder.com',
      'dl.dropboxusercontent.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.dropbox.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'dl.dropboxusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },  

  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // Additional Enhancements
  compress: true, // Enable compression
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  },
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ];
  },
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60, // 1 hour
    pagesBufferLength: 10,
  },
});