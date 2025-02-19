import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer'; // Add a Footer component
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'; // Add useState
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  const router = useRouter();
  const [navbarHeight, setNavbarHeight] = useState(0); // State to store navbar height

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    
    <div className="flex items-center justify-center flex-col min-h-screen w-full bg-white antialiased">
      {/* Pass the setNavbarHeight function to Navbar */}
      <Navbar onHeightChange={setNavbarHeight} />
      <Toaster position="bottom-center" richColors />
      {/* Apply navbar height as top margin */}
      <motion.main
        id="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 sm:px-0 w-full "
        style={{ marginTop: (router.pathname === "/")? 0 : navbarHeight }}
      >
        <AnimatePresence>
          {children}
        </AnimatePresence>
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
}