import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import AcceptCookiesPopup from '../components/AcceptCookiesPopup'; 
import { BasketProvider } from '../contexts/BasketContext'; // Import BasketProvider
import '@fortawesome/fontawesome-free/css/all.min.css';

function MyApp({ Component, pageProps }) {
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
