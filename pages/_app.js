// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { setupRealTimeActivityListener, updateUserActivity } from '../utils/updateActivity';

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    let unsubscribe = () => {};

    const setupActivity = async () => {
      if (user?.uid) {
        try {
          unsubscribe = setupRealTimeActivityListener(user.uid);
          await updateUserActivity(user.uid);
        } catch (error) {
          console.error('Error setting up activity tracking:', error);
        }
      }
    };

    setupActivity();

    const handleRouteChange = async () => {
      if (user?.uid) {
        try {
          await updateUserActivity(user.uid);
        } catch (error) {
          console.error('Error updating activity on route change:', error);
        }
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      unsubscribe();
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