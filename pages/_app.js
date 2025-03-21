import dynamic from 'next/dynamic';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

function AppContent({ Component, pageProps }) {
  const { loading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    // Track page views on initial load
    const handleRouteChange = (url) => {
      window.gtag('config', 'G-HBLK404Z6X', {
        page_path: url,
      });
    };

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup the event listener on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div translate="yes">
      <Component {...pageProps} />
      <AcceptCookiesPopup />
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <BasketProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </BasketProvider>
    </AuthProvider>
  );
}

export default MyApp;