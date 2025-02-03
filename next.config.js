module.exports = {
  async headers() {
    return [
      {
        source: '/auth/action',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Enhanced CSP for Firebase integration
            value: [
              "default-src 'self'",
              "connect-src 'self' https://test.ashe.tn https://*.firebaseio.com https://identitytoolkit.googleapis.com",
              "script-src 'self' 'unsafe-eval'", // Required for Firebase in dev
              "style-src 'self' 'unsafe-inline'", // Allow inline styles
              "img-src 'self' data: https://www.dropbox.com https://dl.dropboxusercontent.com",
              "frame-src 'self' https://securetoken.googleapis.com",
              "form-action 'self'"
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
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  devIndicators: {
    buildActivity: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.dropbox.com', // Wildcard for subdomains
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Add Firebase Storage
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google user content
      }
    ],
  },

  // Additional security enhancements
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
};