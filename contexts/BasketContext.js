import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Create BasketContext
const BasketContext = createContext();

// Create a custom hook to use the BasketContext
export const useBasket = () => useContext(BasketContext);

// Create the BasketProvider component
export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate basket count
  const basketCount = basketItems.reduce((total, item) => total + item.quantity, 0);

  // Load basket from cookies
  const loadBasketFromCookies = useCallback(() => {
    const cookieBasket = Cookies.get('basket') ? JSON.parse(Cookies.get('basket')) : [];
    setBasketItems(cookieBasket);
    return cookieBasket;
  }, []);

  // Get quantity of a specific item in basket
  const getItemQuantity = useCallback((productId, size) => {
    const item = basketItems.find(item => item.id === productId && item.size === size);
    return item ? item.quantity : 0;
  }, [basketItems]);

  // Add item to basket
  const addItemToBasket = useCallback(async (product) => {
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
      try {
        const basketRef = doc(db, 'baskets', user.uid);
        await setDoc(basketRef, { items: newBasket });
        toast.success(`${product.name} added to your basket!`);
      } catch (error) {
        toast.error('Error adding to basket');
        return;
      }
    } else {
      Cookies.set('basket', JSON.stringify(newBasket), { expires: 7 });
      toast.success(`${product.name} added to your basket!`);
    }

    setBasketItems(newBasket);
  }, [user, basketItems]);

  // Remove item from basket
  const removeItemFromBasket = useCallback(async (itemId, itemSize) => {
    const updatedBasket = basketItems.filter(
      item => !(item.id === itemId && item.size === itemSize)
    );
    
    if (user) {
      try {
        const basketRef = doc(db, 'baskets', user.uid);
        await setDoc(basketRef, { items: updatedBasket });
      } catch (error) {
        toast.error('Error removing item from basket');
        return;
      }
    } else {
      Cookies.set('basket', JSON.stringify(updatedBasket), { expires: 7 });
    }
    
    setBasketItems(updatedBasket);
  }, [user, basketItems]);

  // Update item quantity in basket
  const updateItemQuantity = useCallback(async (itemId, itemSize, newQuantity) => {
    if (newQuantity < 1) {
      removeItemFromBasket(itemId, itemSize);
      return;
    }

    try {
      // Check stock availability
      const productRef = doc(db, 'products', itemId);
      const productSnapshot = await getDoc(productRef);
      
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        const availableStock = productData.stock && productData.stock[itemSize] !== undefined
          ? productData.stock[itemSize]
          : 0;
          
        if (newQuantity > availableStock) {
          toast.error(`Not enough stock available for size ${itemSize}!`);
          return;
        }
      }

      const updatedBasket = basketItems.map(item => 
        item.id === itemId && item.size === itemSize 
          ? { ...item, quantity: newQuantity } 
          : item
      );
      
      if (user) {
        const basketRef = doc(db, 'baskets', user.uid);
        await setDoc(basketRef, { items: updatedBasket });
      } else {
        Cookies.set('basket', JSON.stringify(updatedBasket), { expires: 7 });
      }
      
      setBasketItems(updatedBasket);
    } catch (error) {
      toast.error('Error updating item quantity');
    }
  }, [user, basketItems, removeItemFromBasket]);

  // Clear basket
  const clearBasket = useCallback(async () => {
    if (user) {
      try {
        const basketRef = doc(db, 'baskets', user.uid);
        await setDoc(basketRef, { items: [] });
      } catch (error) {
        toast.error('Error clearing basket');
        return;
      }
    }
    
    Cookies.remove('basket');
    setBasketItems([]);
  }, [user]);

  // Sync basket between Firestore and cookies
  const syncBasketWithFirestore = useCallback(async (userId) => {
    try {
      const cookieBasket = loadBasketFromCookies();
      
      if (cookieBasket.length === 0) return;

      const basketRef = doc(db, 'baskets', userId);
      const basketDoc = await getDoc(basketRef);
      const firestoreBasket = basketDoc.exists() ? basketDoc.data().items || [] : [];

      // Merge baskets
      const mergedBasket = [...firestoreBasket];
      
      cookieBasket.forEach(cookieItem => {
        const existingIndex = mergedBasket.findIndex(
          item => item.id === cookieItem.id && item.size === cookieItem.size
        );
        
        if (existingIndex >= 0) {
          // Ensure the new quantity doesn't exceed the original item's quantity
          const newQuantity = mergedBasket[existingIndex].quantity + cookieItem.quantity;
          if (newQuantity <= cookieItem.quantity) {
            mergedBasket[existingIndex].quantity = newQuantity;
          } else {
            mergedBasket[existingIndex].quantity = cookieItem.quantity;
          }
        } else {
          mergedBasket.push(cookieItem);
        }
      });

      await setDoc(basketRef, { items: mergedBasket });
      Cookies.remove('basket');
      setBasketItems(mergedBasket);
    } catch (error) {
      toast.error('Error syncing basket');
    }
  }, [loadBasketFromCookies]);

  // Initialize basket based on auth state
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // User is logged in - sync with Firestore and listen for changes
        await syncBasketWithFirestore(currentUser.uid);
        
        const basketUnsubscribe = onSnapshot(
          doc(db, 'baskets', currentUser.uid), 
          (snapshot) => {
            if (snapshot.exists()) {
              setBasketItems(snapshot.data().items || []);
            } else {
              setBasketItems([]);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to basket:', error);
            setLoading(false);
          }
        );
        
        return () => basketUnsubscribe();
      } else {
        // User is not logged in - use cookies
        loadBasketFromCookies();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncBasketWithFirestore, loadBasketFromCookies]);

  // Context value
  const value = {
    basketItems,
    basketCount,
    loading,
    getItemQuantity,
    addItemToBasket,
    removeItemFromBasket,
    updateItemQuantity,
    clearBasket,
    loadBasketFromCookies,
  };

  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
};

export default BasketContext;