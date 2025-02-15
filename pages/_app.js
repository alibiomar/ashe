import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
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
