// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { setupRealTimeActivityListener, updateUserActivity } from '../utils/updateActivity';
const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});
function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    let unsubscribe = () => {};

    const initializeActivity = async () => {
      if (user?.uid) {
        try {
          // Set up real-time listener
          unsubscribe = setupRealTimeActivityListener(user.uid);
          
          // Update initial activity
          await updateUserActivity(user.uid);
        } catch (error) {
          console.error('Failed to initialize activity tracking:', error);
        }
      }
    };

    initializeActivity();

    // Route change handler
    const handleRouteChange = async () => {
      if (user?.uid) {
        try {
          await updateUserActivity(user.uid);
        } catch (error) {
          console.error('Failed to update activity on route change:', error);
        }
      }
    };

    // Subscribe to route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup function
    return () => {
      unsubscribe(); // Remove real-time listener
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, user]);

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