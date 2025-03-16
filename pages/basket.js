'use client';
import { useState, useEffect, lazy, Suspense } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useBasket } from '../contexts/BasketContext';
import Head from 'next/head';

// Lazy-load CheckoutPopup component
const CheckoutPopup = lazy(() => import('../components/CheckoutPopup'));
const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

export default function Basket() {
  const {
    getItemQuantity,
    updateItemQuantity,
    basketItems,
    basketCount,
    loadBasketFromCookies,
    removeItemFromBasket,
    clearBasket
  } = useBasket();
  const [loading, setLoading] = useState(true);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  // Fetch authenticated user and set basket on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        // Fetch user info and basket from Firestore
        await fetchUserInfo(user.uid);
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
      if (auth.currentUser) {
        clearBasket();
      } else {
        Cookies.remove('basket');
      }
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
              {basketCount === 0 ? (
                <div className="text-center flex items-center flex-col space-y-8">
                  <div className="w-40 mb-6 animate-bounce">
                    <Image
                      width={96}
                      height={96}
                      className="w-full h-full object-contain rounded-none"
                      src="/basket.svg"
                      alt="Empty Basket"
                    />
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
                    {basketItems.map((item, index) => (
                      <div
                        key={
                          item.id && item.size && item.color
                            ? `${item.id}-${item.size}-${item.color}`
                            : `basket-item-${index}`
                        }
                        className="group flex items-center p-6 hover:bg-gray-100 transition-all duration-300 animate-fadeIn"
                      >
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={item?.images?.[0] || '/placeholder-art.svg'}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-contain rounded-none"
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
                                Size: {item.size}, Color: {item.color}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItemFromBasket(item.id, item.size, item.color)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-300 p-2"
                              aria-label="Remove item"
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
                              onClick={() => updateItemQuantity(item.id, item.size, item.color, item.quantity - 1)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                            >
                              –
                            </button>
                            <span className="text-lg font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItemQuantity(item.id, item.size, item.color, item.quantity + 1)}
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
                        <p className="text-gray-400 mt-1 text-sm">
                          {basketCount} premium items selected
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-[#46c7c7]">
                        {basketItems
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
              <Suspense>
                <CheckoutPopup
                  basketItems={basketItems}
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
