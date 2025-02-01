import { useState, useEffect, lazy, Suspense } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingScreen';

// Lazy-load CheckoutPopup component
const CheckoutPopup = lazy(() => import('../components/CheckoutPopup'));

export default function Basket() {
  const [basket, setBasket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [basketCount, setBasketCount] = useState(0);
  const router = useRouter();

  // Fetch authenticated user and set basket on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        // Fetch user info and basket from Firestore
        await fetchUserInfo(user.uid);
        await fetchAndSyncBasket(user.uid);
      } else {
        // Load basket from cookies for unauthenticated users
        loadBasketFromCookies();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user information from Firestore
  const fetchUserInfo = async (userId) => {
    try {
      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        setUserInfo(userSnapshot.data());
      } else {
        console.error('User info not found.');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch and sync the basket from Firestore
  const fetchAndSyncBasket = async (userId) => {
    try {
      const basketDoc = doc(db, 'baskets', userId);
      const basketSnapshot = await getDoc(basketDoc);

      let firestoreBasket = basketSnapshot.exists() ? basketSnapshot.data().items || [] : [];
      const cookiesBasket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];

      // Merge baskets from Firestore and cookies
      firestoreBasket = mergeBaskets(firestoreBasket, cookiesBasket);

      // Update Firestore with the merged basket
      await updateDoc(basketDoc, { items: firestoreBasket });

      // Remove synced cookies and set state
      Cookies.remove('basket');
      setBasket(firestoreBasket);
      updateBasketCount(firestoreBasket);
    } catch (error) {
      console.error('Error syncing basket:', error);
    }
  };

  // Load basket from cookies for unauthenticated users
  const loadBasketFromCookies = () => {
    const basketFromCookies = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];
    setBasket(basketFromCookies);
    updateBasketCount(basketFromCookies);
  };

  // Merge baskets from Firestore and cookies
  const mergeBaskets = (firestoreBasket, cookiesBasket) => {
    const mergedBasket = [...firestoreBasket];

    cookiesBasket.forEach((cookieItem) => {
      const existingItemIndex = mergedBasket.findIndex(
        (item) => item.id === cookieItem.id && item.size === cookieItem.size
      );
      if (existingItemIndex !== -1) {
        // Merge quantities and preserve images
        mergedBasket[existingItemIndex].quantity += cookieItem.quantity;
        if (cookieItem.images) {
          mergedBasket[existingItemIndex].images = cookieItem.images;
        }
      } else {
        mergedBasket.push(cookieItem);
      }
    });

    return mergedBasket;
  };

  // Remove item from basket
  const removeFromBasket = (itemId, itemSize) => {
    const updatedBasket = basket.filter((item) => !(item.id === itemId && item.size === itemSize));
    setBasket(updatedBasket);

    if (auth.currentUser) {
      updateBasketInFirestore(updatedBasket);
    } else {
      Cookies.set('basket', JSON.stringify(updatedBasket), { expires: 7 });
    }

    updateBasketCount(updatedBasket);
  };

  // Update basket count (total quantity of items)
  const updateBasketCount = (basket) => {
    const totalItems = basket.reduce((total, item) => total + item.quantity, 0);
    setBasketCount(totalItems);
  };

  // Update basket in Firestore
  const updateBasketInFirestore = async (updatedBasket) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const basketDoc = doc(db, 'baskets', user.uid);
        await updateDoc(basketDoc, { items: updatedBasket });
      }
    } catch (error) {
      console.error('Error updating basket:', error);
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    const user = auth.currentUser;
    if (user) {
      setShowCheckoutPopup(true);
    } else {
      router.push('/login');
    }
  };

  // Close checkout popup
  const closePopup = () => setShowCheckoutPopup(false);

  // Handle placing the order
  const handlePlaceOrder = async (shippingInfo, totalAmount) => {
    try {
      setBasket([]);
      if (auth.currentUser) {
        await updateBasketInFirestore([]);
      } else {
        Cookies.remove('basket');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('There was an error placing your order. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
              Your Curated Selection
            </h1>
            <div className="h-1 w-24 bg-black mx-auto"></div>
          </header>

          <Suspense fallback={
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            {basket.length === 0 ? (
              <div className="text-center space-y-8 animate-fade-in">
                <div className="text-8xl mb-6 animate-bounce">🧺</div>
                <p className="text-2xl text-gray-600 font-medium mb-4">
                  Your artisanal basket awaits
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden divide-y divide-gray-100">
                  {basket.map((items) => (
                    <div
                      key={`${items.id}-${items.size}`}
                      className="group flex items-center p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0">
                      <img
  src={items?.images[0] || '/placeholder-art.svg'}
  alt={items.name}
  className="w-full h-auto object-contain rounded-lg shadow-lg"
  onError={(e) => {
    console.log('Error loading image:', e.target.src);  // Log the image URL on error
    e.target.src = '/placeholder-art.svg';  // Fallback if image doesn't load
  }}
  loading="lazy"
/>


                        <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-full shadow text-sm font-medium">
                          ×{items.quantity}
                        </div>
                      </div>

                      <div className="ml-6 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{items.name}</h3>
                            <p className="text-gray-600 text-sm">Size: {items.size}</p>
                          </div>
                          <button
                            onClick={() => removeFromBasket(items.id, items.size)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 -m-2"
                            aria-label="Remove items"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-medium text-gray-900">
                              {(items.price * items.quantity).toFixed(2)} TND
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm text-gray-600">
                              {items.price.toFixed(2)} TND each
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-6 bg-gradient-to-r from-black to-gray-900 text-white p-8 rounded-3xl shadow-2xl backdrop-blur-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black">Total Summary</h2>
                      <p className="text-gray-300 mt-1 text-sm">
                        {basketCount} premium items selected
                      </p>
                    </div>
                    <p className="text-2xl font-bold">
                      {basket.reduce((total, items) => total + items.price * items.quantity, 0).toFixed(2)} TND
                    </p>
                  </div>

                  <button
                    onClick={proceedToCheckout}
                    className="w-full flex items-center justify-center space-x-3 bg-white text-black py-5 px-8 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-[1.02]"
                  >
                    <span>Secure Checkout</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </Suspense>

          {showCheckoutPopup && userInfo && (
            <Suspense fallback={
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <CheckoutPopup
                basket={basket}
                userInfo={userInfo}
                onClose={closePopup}
                onPlaceOrder={handlePlaceOrder}
              />
            </Suspense>
          )}
        </div>
      </div>
    </Layout>
  );
}