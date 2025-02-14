import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import Head from 'next/head';
import { collection, getDocs, query, orderBy, limit, startAfter, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import { app, db } from '../lib/firebase';
import Cookies from 'js-cookie';
import { toast, Toaster } from 'sonner';

const ProductCard = lazy(() => import('../components/ProductCard'));

const PRODUCTS_PER_PAGE = 2;

export default function Products() {
    const [firstName, setFirstName] = useState('');
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [basketItems, setBasketItems] = useState([]);

    const getBasketQuantity = useCallback((productId, size) => {
        const item = basketItems.find(item => item.id === productId && item.size === size);
        return item ? item.quantity : 0;
    }, [basketItems]);

    const addToBasket = useCallback(async (product) => {
        const newBasket = [...basketItems];
        const existingIndex = newBasket.findIndex(
            item => item.id === product.id && item.size === product.size
        );

        if (existingIndex >= 0) {
            newBasket[existingIndex].quantity += 1;
        } else {
            newBasket.push({ ...product, quantity: 1 });
        }

        if (user) {
            const basketRef = doc(db, 'baskets', user.uid);
            await setDoc(basketRef, { items: newBasket });
        } else {
            Cookies.set('basket', JSON.stringify(newBasket), { expires: 7 });
        }

        setBasketItems(newBasket);
        toast.success(`${product.name} added to your basket!`);
    }, [user, basketItems]);

    const syncBasketWithFirestore = useCallback(async (userId) => {
        const cookieBasket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];
        if (cookieBasket.length === 0) return;

        const basketRef = doc(db, 'baskets', userId);
        const basketDoc = await getDoc(basketRef);
        let firestoreBasket = basketDoc.exists() ? basketDoc.data().items : [];

        const mergedBasket = [...firestoreBasket];
        cookieBasket.forEach(cookieItem => {
            const existingIndex = mergedBasket.findIndex(
                item => item.id === cookieItem.id && item.size === cookieItem.size
            );
            if (existingIndex >= 0) {
                mergedBasket[existingIndex].quantity += cookieItem.quantity;
            } else {
                mergedBasket.push(cookieItem);
            }
        });

        await setDoc(basketRef, { items: mergedBasket });
        Cookies.remove('basket');
        setBasketItems(mergedBasket);
    }, []);

    const fetchUserFirstName = useCallback(async (userId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setFirstName(userData.firstName || 'Valued User');
            } else {
                setFirstName('Valued User');
            }
        } catch (error) {
            setFirstName('Valued User');
        }
    }, []);

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
            }
            setLoading(false);
        };

        initialFetch();
    }, []);

    // Auth and basket management
    useEffect(() => {
        const auth = getAuth();
        
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await syncBasketWithFirestore(currentUser.uid);
                fetchUserFirstName(currentUser.uid);
                const basketRef = doc(db, 'baskets', currentUser.uid);
                const basketDoc = await getDoc(basketRef);
                setBasketItems(basketDoc.exists() ? basketDoc.data().items : []);
            } else {
                setFirstName('');
                const cookieBasket = Cookies.get('basket');
                setBasketItems(cookieBasket ? JSON.parse(cookieBasket) : []);
            }
        });

        return () => unsubscribe();
    }, [syncBasketWithFirestore, fetchUserFirstName]);

    if (loading && products.length === 0) {
        return <LoadingScreen />;
    }

    return (
        <Layout>
            <Head>
                <title>Products | ASHE™</title>
                <meta name="description" content="Browse our collection of products." />
            </Head>

            {/* Fixed height header */}
            <header className="bg-gradient-to-b from-white to-gray-50 py-20 mb-16 border-b">
                <div className="container mx-auto px-4 text-center">
                    <div className="min-h-[120px] flex flex-col justify-center">
                        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            Our Collection
                        </h1>
                        {user && (
                            <p className="text-xl text-gray-600 font-medium">
                                Welcome back, {firstName} <span className="wave">👋</span>
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 mb-24">
                <div className="grid grid-cols-1 gap-12">
                    {products.map((product, index) => (
                        <div
                            key={product.id || `product-${index}`}
                            className="group relative"
                        >
                            <Suspense fallback={
                                <div className="space-y-4">
                                    <div className="aspect-square bg-gray-100 animate-pulse rounded-lg" />
                                    <div className="h-5 bg-gray-100 animate-pulse w-3/4" />
                                    <div className="h-5 bg-gray-100 animate-pulse w-1/3" />
                                    <div className="h-12 bg-gray-100 animate-pulse w-full rounded-lg" />
                                </div>
                            }>
                                <ProductCard
                                    product={product}
                                    getBasketQuantity={getBasketQuantity}
                                    onAddToBasket={addToBasket}
                                />
                            </Suspense>
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
        </Layout>
    );
}