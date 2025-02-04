import { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react';
import Head from 'next/head'; // Import Head from next/head
import { collection, getDocs, query, orderBy, limit, startAfter, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen'; // Import the custom loading component
import { app, db } from '../lib/firebase'; // Import initialized Firebase app
import Cookies from 'js-cookie'; // Import js-cookie to manage cookies
import { toast, Toaster } from 'sonner'; // Import toast and Toaster from sonner

// Lazy-load ProductCard component
const ProductCard = lazy(() => import('../components/ProductCard'));

const PRODUCTS_PER_PAGE = 2; // Limit the number of products per page

export default function Products() {
    const [firstName, setFirstName] = useState(''); // Store the first name
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [lastVisible, setLastVisible] = useState(null); // Last product for pagination
    const [loading, setLoading] = useState(false); // State for loading state
    const [hasMore, setHasMore] = useState(true); // State to check if there are more products
    const observer = useRef();

    useEffect(() => {
        fetchProducts(); // Initial fetch of products
        const auth = getAuth();

        // Listen for authentication state changes
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser); // Set user if logged in

            // If logged in, sync cookies with Firestore
            if (currentUser) {
                syncBasketWithFirestore(currentUser.uid);
                fetchUserFirstName(currentUser.uid);
            } else {
                setFirstName(''); // Clear first name when user logs out
            }
        });

        // Cleanup listener
        return () => unsubscribe();
    }, []);

    // Fetch products with pagination
    const fetchProducts = useCallback(async () => {
        if (loading || !hasMore) return; // Prevent multiple requests while loading

        setLoading(true); // Set loading state to true
        const productsCollection = collection(db, 'products');
        let productQuery = query(
            productsCollection,
            orderBy('index', 'desc'),
            limit(PRODUCTS_PER_PAGE)
        );

        // Add pagination logic if we have a last visible product
        if (lastVisible) {
            productQuery = query(productQuery, startAfter(lastVisible));
        }

        try {
            const productsSnapshot = await getDocs(productQuery);
            const productsList = productsSnapshot.docs.map((doc) => ({
                id: doc.id, // Include doc ID for easy identification
                ...doc.data(),
            }));

            setProducts((prevProducts) => [...prevProducts, ...productsList]);
            setLoading(false); // Reset loading state

            // Update the last visible product for pagination
            const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
            setLastVisible(lastDoc);

            // Check if there are more products to fetch
            setHasMore(productsSnapshot.docs.length === PRODUCTS_PER_PAGE);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    }, [loading, hasMore, lastVisible]);

    // Add product to basket, use cookies if user is not logged in
    const addToBasket = useCallback(async (product) => {
        if (!user) {
            // Store product in cookies if user is not logged in
            const basket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];
            
            // Convert the basket array to a Map for easier manipulation
            const basketMap = new Map(basket.map(item => [`${item.id}-${item.size}`, item]));
    
            // Generate a unique key for the product (id + size)
            const productKey = `${product.id}-${product.size}`;
    
            // Check if the product already exists in the basket
            if (basketMap.has(productKey)) {
                // If the product exists, increment its quantity
                basketMap.get(productKey).quantity += 1;
            } else {
                // Otherwise, add the product with quantity 1
                basketMap.set(productKey, { ...product, quantity: 1, size: product.size });
            }
    
            // Convert the Map back to an array and save to cookies
            const updatedBasket = Array.from(basketMap.values());
            Cookies.set('basket', JSON.stringify(updatedBasket), { expires: 7 });
    
            // Show a toast message
            toast.success(`${product.name} added to your basket!`);
            return;
        }
    
        // Add to Firestore if the user is logged in
        const basketRef = doc(db, 'baskets', user.uid); // Use user's UID as the document ID for the basket
        const basketDoc = await getDoc(basketRef);
    
        let basketMap = new Map();
        if (basketDoc.exists()) {
            const basketData = basketDoc.data();
            // Convert the existing basket items to a Map
            basketMap = new Map(basketData.items.map(item => [`${item.id}-${item.size}`, item]));
        }
    
        // Generate a unique key for the product (id + size)
        const productKey = `${product.id}-${product.size}`;
    
        // Check if the product already exists in the basket
        if (basketMap.has(productKey)) {
            // If the product exists, increment its quantity
            basketMap.get(productKey).quantity += 1;
        } else {
            // Otherwise, add the product with quantity 1
            basketMap.set(productKey, { ...product, quantity: 1, size: product.size });
        }
    
        // Convert the Map back to an array and update Firestore
        const updatedBasket = Array.from(basketMap.values());
        await setDoc(basketRef, { items: updatedBasket });
    
        // Show a toast message
        toast.success(`${product.name} added to your basket!`);
    }, [user]);

    // Sync the basket from cookies to Firestore when the user logs in
    const syncBasketWithFirestore = useCallback(async (userId) => {
        const basket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];
    
        if (basket.length > 0) {
            const basketRef = doc(db, 'baskets', userId);
    
            // Get the current basket or create a new one
            const basketDoc = await getDoc(basketRef);
            let basketMap = new Map();
    
            if (basketDoc.exists()) {
                const basketData = basketDoc.data();
                // Convert the existing basket items to a Map
                basketMap = new Map(basketData.items.map(item => [`${item.id}-${item.size}`, item]));
            }
    
            // Merge items from the cookies basket into Firestore basket
            basket.forEach(product => {
                const productKey = `${product.id}-${product.size}`;
                if (basketMap.has(productKey)) {
                    // If the product exists, add the quantity
                    basketMap.get(productKey).quantity += product.quantity;
                } else {
                    // Otherwise, add the product
                    basketMap.set(productKey, product);
                }
            });
    
            // Convert the Map back to an array and update Firestore
            const updatedBasket = Array.from(basketMap.values());
            await setDoc(basketRef, { items: updatedBasket });
    
            // Remove cookies after sync
            Cookies.remove('basket');
        }
    }, []);

    // Fetch the user's first name from Firestore
    const fetchUserFirstName = useCallback(async (userId) => {
        try {
            const userDocRef = doc(db, 'users', userId); // Path: users/{uid}
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setFirstName(userData.firstName || 'Valued User');
            } else {
                setFirstName('Valued User'); // Default name if user data doesn't exist
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setFirstName('Valued User'); // Fallback in case of an error
        }
    }, []);

    if (loading) {
        return <LoadingScreen />; // Use the custom loading component
    }

    return (
        <Layout>
            <Head>
                <title>Products | ASHE™</title>
                <meta name="description" content="Browse our collection of products." />
            </Head>
            {/* Hero Section */}
            <header className="bg-gradient-to-b from-white to-gray-50 py-20 mb-16 border-b">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Our Collection
                    </h1>
                    {user && (
                        <p className="text-xl text-gray-600 font-medium">Welcome back, {firstName} <span className="wave">👋</span></p>
                    )}
                </div>
            </header>

            {/* Product Grid */}
            <main className="container mx-auto px-4 mb-24">
                <div className="grid grid-cols-1 gap-12">
                    {products.map((product, index) => (
                        <div
                        key={product.id || `product-${index}`} 
                            className="group relative"
                        >
                            <Suspense fallback={
                                <div className="aspect-square bg-gray-100  animate-pulse" />
                            }>
                                <ProductCard
                                    product={product}
                                    onAddToBasket={addToBasket}
                                />
                            </Suspense>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="flex justify-center mt-16">
                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className={`w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </main>
        </Layout>
    );
}