// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { setupRealTimeActivityListener, updateUserActivity } from '../utils/updateActivity';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have a useAuth hook

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { user, loading } = useAuth(); // Get the current user and loading state from the auth context

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
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  return (
    <AuthProvider>
      <BasketProvider>
        <div translate="yes">
          <Component {...pageProps} />
          <AcceptCookiesPopup />
        </div>
      </BasketProvider>
    </AuthProvider>
  );
}

export default MyApp;
