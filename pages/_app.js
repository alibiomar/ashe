import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker Registered'))
        .catch((err) => console.error('❌ SW Registration Failed', err));
    }
  }, []);

  return (
    <AuthProvider>
      <BasketProvider>
        <Component {...pageProps} />
        <AcceptCookiesPopup />
      </BasketProvider>
    </AuthProvider>
  );
}

export default MyApp;
