import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="fr" className="scroll-smooth">
        <Head>
          {/* Progressive Web App */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="application-name" content="ASHE™" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="ASHE™" />
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
          <meta name="mobile-web-app-capable" content="yes" />
          
          {/* Favicons */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="192x192" href="/logo192.png" />
          <link rel="icon" type="image/png" sizes="72x72" href="/logo72.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
          
          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link 
            rel="preload" 
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" 
            as="style" 
            crossOrigin="anonymous"
          />
          <link 
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" 
            rel="stylesheet" 
            crossOrigin="anonymous"
          />
          
          {/* SEO & Social */}
          <meta name="description" content="Shop the latest in fashion with ASHE™. Find high-quality clothing for every style." />
          <meta name="keywords" content="fashion, online store, brand, old money, tunisia, clothes, ASHE, clothing, style" />
          <meta name="author" content="ASHE™" />
          <meta name="robots" content="index, follow" />
          
          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="ASHE™" />
          <meta property="og:url" content="https://www.ashe.tn" />
          <meta property="og:title" content="ASHE™ - Be Distinct" />
          <meta property="og:description" content="Shop the latest in fashion with ASHE™. Find high-quality clothing for every style." />
          <meta property="og:image" content="https://www.ashe.tn/og-image.jpg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ASHE™ - Be Distinct" />
          <meta name="twitter:description" content="Shop the latest in fashion with ASHE™. Find high-quality clothing for every style." />
          <meta name="twitter:image" content="https://www.ashe.tn/og-image.jpg" />
          
          {/* Performance Optimizations */}
          <link rel="preconnect" href="https://www.ashe.tn" />
          <link rel="dns-prefetch" href="https://www.ashe.tn" />
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          
          {/* Structured Data */}
          <script 
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ 
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "ASHE™",
                "url": "https://www.ashe.tn",
                "logo": "https://www.ashe.tn/logo.svg",
                "sameAs": [
                  "https://www.instagram.com/ashe.tn",
                  "https://www.tiktok.com/@ashe.tn"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+216 20 986 015",
                  "contactType": "customer service"
                }
              })
            }} 
          />
        </Head>
        
        <body className="font-montserrat antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}