import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Layout({ children }) {
  const router = useRouter();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const newEndDate = new Date('2025-03-30');
    newEndDate.setDate(newEndDate.getDate() + 2);
    const endDateTime = newEndDate.getTime();
  
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endDateTime - now;
  
      if (distance <= 0) {
        setIsExpired(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
  
      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };
  
    // Initial call to set the correct time immediately
    updateCountdown();
  
    // Set an interval to update the countdown every second
    const interval = setInterval(updateCountdown, 1000);
  
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);
  

  const hideAnnouncement = () => {  
    setShowAnnouncement(false);
  };

  // Format time remaining for display
  const formatTimeUnit = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  // Announcement content with countdown timer or expired message
  const announcementText = isExpired 
    ? ` Eid Savings! Enjoy 15% off — Time's up! #EidMubarak` 
    : ` Eid Savings! Enjoy 15% off — Ends in: ${formatTimeUnit(timeRemaining.days)}d ${formatTimeUnit(timeRemaining.hours)}h ${formatTimeUnit(timeRemaining.minutes)}m ${formatTimeUnit(timeRemaining.seconds)}s! #EidMubarak`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white antialiased">
      {/* Announcement Banner - positioned absolutely at the top */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{opacity: 0 }}
            animate={{opacity: 1 }}
            exit={{opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-black text-white overflow-hidden fixed top-0 left-0 z-40"
          >
            <div className="container mx-auto px-4 py-2 relative">
              <div className="flex items-center justify-center">
                <div className="overflow-hidden relative w-full">
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: "-100%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 15,
                      ease: "linear"
                    }}
                    className="whitespace-nowrap font-medium"
                  >
                    <span className='bg-[#46c7c7] bg-clip-text text-transparent'>🔥 </span>{announcementText} <span className='bg-[#46c7c7] bg-clip-text text-transparent'> 🔥</span>
                  </motion.div>
                </div>
                <button 
                  onClick={hideAnnouncement}
                  className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Close announcement"
                >
                  <FaTimes className="text-white text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout structure */}
      <div 
        className="flex flex-col w-full" 
        style={{ 
          paddingTop: showAnnouncement ? '2.5rem' : '0' // Add padding when announcement is visible
        }}
      >
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
    </div>
  );
}