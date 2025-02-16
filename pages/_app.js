// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { setupRealTimeActivityListener, updateUserActivity } from '../utils/updateActivity';

// Create a wrapper component to use hooks
function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { user, loading } = useAuth(); // Now this is used within the AuthProvider context

  useEffect(() => {
    if (user) {
      setupRealTimeActivityListener(user.uid);
    }

    const handleRouteChange = (url) => {
      if (user) {
        updateUserActivity(user.uid);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div translate="yes">
      <Component {...pageProps} />
      <AcceptCookiesPopup />
    </div>
  );
}

// Main App component
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