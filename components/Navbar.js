import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';
import {
  FaSignInAlt,
  FaUserPlus,
  FaHome,
  FaTshirt,
  FaInfoCircle,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaUserCircle
} from 'react-icons/fa';
import { RiShoppingBasket2Fill } from "react-icons/ri";

import Image from 'next/image';
import Cookies from 'js-cookie';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';

const menuItems = [
  { path: '/', label: 'Home', icon: FaHome },
  { path: '/products', label: 'Products', icon: FaTshirt },
  { path: '/about', label: 'About', icon: FaInfoCircle },
  { path: '/contact', label: 'Contact', icon: FaEnvelope }
];

export default function Navbar({ onHeightChange }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [basketCount, setBasketCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const navRef = useRef(null);

  // Function to handle user icon click
  const handleUserIconClick = () => {
    if (router.pathname === '/userProfile') {
      router.push('/');
    } else {
      router.push('/userProfile');
    }
  };

  // Measure navbar height and pass it to the parent
  useEffect(() => {
    if (navRef.current && onHeightChange) {
      const height = navRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, [onHeightChange, isMenuOpen]);

  // Add scroll listener for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle user logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      toast.success('Successfully logged out');
      router.push('/'); // Redirect to login page after logout
    } catch (error) {
      toast.error('Error logging out');
    }
  }, [router]);

  // Update basket count based on items
  const updateBasketCount = useCallback((items) => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setBasketCount(count);
  }, []);

  // Sync basket between Firestore and cookies
  const syncBasketWithFirestore = useCallback(async (userId) => {
    const basket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];

    if (basket.length > 0) {
      const basketRef = doc(db, 'baskets', userId);
      const basketDoc = await getDoc(basketRef);
      let newBasket = basketDoc.exists() ? basketDoc.data().items || [] : [];

      basket.forEach((product) => {
        const existingProductIndex = newBasket.findIndex(
          (item) => item.id === product.id && item.size === product.size
        );
        if (existingProductIndex !== -1) {
          newBasket[existingProductIndex].quantity += product.quantity;
        } else {
          newBasket.push(product);
        }
      });

      await setDoc(basketRef, { items: newBasket });

      Cookies.remove('basket');
      updateBasketCount(newBasket);
    }
  }, [updateBasketCount]);

  // Listen for auth state changes and sync basket
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserData(userDoc.data());

        await syncBasketWithFirestore(currentUser.uid);

        const basketUnsubscribe = onSnapshot(doc(db, 'baskets', currentUser.uid), (snap) => {
          updateBasketCount(snap.exists() ? snap.data().items : []);
        });

        return () => basketUnsubscribe();
      } else {
        const checkCookie = () => {
          const basket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];
          updateBasketCount(basket);
        };

        const interval = setInterval(checkCookie, 1000);

        return () => clearInterval(interval);
      }
    });

    return () => unsubscribe();
  }, [syncBasketWithFirestore, updateBasketCount]);

  // Check if the current route is active
  const isActive = (path) => router.pathname === path;

  // Disable scrolling when the mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!user?.uid) return;
  
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      async (userDoc) => {
        try {
          if (userDoc.exists()) {
            const data = userDoc.data();
  
            // Get Firebase ID Token
            const idToken = await user.getIdToken();
  
            setUserData({
              avatar: data.avatar
                ? `/api/serve-image?filename=${data.avatar}&token=${idToken}&t=${Date.now()}`
                : null,
            });
          } else {
            toast.error("User data does not exist!");
          }
        } catch (error) {
          toast.error("Error fetching user data!");
        }
      },
      (error) => {
        toast.error("Error with the real-time listener!");
      }
    );
  
    // Cleanup the listener when the component unmounts or the user changes
    return () => {
      unsubscribe(); // Unsubscribe from the snapshot listener
    };
  }, [user?.uid]);
  
  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 transition-transform duration-300 ${
          isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
        } bg-black/80 backdrop-blur-lg z-50`}
        aria-label="Main Navigation"
      >
        <motion.div
          initial={false}
          animate={{
            y: isNavbarVisible ? 0 : -20,
            opacity: isNavbarVisible ? 1 : 0,
          }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex-shrink-0" aria-label="Home">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative h-10 w-28"
              >
                <Image
                  src="/logow.png"
                  alt="ASHE Logo"
                  fill
                  sizes="auto"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={item.path}
                    className={`flex items-center text-sm space-x-2 ${
                      isActive(item.path)
                        ? 'text-teal-400'
                        : 'text-gray-300 hover:text-teal-300'
                    } transition-colors`}
                    aria-label={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <motion.div whileHover={{ scale: 1.05 }}>
                <BasketIcon count={basketCount} className="text-gray-300" />
              </motion.div>

              {user ? (
                // The user icon is now clickable. If on "/userProfile", clicking redirects to "/"
<div
  onClick={handleUserIconClick}
  className=" cursor-pointer flex items-center justify-around px-2 py-1 rounded-full border border-gray-600 hover:border-teal-400/80 text-gray-300 hover:text-teal-400 transition-all duration-300 shadow-md hover:shadow-xl backdrop-blur-sm bg-black/30 hover:bg-black/50 relative overflow-hidden"
>
  {/* Animated background layer */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-transparent opacity-0 hover:opacity-100"
    initial={{ opacity: 0 }}
    animate={{ opacity: router.pathname === '/userProfile' ? 0.1 : 0 }}
    transition={{ duration: 0.3 }}
  />
  
  {userData?.avatar ? (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.img
        src={`${userData.avatar}${userData.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`}
        alt="User Avatar"
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-600/80 hover:border-teal-400/80 transition-all duration-300"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onError={(e) => {
          e.target.onerror = null;
          setUserData(prev => ({ ...prev, avatar: null }));
        }}
      />
      {/* Online status indicator */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-400 rounded-full border-2 border-black/80" />
    </motion.div>
  ) : (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <FaUserCircle className="text-gray-500/80 w-10 h-10 transition-all duration-300 hover:text-teal-400/90" />
    </motion.div>
  )}
  
  <motion.span 
    className="text-sm font-medium hidden sm:block tracking-tight"
    initial={{ x: -5 }}
    animate={{ x: 0 }}
    transition={{ delay: 0.1 }}
  >
    Profile
  </motion.span>

  {/* Active state indicator */}
  {router.pathname === '/userProfile' && (
    <motion.div 
      className="absolute -right-1 -top-1 w-2 h-2 bg-teal-400 rounded-full shadow-glow"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
    />
  )}
</div>

              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden lg:flex items-center space-x-2 text-gray-300 hover:text-teal-400"
                    aria-label="Login"
                  >
                    <FaSignInAlt className="h-4 w-4" />
                    <span className="text-sm">Login</span>
                  </Link>
                  <div className="hidden lg:block h-5 w-px bg-gray-700 mx-3" aria-hidden="true" />
                  <Link
                    href="/signup"
                    className="hidden lg:flex items-center space-x-2 text-gray-300 hover:text-teal-400"
                    aria-label="Sign Up"
                  >
                    <FaUserPlus className="h-4 w-4" />
                    <span className="text-sm">Sign Up</span>
                  </Link>
                </>
              )}

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.05 }}
                className="lg:hidden p-2 text-gray-300 hover:text-teal-400"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              clipPath: 'circle(0% at 100% 0%)'
            }}
            animate={{
              opacity: 1,
              clipPath: 'circle(150% at 100% 0%)',
              transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
            }}
            exit={{
              opacity: 0,
              clipPath: 'circle(0% at 100% 0%)',
              transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
            }}
            className="fixed inset-0 bg-black z-40  flex flex-col justify-center items-center "
          >
            <div className="space-y-6 ">
              {menuItems.map((item) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex " 
                >
                  <Link
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-center space-x-3 text-2xl ${
                      isActive(item.path)
                        ? 'text-teal-400'
                        : 'text-gray-300 hover:text-teal-300'
                    } py-3 block`}
                    aria-label={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              <div className="w-full border-t border-gray-800">
                {!user ? (
                  <div className="flex flex-col mt-4 items-start space-y-5">
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-3 text-gray-300 hover:text-teal-400 py-2"
                      aria-label="Login"
                    >
                      <FaSignInAlt className="h-5 w-5" />
                      <span className="text-lg">Login</span>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-3 text-gray-300 hover:text-teal-400 py-2"
                      aria-label="Sign Up"
                    >
                      <FaUserPlus className="h-5 w-5" />
                      <span className="text-lg">Sign Up</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-5 items-start">
                    <div
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-3 text-[#46c7c7] hover:text-white-400 py-2"
                    >
                      <FaSignInAlt className="h-5 w-5" />
                      <span className="text-lg">Logout</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const BasketIcon = ({ count }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="relative" aria-label={`Basket items: ${count}`}>
    <Link
      href="/basket"
      className="text-gray-600 hover:text-teal-500"
      aria-label={`Basket items: ${count}`}
    >
      <RiShoppingBasket2Fill className="h-5 w-5 text-white" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center"
          aria-hidden="true"
        >
          {count}
        </motion.span>
      )}
    </Link>
  </motion.div>
);
