import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  const router = useRouter();
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white antialiased">
      <Navbar onHeightChange={setNavbarHeight} />
      <Toaster position="bottom-center" richColors />
      
      <motion.main
        id="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`flex-1 sm:px-0 w-full transition-all`}
        style={{ marginTop: router.pathname === '/' ? 0 : navbarHeight }}
      >
        <AnimatePresence>{children}</AnimatePresence>
      </motion.main>

      <Footer />
    </div>
  );
}
