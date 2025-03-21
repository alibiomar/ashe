import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Layout({ children }) {
  const router = useRouter();
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white antialiased">
      <Navbar onHeightChange={setNavbarHeight} />
      <Toaster position="bottom-center" richColors />
  
      <motion.main
        key={router.pathname}
        id="main-content"
        initial={{ opacity: 0, scale: 1.05, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{
          type: 'spring',
          mass: 0.8,
          stiffness: 50,
          damping: 12,
          velocity: 0.5,
        }}
        className="flex-1 sm:px-0 w-full"
        style={{
          marginTop: ['/', '/about'].includes(router.pathname) ? 0 : navbarHeight
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.main>
  
      <Footer />
    </div>
  );
}
