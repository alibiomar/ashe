import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      
      <Html lang="en" className="scroll-smooth">
        <Head>
        

          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preload" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" as="style" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* Favicons */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="72x72" href="/logo72.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="theme-color" content="#ffffff" />

          {/* SEO & Social */}
          <meta name="description" content="Shop the latest in fashion with ASHE™. Find high-quality clothing for every style." />
          <meta name="keywords" content="fashion, online store, brand,old money,tunisia, clothes, ASHE, clothing, style" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="ASHE™" />
          <meta property="og:url" content="Canonical link preview URL" />
          <meta property="og:title" content="ASHE™- Be Distinct" />
          <meta property="og:description" content="Shop the latest in fashion with ASHE™. Find high-quality clothing for every style." />
          <meta property="og:image" content="/og-image.jpg" />

          {/* Performance */}
          <link rel="preconnect" href="http://www.ashe.tn/" />
          <link rel="dns-prefetch" href="http://www.ashe.tn/" />

          {/* Structured Data */}
          <script type="application/ld+json">
            {`
              {
                "@context": "https://schema.org",
                "@type": "Brand",
                "name": "Ashe",
                "url": "www.ashe.tn",
                "logo": "/logo.svg",
                "sameAs": [
                  "https://www.instagram.com/ashe.tn"
                ]
              }
            `}
          </script>
        </Head>
        <body className="font-montserrat antialiased">
          <Main />
          <NextScript />

          {/* Windows 8/10 Tile Color */}
          <meta name="msapplication-TileColor" content="#ffffff" />

          {/* Theme Color for Mobile Browsers */}
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />

          {/* Canonical URL */}
          <link rel="canonical" href="www.ashe.tn" />
        </body>
      </Html>
    );
  }
}

