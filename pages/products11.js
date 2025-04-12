import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import Head from 'next/head';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import { useBasket } from '../contexts/BasketContext';
import { db } from '../lib/firebase';
import { toast, Toaster } from 'sonner';

const LoadingScreen = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

const ProductCard = lazy(() => import('../components/ProductCard'));

const PRODUCTS_PER_PAGE = 3;

export default function Products() {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null); // New error state

    // Use basket context
    const { getItemQuantity, addItemToBasket } = useBasket();

    const loadMoreProducts = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const productsCollection = collection(db, 'products');
        let productQuery = query(
            productsCollection,
            orderBy('index', 'desc'),
            limit(PRODUCTS_PER_PAGE)
        );

        if (lastVisible) {
            productQuery = query(productQuery, startAfter(lastVisible));
        }

        try {
            const productsSnapshot = await getDocs(productQuery);
            const productsList = productsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setProducts(prev => [...prev, ...productsList]);
            setLoading(false);

            const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
            setLastVisible(lastDoc);

            setHasMore(productsSnapshot.docs.length === PRODUCTS_PER_PAGE);
        } catch (error) {
            setLoading(false);
            setError("Failed to load more products. Please try again later.");
        }
    }, [loading, hasMore, lastVisible]);

    // Initial products fetch
    useEffect(() => {
        const initialFetch = async () => {
            setLoading(true);
            const productsCollection = collection(db, 'products');
            const productQuery = query(
                productsCollection,
                orderBy('index', 'desc'),
                limit(PRODUCTS_PER_PAGE)
            );

            try {
                const productsSnapshot = await getDocs(productQuery);
                const productsList = productsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProducts(productsList);

                const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
                setLastVisible(lastDoc);

                setHasMore(productsSnapshot.docs.length === PRODUCTS_PER_PAGE);
            } catch (error) {
                setError("Failed to load products. Please check your internet connection.");

            }
            setLoading(false);
        };

        initialFetch();
    }, []);

    // Auth management
    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    if (loading && products.length === 0) {
        return <LoadingScreen />;
    }
    if (error) {
        return (
            <Layout>
                <Head>
                    <title>Products | ASHE™</title>
                    <meta name="description" content="Browse our collection of products." />
                </Head>
                <main className="container mx-auto px-4 mb-24">
                    <div className="text-center text-red-500 font-bold text-xl">
                        <p>{error}</p>
                    </div>
                </main>
                <Toaster position="bottom-center" richColors />
            </Layout>
        );
    }

    // Display fallback message if products list is empty
    if (!products || products.length === 0) {
        return (
            <Layout>
                <Head>
                    <title>Products | ASHE™</title>
                    <meta name="description" content="Browse our collection of products." />
                </Head>
                <main 
            className="relative py-24 px-4 sm:px-6 lg:px-8"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col items-center text-center bg-white  p-8 shadow-lg shadow-red-100/50 border border-red-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <svg 
                            className="w-10 h-10 text-red-600"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1.5}
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                        Unable to Load Products
                    </h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-md">
                        We're having trouble loading products. Please check your connection and try again.
                    </p>
                    <p className="text-sm text-gray-500 mt-6">
                        Error code: 404-PRODUCTS • Last attempted: {new Date().toLocaleTimeString()}
                    </p>
                </div>
                
                {/* Error boundary decoration */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-red-50/20 to-transparent" />
            </div>
        </main>
                <Toaster position="bottom-center" richColors />
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>Products | ASHE™</title>
                <meta name="description" content="Browse our collection of products." />
            </Head>
            <Suspense fallback={<LoadingScreen />}>
                <main className="container mx-auto px-4 mb-24">
                    <div className="grid grid-cols-1 gap-14">
                        {products.map((product, index) => (
                            <div
                                key={product.id || `product-${index}`}
                                className="group relative mt-5"
                            >
                                <ProductCard
                                    product={product}
                                    getItemQuantity={getItemQuantity}
                                    onAddToBasket={addItemToBasket}
                                />
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-16">
                            <button
                                onClick={loadMoreProducts}
                                disabled={loading}
                                className={`w-full max-w-sm py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none h-[56px] ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </main>
                <Toaster position="bottom-center" richColors />
            </Suspense>
        </Layout>
    );
}
