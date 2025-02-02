import { useState, useEffect } from 'react';

export default function AcceptCookiesPopup() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('cookiesAccepted')) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isVisible]);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-end justify-center ">
      <div className="fixed bottom-0 mx-auto bg-white p-6 max-w-md w-full sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:rounded-none border-t-2 border-black">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-cookie-bite text-3xl text-black" />
          <div className="text-center">
            <h2 className="text-lg font-bold text-black mb-2">COOKIE USAGE</h2>
            <p className="text-sm text-gray-600">We use essential cookies to ensure proper functionality. By continuing, you agree to our use of cookies.</p>
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