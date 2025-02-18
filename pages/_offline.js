import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Offline() {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const checkConnection = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  useEffect(() => {
    window.addEventListener('online', checkConnection);
    const interval = setInterval(checkConnection, 5000);
    return () => {
      window.removeEventListener('online', checkConnection);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5 text-center">
      <Head>
        <title>ASHE™ - Offline</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />
      </Head>
      <img src="/logo.png" alt="ASHE™ Logo" className="w-48 h-auto mb-8 animate-pulse" />
      <h1 className="text-4xl font-bold mb-5 text-gray-800">You're Offline</h1>
      <p className="text-lg text-gray-600 mb-9">
        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
        Please check your internet connection and try again.
      </p>
      <button
        className="relative inline-flex items-center justify-center px-8 py-4 border-2 border-black font-semibold text-lg uppercase tracking-wide transition-all duration-300 ease-in-out bg-black text-white hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
        onClick={handleRetry}
        disabled={isChecking}
      >
        <span>{isChecking ? 'Checking Connection...' : 'Retry Connection'}</span>
        <div className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-3 animate-spin ${isChecking ? 'block' : 'hidden'}`}></div>
      </button>
    </div>
  );
}
