import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  const router = useRouter();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const isHomePage = router.pathname === '/';

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    if (!isHomePage) {
      setShowNavbar(true);
      return;
    }
  
    const handleScroll = () => {
      if (isHomePage) {
        const scrollPosition = window.scrollY;
  
        // Get the hero section height to determine when we're at the top
        const heroSection = document.querySelector('section.h-screen');
        const heroHeight = heroSection?.offsetHeight || 0;
  
        // Find the parallax section
        const parallaxSection = document.getElementById('parallax-section');
  
        if (parallaxSection) {
          const parallaxStart = parallaxSection.offsetTop - navbarHeight;
          const parallaxEnd = parallaxStart + parallaxSection.offsetHeight;
  
          // Hide navbar when scrolling near the top of the page or
          // when in the parallax section area
          const shouldHideNavbar = (scrollPosition >= parallaxStart && scrollPosition <= parallaxEnd);
  
          setShowNavbar(!shouldHideNavbar);
        }
      }
    };
  
    // Set initial state
    handleScroll();
  
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage, navbarHeight]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white antialiased">
      {/* Navbar with fade transition */}
      <div
  className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
    showNavbar ? 'opacity-100' : 'opacity-0 pointer-events'
  }`}
>
  <Navbar onHeightChange={setNavbarHeight} />
</div>

      
      <Toaster position="bottom-center" richColors />
      
      <motion.main
        id="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 sm:px-0 w-full transition-all"
        style={{ 
          paddingTop: isHomePage ? 0 : navbarHeight 
        }}
      >
        <AnimatePresence>{children}</AnimatePresence>
      </motion.main>

      <Footer />
    </div>
  );
}