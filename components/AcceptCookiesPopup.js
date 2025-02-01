import { useState, useEffect } from 'react';

export default function AcceptCookiesPopup() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('cookiesAccepted')) {
      setIsVisible(false);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-md">
      <i className="fa-solid fa-cookie-bite text-2xl"></i>
      <div className="flex-1">
        <h2 className="text-lg font-bold">We use cookies</h2>
        <p className="text-sm opacity-80">We use cookies to enhance your experience.</p>
      </div>
      <button 
        className="bg-white text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-200 transition" 
        onClick={handleAcceptCookies}
      >
        Got it
      </button>
    </div>
  );
}
