import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="scroll-smooth">
        <Head>
          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preload" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" as="style" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* Favicons */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="theme-color" content="#ffffff" />

          {/* SEO & Social */}
          <meta name="description" content="Shop the latest in fashion with ASHE E-Commerce. Find high-quality clothing for every style." />
          <meta name="keywords" content="fashion, online store, e-commerce, clothes, ASHE, clothing, style" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="ASHE E-Commerce" />
          <meta property="og:url" content="[WEBSITE_URL]" />
          <meta property="og:title" content="ASHE E-Commerce - Shop the Latest Fashion" />
          <meta property="og:description" content="Shop the latest in fashion with ASHE E-Commerce. Find high-quality clothing for every style." />
          <meta property="og:image" content="[IMAGE_URL]" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@ashe_ecommerce" />
          <meta name="twitter:title" content="ASHE E-Commerce - Shop the Latest Fashion" />
          <meta name="twitter:description" content="Shop the latest in fashion with ASHE E-Commerce. Find high-quality clothing for every style." />
          <meta name="twitter:image" content="[IMAGE_URL]" />

          {/* Performance */}
          <link rel="preconnect" href="https://api.ashe-ecommerce.com" />
          <link rel="dns-prefetch" href="https://cdn.ashe-ecommerce.com" />

          {/* Structured Data */}
          <script type="application/ld+json">
            {`
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "ASHE E-Commerce",
                "url": "[WEBSITE_URL]",
                "logo": "[LOGO_URL]",
                "sameAs": [
                  "https://www.facebook.com/ashe.ecommerce",
                  "https://twitter.com/ashe_ecommerce",
                  "https://www.instagram.com/ashe_ecommerce"
                ]
              }
            `}
          </script>
        </Head>
        <body className="font-montserrat antialiased bg-gray-50">
          <Main />
          <NextScript />

          {/* Windows 8/10 Tile Color */}
          <meta name="msapplication-TileColor" content="#ffffff" />

          {/* Theme Color for Mobile Browsers */}
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />

          {/* Canonical URL */}
          <link rel="canonical" href="[WEBSITE_URL]" />
        </body>
      </Html>
    );
  }
}

