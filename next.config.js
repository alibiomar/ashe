module.exports = {
  async headers() {
    return [
      {
        source: '/auth/action',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://*.firebaseio.com"
          }
        ]
      }
    ]
  },
  devIndicators: {
    buildActivity: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dropbox.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dl.dropboxusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
