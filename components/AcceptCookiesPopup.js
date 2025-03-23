import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AcceptCookiesPopup() {
  const [accepted, setAccepted] = useState(false);
  const [tempDismissed, setTempDismissed] = useState(false);
  const router = useRouter();

  // On initial load, check localStorage to see if cookies have been accepted.
  useEffect(() => {
    if (localStorage.getItem('cookiesAccepted')) {
      setAccepted(true);
    }
  }, []);

  // Control page scrolling based on the popup's visibility.
  useEffect(() => {
    if (!accepted && !tempDismissed) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [accepted, tempDismissed]);

  // Listen for route changes. When a route change is complete,
  // if cookies haven't been accepted, reset the temporary dismissal.
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      if (!accepted) {
        setTempDismissed(false);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [accepted, router.events]);

  // When the user accepts cookies, mark as accepted (and persist it).
  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setAccepted(true);
    window.dispatchEvent(new Event('cookie-consent-accepted'));

    // Enable Google Analytics and Ad Storage after consent is granted
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
      });
    }
  };

  // When the user clicks on the Terms link, temporarily hide the popup and navigate.
  const handleReadTerms = (e) => {
    e.preventDefault();
    setTempDismissed(true);
    router.push('/terms#termsofservice');
  };

  // Do not render the popup if cookies have been accepted or it's temporarily dismissed.
  if (accepted || tempDismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-end justify-center">
      <div className="fixed bottom-0 mx-auto bg-white p-6 max-w-md w-full sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:rounded-none border-t-2 border-black">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-cookie-bite text-3xl text-black" />
          <div className="text-center">
            <h2 className="text-lg font-bold text-black mb-2">COOKIE USAGE</h2>
            <p className="text-sm text-gray-600">
              We use essential cookies to ensure proper functionality. By continuing, you agree to our use of cookies.
              For more details, please review our{' '}
              <a
                href="#termsofservice"
                onClick={handleReadTerms}
                className="text-[#46c7c7] underline hover:text-[#3aabab] transition-colors"
              >
                Terms of Service
              </a>.
            </p>
          </div>
          <button
            className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
            onClick={handleAcceptCookies}
            aria-label="Accept cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
