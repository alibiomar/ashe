const withPWA = require('next-pwa');

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html',
  },
  publicExcludes: ['!dynamic-css-manifest.json'],
})({
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://ashe.tn' : '',

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
      // 🌍 Global Security Headers
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "connect-src 'self' https://stats.g.doubleclick.net/ https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://www.google.com/ads/ga-audiences https://*.googleapis.com https://identitytoolkit.googleapis.com https://apis.google.com https://ashe.tn/_next/ https://auth.ashe.tn/auth/verify-email https://auth.ashe.tn/auth/send-password-reset",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://auth.ashe.tn/auth/send-password-reset https://auth.ashe.tn/auth/verify-email https://www.gstatic.com https://apis.google.com https://ashe.tn https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://auth.ashe.tn",
              "script-src-elem 'self' 'unsafe-inline' https://ashe.tn https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://auth.ashe.tn",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://ashe.tn",
              "img-src 'self' data: blob: https://www.google.tn/ https://ashe.tn https://www.ashe.tn https://res.cloudinary.com https://*.googleusercontent.com https://drive.google.com https://firebasestorage.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/ads/ga-audiences",
              "frame-src 'self' https://securetoken.googleapis.com https://ashe-comm.firebaseapp.com https://td.doubleclick.net",
              "form-action 'self'",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com https://ashe.tn https://www.ashe.tn https://ashe.tn/_next/static/media/ https://ashe.tn/fonts/ data:",
              "media-src 'self' https://*.firebaseio.com",
            ].join('; '),                       
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'geolocation=()',
              'microphone=()',
              'camera=()',
            ].join(', '),
          },
        ],
      },

      // 🏗️ CORS for ALL Next.js static files including fonts and build files
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://www.ashe.tn',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // 🏗️ CORS for build manifest files specifically
      {
        source: '/_next/static/build-:buildId/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://www.ashe.tn',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },

      // 🏗️ CORS for Fonts in /_next/static/media/ (keeping your original but more specific)
      {
        source: '/_next/static/media/:file*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://www.ashe.tn', // More specific than wildcard
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },

      // 🏗️ CORS for /fonts
      {
        source: '/fonts/:all*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://www.ashe.tn', // Restricted to your domain
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },

      // 🏗️ CORS for Dynamic CSS Manifest
      {
        source: '/_next/dynamic-css-manifest.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://www.ashe.tn',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },
    ];
  },

  async redirects() {
      return [
        {
          source: "/:path*", 
          has: [{ type: "host", value: "www.ashe.tn" }],
          destination: "https://ashe.tn/:path*", 
          permanent: true, 
        },
      ];
    },

  devIndicators: {
    buildActivity: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
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