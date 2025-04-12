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
          <meta name="apple-mobile-web-app-title" content="ASHE™" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
          <meta name="theme-color" content="#000000"/>
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* Favicons */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="192x192" href="/logo192.png" />
          <link rel="icon" type="image/png" sizes="72x72" href="/logo72.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ffffff" />
          <meta name="msapplication-TileColor" content="#000000" />
          
          {/* SEO & Social */}
          <meta name="keywords" content="fashion, online store, brand, old money, tunisia, clothes, ASHE, clothing, style" />
          <meta name="author" content="ASHE™" />
          <meta name="robots" content="index, follow" />
          
          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="ASHE™" />
          <meta property="og:url" content="https://ashe.tn" />
          <meta property="og:title" content="ASHE™ - Be Distinct" />
          <meta property="og:description" content="Shop the latest in fashion with ASHE™. Find high-quality clothing for every style." />
          <meta property="og:image" content="https://ashe.tn/og-image.jpg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ASHE™ - Be Distinct" />
          <meta name="twitter:description" content="Shop the latest in fashion with ASHE™. Find high-quality clothing for every style." />
          <meta name="twitter:image" content="https://ashe.tn/og-image.jpg" />
          
          {/* Performance Optimizations */}
          <link rel="preconnect" href="https://ashe.tn" />
          <link rel="dns-prefetch" href="https://ashe.tn" />
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          <meta property="og:locale" content="fr_FR" />

          {/* Google Analytics with Consent Mode */}
          <script async src={`https://www.googletagmanager.com/gtag/js?id=G-HBLK404Z6X`}></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                // Default consent state is 'denied' for all cookies
                gtag('consent', 'default', {
                  'analytics_storage': 'denied',
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                });

                // Optionally, the user can update the consent status upon accepting cookies
                window.addEventListener('cookie-consent-accepted', function() {
                  gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted',
                  'ad_user_data': 'granted',
                  'ad_personalization': 'granted',
                  });
                });
              `,
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
