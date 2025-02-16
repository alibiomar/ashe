import { AuthProvider } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function MyApp({ Component, pageProps }) {
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
