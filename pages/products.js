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
                console.error("Error fetching products:", error);
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
