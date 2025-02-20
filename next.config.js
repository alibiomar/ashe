const withPWA = require('next-pwa');

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html', // Serve offline.html when offline
  },
  publicExcludes: ['!dynamic-css-manifest.json'],
})({
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://test.ashe.tn' : '',

  async rewrites() {
    return [
      {
        source: '/_next/dynamic-css-manifest.json',
        destination: '/dynamic-css-manifest.json',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "connect-src 'self' https://fastly.picsum.photos/ https://drive.google.com/ https://picsum.photos/ https://fonts.gstatic.com/ https://fonts.googleapis.com/ https://auth.ashe.tn/auth/verify-email https://auth.ashe.tn/auth/send-password-reset https://auth.ashe.tn https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://apis.google.com",
              "script-src 'self' 'unsafe-eval' https://www.gstatic.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.googleusercontent.com https://drive.google.com/ https://firebasestorage.googleapis.com https://picsum.photos https://fastly.picsum.photos",
              "frame-src 'self' https://securetoken.googleapis.com https://ashe-comm.firebaseapp.com",
              "form-action 'self'",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com/ https://res.cloudinary.com data:",
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
      'drive.google.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'test.ashe.tn',
      'fastly.picsum.photos',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.google.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
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
  compress: true,

  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  },

  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60, // 1 hour
    pagesBufferLength: 10,
  },
});

module.exports = config;