// pages/_app.js
import dynamic from 'next/dynamic';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

function AppContent({ Component, pageProps }) {
  const { loading } = useAuth(); // Removed router and activity-related code

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