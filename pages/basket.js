import { useState, useEffect, lazy, Suspense } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});import Head from 'next/head';

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
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        setUserInfo(userSnapshot.data());
      } else {
        toast.error('User info not found.');
      }
    } catch (error) {
      toast.error('Error fetching user info:', error);
    }
  };

  // Fetch and sync the basket from Firestore
  const fetchAndSyncBasket = async (userId) => {
    try {
      const basketDocRef = doc(db, 'baskets', userId);
      const basketSnapshot = await getDoc(basketDocRef);

      let firestoreBasket = basketSnapshot.exists()
        ? basketSnapshot.data().items || []
        : [];
      const cookiesBasket = Cookies.get('basket')
        ? JSON.parse(Cookies.get('basket'))
        : [];

      // Merge baskets from Firestore and cookies
      firestoreBasket = mergeBaskets(firestoreBasket, cookiesBasket);

      // Update Firestore with the merged basket
      await updateDoc(basketDocRef, { items: firestoreBasket });

      // Remove synced cookies and set state
      Cookies.remove('basket');
      setBasket(firestoreBasket);
      updateBasketCount(firestoreBasket);
    } catch (error) {
      toast.error('Error syncing basket:', error);
    }
  };

  // Load basket from cookies for unauthenticated users
  const loadBasketFromCookies = () => {
    const basketFromCookies = Cookies.get('basket')
      ? JSON.parse(Cookies.get('basket'))
      : [];
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

  // Remove an item from the basket
  const removeFromBasket = (itemId, itemSize) => {
    const updatedBasket = basket.filter(
      (item) => !(item.id === itemId && item.size === itemSize)
    );
    setBasket(updatedBasket);

    if (auth.currentUser) {
      updateBasketInFirestore(updatedBasket);
    } else {
      Cookies.set('basket', JSON.stringify(updatedBasket), { expires: 7 });
    }

    updateBasketCount(updatedBasket);
  };

  // Update basket count (total quantity of items)
  const updateBasketCount = (basketItems) => {
    const totalItems = basketItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    setBasketCount(totalItems);
  };

  // Update basket in Firestore
  const updateBasketInFirestore = async (updatedBasket) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const basketDocRef = doc(db, 'baskets', user.uid);
        await updateDoc(basketDocRef, { items: updatedBasket });
      }
    } catch (error) {
      toast.error('Error updating basket:', error);
    }
  };

  /**
   * Update the quantity of a basket item.
   * First checks the product's available stock for the selected size in Firestore.
   * If newQuantity is greater than the available stock, a toast alert is shown.
   */
  const updateQuantity = async (itemId, itemSize, newQuantity) => {
    if (newQuantity < 1) {
      // If new quantity is less than 1, remove the item
      removeFromBasket(itemId, itemSize);
      return;
    }

    try {
      // Get the product document to check available stock for the selected size
      const productRef = doc(db, 'products', itemId);
      const productSnapshot = await getDoc(productRef);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();

        // Check if the stock map exists and if the size key is present
        const availableStock =
          productData.stock && productData.stock[itemSize] !== undefined
            ? productData.stock[itemSize]
            : 0;
        if (newQuantity > availableStock) {
          toast.error(
            `Not enough stock available for size ${itemSize}!`
          );
          return;
        }
      } else {
        toast.error('Unable to verify product stock.');
        return;
      }
    } catch (error) {
      toast.error('Error checking product stock. Please try again.');
      return;
    }

    // If available stock is sufficient, update the basket as usual
    const updatedBasket = basket.map((item) => {
      if (item.id === itemId && item.size === itemSize) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setBasket(updatedBasket);

    if (auth.currentUser) {
      updateBasketInFirestore(updatedBasket);
    } else {
      Cookies.set('basket', JSON.stringify(updatedBasket), { expires: 7 });
    }
    updateBasketCount(updatedBasket);
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

  // Handle placing the order (this example simply clears the basket)
  const handlePlaceOrder = async (shippingInfo, totalAmount) => {
    try {
      setBasket([]);
      if (auth.currentUser) {
        updateBasketInFirestore([]);
      } else {
        Cookies.remove('basket');
      }
      toast.success('Order placed successfully!');

    } catch (error) {
      toast.error('There was an error placing your order. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Head>
        <title>Basket | ASHE™</title>
        <meta
          name="description"
          content="Your curated selection of authentic Tunisian craftsmanship. Review your ASHE items, modify quantities, and proceed to secure checkout."
        />
      </Head>
      <Layout>
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-3xl mx-auto">
            <header className="text-center mb-16">
              <h1 className="text-4xl font-black uppercase tracking-widest text-black mb-4">
                Chosen Pieces
              </h1>
              <div className="h-1 w-24 bg-black mx-auto"></div>
            </header>

            <Suspense fallback={<LoadingSpinner />}>
              {basket.length === 0 ? (
                <div className="text-center flex items-center flex-col space-y-8">
                  <div className="w-40 mb-6 animate-bounce">
                    <img src="/basket.svg" alt="Empty Basket" />
                  </div>
                  <p className="text-xl text-gray-600 font-medium tracking-wide">
                    Awaiting your selection
                  </p>
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
                  >
                    Discover Collections
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-white border border-gray-300 rounded-none overflow-hidden divide-y divide-gray-300">
                    {basket.map((item, index) => (
                      <div
                        key={
                          item.id && item.size
                            ? `${item.id}-${item.size}`
                            : `basket-item-${index}`
                        }
                        className="group flex items-center p-6 hover:bg-gray-100 transition-all duration-300 animate-fadeIn"
                      >
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={item?.images?.[0] || '/placeholder-art.svg'}
                            alt={item.name}
                            className="w-full h-auto object-contain rounded-none"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push('/products');
                            }}
                            onError={(e) => {
                              e.target.src = '/placeholder-art.svg'; // Fallback if image doesn't load
                            }}
                            loading="lazy"
                          />
                        </div>

                        <div className="ml-6 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-black mb-1">
                                {item.name}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Size: {item.size}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromBasket(item.id, item.size)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-300 p-2"
                              aria-label="Remove items"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Quantity modification controls */}
                          <div className="mt-2 flex items-center space-x-4">
                            <button
                              onClick={async () =>
                                await updateQuantity(
                                  item.id,
                                  item.size,
                                  item.quantity - 1
                                )
                              }
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                            >
                              –
                            </button>
                            <span className="text-lg font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={async () =>
                                await updateQuantity(
                                  item.id,
                                  item.size,
                                  item.quantity + 1
                                )
                              }
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-medium text-black">
                                {(item.price * item.quantity).toFixed(2)} TND
                              </span>
                              <span className="text-gray-400">|</span>
                              <span className="text-sm text-gray-600">
                                {item.price.toFixed(2)} TND each
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sticky bottom-6 bg-black p-6 rounded-none animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl text-white">Total Summary</h2>
                        <p className="text-gray-600 mt-1 text-sm">
                          {basketCount} premium items selected
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-[#46c7c7]">
                        {basket
                          .reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          )
                          .toFixed(2)}{' '}
                        TND
                      </p>
                    </div>

                    <button
                      onClick={proceedToCheckout}
                      className="w-full mt-4 py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-white text-black hover:border-white hover:bg-black hover:text-white focus:bg-white focus:text-black focus:outline-none"
                    >
                      <span>Secure Checkout</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </Suspense>

            {showCheckoutPopup && userInfo && (
              <Suspense >
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
        {/* Custom styles for fade-in animation */}
        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Layout>
    </>
  );
}
