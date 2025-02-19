import { useEffect, useState, useCallback, useRef } from 'react'; // Add useRef
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';
import { 
  FaShoppingBasket, 
  FaSignInAlt, 
  FaUserPlus, 
  FaSignOutAlt, 
  FaHome, 
  FaTshirt, 
  FaInfoCircle, 
  FaEnvelope, 
  FaBars, 
  FaTimes, 
  FaUserCircle 
} from 'react-icons/fa';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';

const menuItems = [
  { path: '/', label: 'Home', icon: FaHome },
  { path: '/products', label: 'Products', icon: FaTshirt },
  { path: '/about', label: 'About', icon: FaInfoCircle },
  { path: '/contact', label: 'Contact', icon: FaEnvelope }
];

export default function Navbar({ onHeightChange }) { // Add onHeightChange prop
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [basketCount, setBasketCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const navRef = useRef(null); // Add a ref to measure height

  // Measure navbar height and pass it to the parent
  useEffect(() => {
    if (navRef.current && onHeightChange) {
      const height = navRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, [onHeightChange, isMenuOpen]); // Re-measure when menu opens/closes

  // Add scroll listener for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50); // Show the scroll effect after 50px

      // Determine the scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY); // For edge cases
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
    } catch (error) {
      toast.error('Error logging out');
    }
  }, []);

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

      // Merge items from cookies into Firestore basket
      basket.forEach((product) => {
        const existingProductIndex = newBasket.findIndex(
          (item) => item.id === product.id && item.size === product.size
        );
        if (existingProductIndex !== -1) {
          newBasket[existingProductIndex].quantity += product.quantity; // Update quantity
        } else {
          newBasket.push(product); // Add new product
        }
      });

      // Update Firestore with the merged basket
      await setDoc(basketRef, { items: newBasket });

      // Clear cookies after syncing
      Cookies.remove('basket');
      updateBasketCount(newBasket); // Update basket count
    }
  }, [updateBasketCount]);

  // Listen for auth state changes and sync basket
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserData(userDoc.data());

        // Sync basket from cookies to Firestore
        await syncBasketWithFirestore(currentUser.uid);

        // Listen for Firestore basket updates
        const basketUnsubscribe = onSnapshot(doc(db, 'baskets', currentUser.uid), (snap) => {
          updateBasketCount(snap.exists() ? snap.data().items : []);
        });

        return () => basketUnsubscribe();
      } else {
        // For guest users, check cookies for basket updates
        const checkCookie = () => {
          const basket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];
          updateBasketCount(basket);
        };

        // Check cookies every second
        const interval = setInterval(checkCookie, 1000);

        return () => clearInterval(interval);
      }
    });

    return () => unsubscribe();
  }, [syncBasketWithFirestore, updateBasketCount]);

  // Check if the current route is active
  const isActive = (path) => router.pathname === path;

  return (
    <>
      <nav
  ref={navRef}
  className={`fixed top-0 left-0 right-0 ${
    isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
  } ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'} bg-white/90 backdrop-blur-sm border-b border-gray-100 w-full z-50`}
>
  <motion.div
    initial={false}
    animate={{
      y: isNavbarVisible ? 0 : -100,
      opacity: isNavbarVisible ? 1 : 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        when: 'beforeChildren'
      }
    }}
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
  >
    <div className="flex justify-between items-center h-16">
      {/* Logo with bounce animation */}
      <Link href="/" className="flex-shrink-0">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="relative h-12 w-32"
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

      {/* Desktop Navigation with staggered items */}
      <motion.div 
        className="hidden lg:flex items-center space-x-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3
            }
          }
        }}
      >
        {menuItems.map((item) => (
          <motion.div
            key={item.path}
            variants={{
              hidden: { y: -20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
          >
            <Link
              href={item.path}
              className={`flex items-center text-sm ${
                isActive(item.path)
                  ? 'text-teal-600 font-semibold'
                  : 'text-gray-600 hover:text-teal-500'
              } transition-colors`}
            >
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="flex items-center"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </motion.span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Icons with interactive animations */}
      <motion.div 
        className="flex items-center space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <BasketIcon count={basketCount} />
        </motion.div>

        {user ? (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-teal-500 transition-colors"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5 }}
                whileHover={{ rotate: 360 }}
              >
                <FaSignOutAlt className="h-5 w-5" />
              </motion.span>
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              whileHover={{ x: 5 }}
              className="hidden lg:flex"
            >
              <Link
                href="/login"
                className="flex items-center text-gray-600 hover:text-teal-500 transition-colors"
              >
                <FaSignInAlt className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Login</span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden lg:flex"
            >
              <Link
                href="/signup"
                className="flex items-center text-gray-600 hover:text-teal-500 transition-colors"
              >
                <FaUserPlus className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Sign Up</span>
              </Link>
            </motion.div>
          </>
        )}

        {/* Animated Mobile Menu Button */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-gray-600 hover:text-teal-500"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isMenuOpen ? 180 : 0 }}
        >
          {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
        </motion.button>
      </motion.div>
    </div>
  </motion.div>
</nav>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
  {isMenuOpen && (
    <motion.div
      initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
      animate={{ 
        opacity: 1, 
        clipPath: 'circle(150% at 100% 0%)',
        transition: { 
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          when: "beforeChildren",
          staggerChildren: 0.1,
        }
      }}
      exit={{ 
        opacity: 0, 
        clipPath: 'circle(0% at 0% 100%)',
        transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] }
      }}
      className="fixed inset-0 bg-white z-50 flex flex-col justify-center items-center"
    >
      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          transition: { delay: 0.2 }
        }}
        exit={{ opacity: 0, scale: 0.5 }}
        whileHover={{ rotate: 180, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMenuOpen(false)}
        className="absolute top-4 right-4 text-gray-600 hover:text-teal-500 p-2"
      >
        <FaTimes className="h-8 w-8" />
      </motion.button>

      <motion.div 
        className="space-y-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {menuItems.map((item) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <Link
              href={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-center px-4 py-3 text-2xl font-medium ${
                isActive(item.path)
                  ? 'text-teal-600'
                  : 'text-gray-600 hover:text-teal-500'
              }`}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.label}
              </motion.span>
            </Link>
          </motion.div>
        ))}

        <motion.div 
          className="mt-4 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {!user && (
            <>
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring' }}
              >
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 text-2xl font-medium text-gray-600 hover:text-teal-500"
                >
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="flex items-center"
                  >
                    <FaSignInAlt className="mr-3 h-6 w-6" />
                    Login
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 text-2xl font-medium text-gray-600 hover:text-teal-500"
                >
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="flex items-center"
                  >
                    <FaUserPlus className="mr-3 h-6 w-6" />
                    Sign Up
                  </motion.span>
                </Link>
              </motion.div>
            </>
          )}

          {user && (
            <motion.div 
              className="mt-10 bg-neutral-800 absolute bottom-0 right-0 left-0 p-5"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaUserCircle className="h-10 w-10 text-gray-400" />
                </motion.div>
                <div>
                  <p className="text-xl font-medium text-left text-[#46c7c7] uppercase">
                    {userData?.firstName || 'User'} {userData?.lastName || ''}
                  </p>
                  <p className="text-lg text-gray-500">{user.email}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </>
  );
}

const BasketIcon = ({ count }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="relative">
    <Link 
      href="/basket" 
      className="text-gray-600 hover:text-teal-500"
      aria-label={`Basket items: ${count}`}
    >
      <FaShoppingBasket className="h-5 w-5" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center"
        >
          {count}
        </motion.span>
      )}
    </Link>
  </motion.div>
);
