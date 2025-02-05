import { useEffect, useState, useCallback, useRef } from 'react'; // Add useRef
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';
import { FaShoppingBasket, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaHome, FaTshirt, FaInfoCircle, FaEnvelope, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
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
    <nav
      ref={navRef} // Attach the ref to the nav element
      className={`fixed top-0 left-0 right-0 transition-transform ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'} ${isScrolled ? 'bg-white' : 'bg-transparent'} bg-white/90 backdrop-blur-sm border-b border-gray-100 w-full z-50`}
    >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-12 w-32">
              <Image
                src="/logow.png"
                alt="ASHE Logo"
                fill
                sizes='auto'
                className="object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center text-sm  ${
                  isActive(item.path)
                    ? 'text-teal-600 font-semibold'
                    : 'text-gray-600 hover:text-teal-500'
                } transition-colors`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            <BasketIcon count={basketCount} />

            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-teal-500 transition-colors"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden lg:flex items-center text-gray-600 hover:text-teal-500 transition-colors"
                >
                  <FaSignInAlt className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="hidden lg:flex items-center text-gray-600 hover:text-teal-500 transition-colors"
                >
                  <FaUserPlus className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Sign Up</span>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-teal-500"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute w-full bg-white shadow-lg"
          >
            <div className="px-4 pt-2 pb-8 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-4 py-3  ${
                    isActive(item.path)
                      ? 'bg-teal-50 text-teal-600 font-semibold '
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {!user && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    <FaSignInAlt className="mr-3 h-5 w-5" />
                    <span className="font-medium">Login</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    <FaUserPlus className="mr-3 h-5 w-5" />
                    <span className="font-medium">Sign Up</span>
                  </Link>
                </>
              )}

              {user && (
                <div className="px-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <FaUserCircle className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {userData?.firstName || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const BasketIcon = ({ count }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="relative">
    <Link href="/basket" className="text-gray-600 hover:text-teal-500">
      <FaShoppingBasket className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  </motion.div>
);